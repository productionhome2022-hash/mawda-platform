const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { getFirestore } = require("firebase-admin/firestore");
const {
  startGuestSession, getGuestSessionStatus, endGuestSession, listGuestPublicRooms,
  joinRoom, sendRoomMessage, getRoomMessages, setRoomAudience, sendChatMediaAttachment,
} = require("../../lib/index");

const db = getFirestore();
const suffix = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const guestRequest = (uid, data = {}) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "anonymous" } } },
});

test("guest onboarding stores no age and grants only active all-ages public-room text access", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `guest_runtime_${suffix()}`;
  const roomId = `guest_public_${suffix()}`;
  const adultRoomId = `guest_adult_${suffix()}`;
  const privateRoomId = `guest_private_${suffix()}`;
  const ownerUid = `room_owner_${suffix()}`;
  const audioMediaId = randomUUID();
  const imageMediaId = randomUUID();
  const roomIds = [roomId, adultRoomId, privateRoomId];
  const roomRef = (id) => db.collection("rooms").doc(id);
  const guestProfileRef = db.collection("guestProfiles").doc(uid);
  const guestSessionRef = db.collection("guestSessions").doc(uid);
  const userRef = db.collection("users").doc(uid);
  try {
    await Promise.all([
      roomRef(roomId).set({ name: "Guest-safe public", status: "active", kind: "public", audience: "adult", guestAudienceApproved: false, ownerUid, capacity: 20, memberCount: 0 }),
      roomRef(adultRoomId).set({ name: "Adult only", status: "active", kind: "public", audience: "adult", capacity: 20, memberCount: 0 }),
      roomRef(privateRoomId).set({ name: "Private", status: "active", kind: "private", audience: "all_ages", guestAudienceApproved: true, capacity: 20, memberCount: 0 }),
    ]);
    await assert.rejects(
      () => setRoomAudience.run({
        data: { roomId, audience: "all_ages", confirmGeneralAudienceModeration: true },
        auth: { uid: "not_the_owner", token: { firebase: { sign_in_provider: "password" } } },
      }),
      (error) => error && error.code === "permission-denied",
    );
    const audienceUpdate = await setRoomAudience.run({
      data: { roomId, audience: "all_ages", confirmGeneralAudienceModeration: true },
      auth: { uid: ownerUid, token: { firebase: { sign_in_provider: "password" } } },
    });
    assert.equal(audienceUpdate.guestAudienceApproved, true);

    const started = await startGuestSession.run(guestRequest(uid, {
      username: "guest-test-user", country: "CH", gender: "female", age: 18, dateOfBirth: "2008-01-01",
    }));
    assert.equal(started.active, true);
    assert.equal(started.idempotentReplay, false);
    const profile = (await guestProfileRef.get()).data();
    assert.equal(profile.username, "guest-test-user");
    assert.equal(profile.country, "CH");
    assert.equal(profile.gender, "female");
    assert.equal(Object.hasOwn(profile, "age"), false);
    assert.equal(Object.hasOwn(profile, "dateOfBirth"), false);
    assert.equal((await userRef.get()).exists, false);

    const status = await getGuestSessionStatus.run(guestRequest(uid));
    assert.equal(status.active, true);
    assert.equal(status.hasProfile, true);
    const listed = await listGuestPublicRooms.run(guestRequest(uid));
    assert.ok(listed.rooms.some((room) => room.roomId === roomId));
    assert.equal(listed.rooms.some((room) => room.roomId === adultRoomId), false);
    assert.equal(listed.rooms.some((room) => room.roomId === privateRoomId), false);

    await joinRoom.run(guestRequest(uid, { roomId }));
    await assert.rejects(
      () => joinRoom.run(guestRequest(uid, { roomId: adultRoomId })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => joinRoom.run(guestRequest(uid, { roomId: privateRoomId })),
      (error) => error && error.code === "permission-denied",
    );

    const message = await sendRoomMessage.run(guestRequest(uid, {
      roomId, content: "مرحباً بالجميع", clientMessageId: "guest_msg_0001",
    }));
    assert.equal(message.idempotentReplay, false);
    const replay = await sendRoomMessage.run(guestRequest(uid, {
      roomId, content: "مرحباً بالجميع", clientMessageId: "guest_msg_0001",
    }));
    assert.equal(replay.idempotentReplay, true);
    const read = await getRoomMessages.run(guestRequest(uid, { roomId }));
    assert.ok(read.messages.some((item) => item.content === "مرحباً بالجميع"));

    const safeAudioAsset = {
      mediaId: audioMediaId, ownerUid: uid, uploaderType: "guest", uploaderRole: "guest",
      mediaPurpose: "room", mediaCategory: "audio", detectedContentType: "audio/mpeg",
      status: "security_approved", processingStatus: "safe_audio_derivative_ready",
      safeAudioPath: `processed/${uid}/${audioMediaId}/audio.mp3`,
      safeAudioGeneration: "1", safeAudioSha256: "a".repeat(64),
      processingPipelineVersion: "ffmpeg-audio-transcode-v1",
    };
    await db.collection("mediaAssets").doc(audioMediaId).set(safeAudioAsset);
    const audioSend = await sendChatMediaAttachment.run(guestRequest(uid, {
      scope: "room", roomId, mediaId: audioMediaId, clientMessageId: "guest_audio_0001",
    }));
    assert.equal(audioSend.replayed, false);
    const afterAudio = await getRoomMessages.run(guestRequest(uid, { roomId }));
    assert.ok(afterAudio.messages.some((item) => item.mediaId === audioMediaId && item.mediaCategory === "audio"));

    const unsafeImageAsset = {
      ...safeAudioAsset, mediaId: imageMediaId, mediaCategory: "image",
      detectedContentType: "image/jpeg", uploaderRole: "guest",
      processingStatus: "safe_raster_derivative_ready",
      safePreviewPath: `processed/${uid}/${imageMediaId}/preview.webp`,
      safePreviewGeneration: "1", safePreviewSha256: "b".repeat(64),
      processingPipelineVersion: "sharp-decode-reencode-v1",
    };
    delete unsafeImageAsset.safeAudioPath;
    delete unsafeImageAsset.safeAudioGeneration;
    delete unsafeImageAsset.safeAudioSha256;
    await db.collection("mediaAssets").doc(imageMediaId).set(unsafeImageAsset);
    await assert.rejects(
      () => sendChatMediaAttachment.run(guestRequest(uid, {
        scope: "room", roomId, mediaId: imageMediaId, clientMessageId: "guest_image_0001",
      })),
      (error) => error && (error.code === "permission-denied" || error.code === "failed-precondition"),
    );

    await endGuestSession.run(guestRequest(uid));
    await assert.rejects(
      () => sendRoomMessage.run(guestRequest(uid, {
        roomId, content: "رسالة بعد الإنهاء", clientMessageId: "guest_msg_0002",
      })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => startGuestSession.run(guestRequest(uid, {
        username: "guest-test-user", country: "CH", gender: "female",
      })),
      (error) => error && error.code === "resource-exhausted",
    );
  } finally {
    await Promise.all([
      guestProfileRef.delete().catch(() => undefined),
      guestSessionRef.delete().catch(() => undefined),
      userRef.delete().catch(() => undefined),
      db.collection("mediaAssets").doc(audioMediaId).delete().catch(() => undefined),
      db.collection("mediaAssets").doc(imageMediaId).delete().catch(() => undefined),
      ...roomIds.map(async (id) => {
        const members = await roomRef(id).collection("members").get();
        const messages = await roomRef(id).collection("messages").get();
        const batch = db.batch();
        members.docs.forEach((doc) => batch.delete(doc.ref));
        messages.docs.forEach((doc) => batch.delete(doc.ref));
        batch.delete(roomRef(id));
        await batch.commit();
      }),
    ]);
  }
});
