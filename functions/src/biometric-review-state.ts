import { addCalendarMonthsUtc } from "./verification-calendar";

export const BIOMETRIC_MAX_ATTEMPTS = 3;
export const BIOMETRIC_RETRY_WAIT_MONTHS = 1;

export type BiometricReviewStatus = "pending" | "accepted" | "rejected" | "closed";
export interface BiometricReviewState {
  requestId: string; uid: string; status: BiometricReviewStatus; attemptNumber: number;
  submittedAtMs: number; decidedAtMs: number | null; decidedByUid: string | null;
  nextEligibleAtMs: number | null; finalRejection: boolean;
}
function validClock(value: number): boolean { return Number.isSafeInteger(value) && value >= 0; }
function validIdentity(value: string): boolean { return typeof value === "string" && /^[A-Za-z0-9._:@-]{8,128}$/.test(value); }
function validateState(state: BiometricReviewState): void {
  if (!state || typeof state !== "object" || !/^[A-Za-z0-9_-]{16,128}$/.test(state.requestId) ||
      !validIdentity(state.uid) || !Number.isSafeInteger(state.attemptNumber) || state.attemptNumber < 1 ||
      state.attemptNumber > BIOMETRIC_MAX_ATTEMPTS || !validClock(state.submittedAtMs) ||
      !["pending", "accepted", "rejected", "closed"].includes(state.status)) {
    throw new Error("BIOMETRIC_REVIEW_STATE_INVALID");
  }
  if (state.status === "pending") {
    if (state.decidedAtMs !== null || state.decidedByUid !== null ||
        state.nextEligibleAtMs !== null || state.finalRejection !== false) {
      throw new Error("BIOMETRIC_REVIEW_STATE_INVALID");
    }
    return;
  }
  if (!validClock(state.decidedAtMs as number) || (state.decidedAtMs as number) < state.submittedAtMs ||
      !validIdentity(state.decidedByUid as string) || state.decidedByUid === state.uid) {
    throw new Error("BIOMETRIC_REVIEW_STATE_INVALID");
  }
  if (state.status === "accepted" &&
      (state.nextEligibleAtMs !== null || state.finalRejection !== false)) {
    throw new Error("BIOMETRIC_REVIEW_STATE_INVALID");
  }
  if (state.status === "rejected" &&
      (state.attemptNumber >= BIOMETRIC_MAX_ATTEMPTS || !validClock(state.nextEligibleAtMs as number) ||
       state.nextEligibleAtMs !== addCalendarMonthsUtc(state.decidedAtMs as number, BIOMETRIC_RETRY_WAIT_MONTHS) ||
       state.finalRejection !== false)) {
    throw new Error("BIOMETRIC_REVIEW_STATE_INVALID");
  }
  if (state.status === "closed" &&
      (state.attemptNumber !== BIOMETRIC_MAX_ATTEMPTS || state.nextEligibleAtMs !== null ||
       state.finalRejection !== true)) {
    throw new Error("BIOMETRIC_REVIEW_STATE_INVALID");
  }
}
export function createInitialBiometricReview(input: {requestId:string;uid:string;submittedAtMs:number}): BiometricReviewState {
 const state:BiometricReviewState={requestId:input.requestId,uid:input.uid,status:"pending",attemptNumber:1,submittedAtMs:input.submittedAtMs,decidedAtMs:null,decidedByUid:null,nextEligibleAtMs:null,finalRejection:false};
 validateState(state); return state;
}
export function decideBiometricReview(input:{state:BiometricReviewState;decision:"accepted"|"rejected";reviewerUid:string;decidedAtMs:number}):BiometricReviewState {
 const {state,decision,reviewerUid,decidedAtMs}=input; validateState(state);
 if(state.status!=="pending"||!validIdentity(reviewerUid)||reviewerUid===state.uid||!validClock(decidedAtMs)||decidedAtMs<state.submittedAtMs) throw new Error("BIOMETRIC_REVIEW_DECISION_INVALID");
 if(decision==="accepted") return {...state,status:"accepted",decidedAtMs,decidedByUid:reviewerUid,nextEligibleAtMs:null,finalRejection:false};
 const finalRejection=state.attemptNumber===BIOMETRIC_MAX_ATTEMPTS;
 return {...state,status:finalRejection?"closed":"rejected",decidedAtMs,decidedByUid:reviewerUid,nextEligibleAtMs:finalRejection?null:addCalendarMonthsUtc(decidedAtMs,BIOMETRIC_RETRY_WAIT_MONTHS),finalRejection};
}
export function startBiometricRetry(input:{state:BiometricReviewState;nextRequestId:string;submittedAtMs:number}):BiometricReviewState {
 const {state,nextRequestId,submittedAtMs}=input; validateState(state);
 if(state.status!=="rejected"||state.finalRejection||state.attemptNumber>=BIOMETRIC_MAX_ATTEMPTS||state.nextEligibleAtMs===null||!validClock(submittedAtMs)||submittedAtMs<state.nextEligibleAtMs||! /^[A-Za-z0-9_-]{16,128}$/.test(nextRequestId)||nextRequestId===state.requestId) throw new Error("BIOMETRIC_RETRY_NOT_ELIGIBLE");
 return {requestId:nextRequestId,uid:state.uid,status:"pending",attemptNumber:state.attemptNumber+1,submittedAtMs,decidedAtMs:null,decidedByUid:null,nextEligibleAtMs:null,finalRejection:false};
}
