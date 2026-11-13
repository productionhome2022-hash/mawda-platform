import { createHmac, timingSafeEqual } from "node:crypto";

export interface ScannerVerdictPayload {
  mediaId: string;
  provider: string;
  engine: string;
  engineVersion: string;
  signatureVersion: string;
  verdict: "clean" | "malicious" | "error";
  objectGeneration: string;
  sha256: string;
  scannedAtMs: number;
}

export function verifyScannerWebhook(
  rawBody: Buffer,
  suppliedSignature: string | undefined,
  secret: string | undefined,
): boolean {
  if (!secret || secret.length < 32 || !suppliedSignature ||
      !/^[a-f0-9]{64}$/i.test(suppliedSignature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const supplied = Buffer.from(suppliedSignature, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function validateScannerVerdict(
  value: unknown,
  expectedProvider: string,
  nowMs = Date.now(),
): ScannerVerdictPayload | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.mediaId !== "string" || !/^[0-9a-f-]{36}$/i.test(v.mediaId) ||
      v.provider !== expectedProvider ||
      typeof v.engine !== "string" || v.engine.length < 2 || v.engine.length > 80 ||
      typeof v.engineVersion !== "string" || v.engineVersion.length < 1 || v.engineVersion.length > 80 ||
      typeof v.signatureVersion !== "string" || v.signatureVersion.length < 1 || v.signatureVersion.length > 120 ||
      !["clean", "malicious", "error"].includes(String(v.verdict)) ||
      typeof v.objectGeneration !== "string" || !/^\d+$/.test(v.objectGeneration) ||
      typeof v.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(v.sha256) ||
      !Number.isSafeInteger(v.scannedAtMs) ||
      Math.abs(nowMs - Number(v.scannedAtMs)) > 10 * 60 * 1000) return null;
  return v as unknown as ScannerVerdictPayload;
}
