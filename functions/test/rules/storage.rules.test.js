const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { Timestamp, doc, setDoc } = require("firebase/firestore");
const { ref, uploadBytes, getBytes } = require("firebase/storage");

let env;
const requestId = "11111111-2222-4333-8444-555555555555";
const payload = new Uint8Array([77, 65, 87, 68, 65]);

test.before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-mawda-rules",
    firestore: {
      rules: readFileSync(resolve(__dirname, "../../../firestore.rules"), "utf8"),
    },
    storage: {
      rules: readFileSync(resolve(__dirname, "../../../storage.rules"), "utf8"),
    },
  });
});

test.after(async () => {
  await env.cleanup();
});

test.beforeEach(async () => {
  await env.clearFirestore();
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "platformSettings/biometricVerification"), {
      enabled: true,
      maxAudioBytes: 1000,
      maxVideoBytes: 1000,
    });
    await setDoc(doc(db, "biometricVerificationRequests/" + requestId), {
      uid: "alice",
      requestId,
      status: "uploading",
      uploadExpiresAt: Timestamp.fromDate(new Date(Date.now() + 60_000)),
    });
  });
});

test("a member may create only their own audio/video objects for a live upload request", async () => {
  const storage = env.authenticatedContext("alice").storage();
  await assertSucceeds(uploadBytes(
    ref(storage, `biometric-verification/alice/${requestId}/audio.mp4`),
    payload,
    { contentType: "audio/mp4" },
  ));
  await assertSucceeds(uploadBytes(
    ref(storage, `biometric-verification/alice/${requestId}/video.mp4`),
    payload,
    { contentType: "video/mp4" },
  ));
  await assertFails(getBytes(
    ref(storage, `biometric-verification/alice/${requestId}/audio.mp4`),
  ));
  await assertFails(uploadBytes(
    ref(storage, `biometric-verification/bob/${requestId}/audio.mp4`),
    payload,
    { contentType: "audio/mp4" },
  ));
  await assertFails(uploadBytes(
    ref(storage, `biometric-verification/alice/${requestId}/other.mp4`),
    payload,
    { contentType: "video/mp4" },
  ));
  await assertFails(uploadBytes(
    ref(storage, "avatars/alice/avatar.png"),
    payload,
    { contentType: "image/png" },
  ));
});

test("biometric uploads reject wrong MIME types, oversized objects and anonymous users", async () => {
  const storage = env.authenticatedContext("alice").storage();
  const oversized = new Uint8Array(1001);
  await assertFails(uploadBytes(
    ref(storage, `biometric-verification/alice/${requestId}/audio.mp4`),
    payload,
    { contentType: "video/mp4" },
  ));
  await assertFails(uploadBytes(
    ref(storage, `biometric-verification/alice/${requestId}/video.mp4`),
    payload,
    { contentType: "video/webm" },
  ));
  await assertFails(uploadBytes(
    ref(storage, `biometric-verification/alice/${requestId}/audio.mp4`),
    oversized,
    { contentType: "audio/mp4" },
  ));
  const anonymous = env.unauthenticatedContext().storage();
  await assertFails(uploadBytes(
    ref(anonymous, `biometric-verification/alice/${requestId}/audio.mp4`),
    payload,
    { contentType: "audio/mp4" },
  ));
});

test("uploads stop when request is no longer uploading or its upload window expires", async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "biometricVerificationRequests/" + requestId), {
      uid: "alice",
      requestId,
      status: "pending_review",
      uploadExpiresAt: Timestamp.fromDate(new Date(Date.now() + 60_000)),
    });
  });
  const storage = env.authenticatedContext("alice").storage();
  await assertFails(uploadBytes(
    ref(storage, `biometric-verification/alice/${requestId}/audio.mp4`),
    payload,
    { contentType: "audio/mp4" },
  ));
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "biometricVerificationRequests/" + requestId), {
      uid: "alice",
      requestId,
      status: "uploading",
      uploadExpiresAt: Timestamp.fromDate(new Date(Date.now() - 60_000)),
    });
  });
  await assertFails(uploadBytes(
    ref(storage, `biometric-verification/alice/${requestId}/video.mp4`),
    payload,
    { contentType: "video/mp4" },
  ));
});

test("all other Storage objects remain denied", async () => {
  const signedIn = env.authenticatedContext("alice").storage();
  await assertFails(uploadBytes(
    ref(signedIn, "quarantine/alice/media-1"),
    payload,
  ));
  await assertFails(getBytes(ref(signedIn, "avatars/alice/avatar.png")));
});
