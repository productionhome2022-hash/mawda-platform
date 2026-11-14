const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { getFirestore } = require("firebase-admin/firestore");
const {
  startGuestSession, getGuestSessionStatus, endGuestSession, listGuestPublicRooms,
  joinRoom, sendRoomMessage, getRoomMessages, setRoomAudience, sendChatMediaAttachment,
  sendDirectMessage, purchaseStoreItem, setMemberBlock, createMediaUploadIntent,
  transferCoins, listRoomEvents, createRoomEvent,
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
  const unapprovedRoomId = `guest_unapproved_${suffix()}`;
  const ownerUid = emailUid;
  const audioMediaId = randomUUID();
  const imageMediaId = randomUUID();
  const memberAudioMediaId = randomUUID();
  const guestPersonaRef = db.collection("testAccountProfiles").doc("guest-preview");
  const previousGuestPersona = await guestPersonaRef.get();
  const emailPersona = await db.collection("testAccountProfiles").doc("email-member").get();
  const counterPersona = await db.collection("testAccountProfiles").doc("counterparty-member").get();
  assert.ok(emailPersona.exists, "email-member persona must be seeded");
  assert.ok(counterPersona.exists, "counterparty-member persona must be seeded");
  const emailUid = emailPersona.data().uid;
  const counterUid = counterPersona.data().uid;
  const roomIds = [roomId, adultRoomId, privateRoomId, unapprovedRoomId];
  const roomRef = (id) => db.collection("rooms").doc(id);
  const guestProfileRef = db.collection("guestProfiles").doc(uid);
  const guestSessionRef = db.collection("guestSessions").doc(uid);
  const userRef = db.collection("users").doc(uid);
  try {
    await Promise.all([
      roomRef(roomId).set({ name: "Guest-safe public", status: "active", kind: "public", audience: "adult", guestAudienceApproved: false, ownerUid, capacity: 20, memberCount: 0 }),
      roomRef(adultRoomId).set({ name: "Adult only", status: "active", kind: "public", audience: "adult", capacity: 20, memberCount: 0 }),
      roomRef(privateRoomId).set({ name: "Private", status: "active", kind: "private", audience: "all_ages", guestAudienceApproved: true, capacity: 20, memberCount: 0 }),
      roomRef(unapprovedRoomId).set({ name: "Unapproved", status: "active", kind: "public", audience: "all_ages", guestAudienceApproved: false, capacity: 20, memberCount: 0 }),
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

    await guestPersonaRef.set({
      uid, runtimeStatus: "active-test-only", accountKind: "anonymous-client-flow",
      profile: { username: "guest-test-user", country: "CH", gender: "female" },
    }, { merge: true });
    await Promise.all([
      joinRoom.run({ data: { roomId }, auth: { uid: emailUid, token: { firebase: { sign_in_provider: "password" } } } }),
      joinRoom.run({ data: { roomId }, auth: { uid: counterUid, token: { firebase: { sign_in_provider: "password" } } } }),
    ]);
    await assert.rejects(
      () => startGuestSession.run({
        data: { username: "not-a-guest", country: "CH", gender: "male" },
        auth: { uid: "member_provider", token: { firebase: { sign_in_provider: "password" } } },
      }),
      (error) => error && error.code === "permission-denied",
    );
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
    await assert.rejects(
      () => sendDirectMessage.run(guestRequest(uid, {
        recipientUid: "member_target_fixture",
        text: "رسالة خاصة ممنوعة للزائر",
        clientMessageId: "guest_dm_0001",
      })),
      (error) => error && (error.code === "not-found" || error.code === "permission-denied"),
    );
    await assert.rejects(
      () => purchaseStoreItem.run(guestRequest(uid, {
        itemId: "vip_badge_test", requestId: "guest_purchase_0001", expectedPriceCoins: 10,
      })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => transferCoins.run(guestRequest(uid, {
        recipientUid: emailUid, amount: 10, requestId: "guest_transfer_0001", expectedCommissionBps: 1000,
      })),
      (error) => error && (error.code === "permission-denied" || error.code === "failed-precondition"),
    );
    await assert.rejects(
      () => listRoomEvents.run(guestRequest(uid, { roomId })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => createRoomEvent.run(guestRequest(uid, {
        roomId, title: "Guest event", description: "Not allowed", eventType: "watch_party",
        startsAtMs: Date.now() + 60 * 60 * 1000, durationMinutes: 30,
      })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => setMemberBlock.run(guestRequest(uid, { targetUid: "member_target_fixture", blocked: true })),
      (error) => error && (error.code === "failed-precondition" || error.code === "permission-denied"),
    );

    const replayedStart = await startGuestSession.run(guestRequest(uid, {
      username: "guest-test-user", country: "CH", gender: "female",
    }));
    assert.equal(replayedStart.idempotentReplay, true);
    const status = await getGuestSessionStatus.run(guestRequest(uid));
    assert.equal(status.active, true);
    assert.equal(status.hasProfile, true);
    const listed = await listGuestPublicRooms.run(guestRequest(uid));
    assert.ok(listed.rooms.some((room) => room.roomId === roomId));
    assert.equal(listed.rooms.some((room) => room.roomId === adultRoomId), false);
    assert.equal(listed.rooms.some((room) => room.roomId === privateRoomId), false);
    assert.equal(listed.rooms.some((room) => room.roomId === unapprovedRoomId), false);

    await joinRoom.run(guestRequest(uid, { roomId }));
    const memberText = await sendRoomMessage.run({
      data: { roomId, content: "رسالة من عضو البريد التجريبي", clientMessageId: "member_msg_0001" },
      auth: { uid: emailUid, token: { firebase: { sign_in_provider: "password" } } },
    });
    assert.equal(memberText.idempotentReplay, false);
    await sendRoomMessage.run({
      data: { roomId, content: "رسالة من العضو المقابل التجريبي", clientMessageId: "counter_msg_0001" },
      auth: { uid: counterUid, token: { firebase: { sign_in_provider: "password" } } },
    });
    const memberToGuestDm = {
      data: { recipientUid: uid, text: "خاص إلى الزائر", clientMessageId: "member_guest_dm_0001" },
      auth: { uid: emailUid, token: { firebase: { sign_in_provider: "password" } } },
    };
    await assert.rejects(() => sendDirectMessage.run(memberToGuestDm),
      (error) => error && (error.code === "not-found" || error.code === "permission-denied"));
    await assert.rejects(
      () => joinRoom.run(guestRequest(uid, { roomId: adultRoomId })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => joinRoom.run(guestRequest(uid, { roomId: unapprovedRoomId })),
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
    const memberRead = await getRoomMessages.run({
      data: { roomId }, auth: { uid: emailUid, token: { firebase: { sign_in_provider: "password" } } },
    });
    assert.ok(memberRead.messages.some((item) => item.content === "مرحباً بالجميع"));

    const memberAudioAsset = {
      mediaId: memberAudioMediaId, ownerUid: emailUid, uploaderType: "member", uploaderRole: "member",
      mediaPurpose: "room", mediaCategory: "audio", detectedContentType: "audio/mpeg",
      status: "security_approved", processingStatus: "safe_audio_derivative_ready",
      safeAudioPath: `processed/${emailUid}/${memberAudioMediaId}/audio.mp3`,
      safeAudioGeneration: "1", safeAudioSha256: "c".repeat(64),
      processingPipelineVersion: "ffmpeg-audio-transcode-v1",
    };
    await db.collection("mediaAssets").doc(memberAudioMediaId).set(memberAudioAsset);
    await sendChatMediaAttachment.run({
      data: { scope: "room", roomId, mediaId: memberAudioMediaId, clientMessageId: "member_audio_0001" },
      auth: { uid: emailUid, token: { firebase: { sign_in_provider: "password" } } },
    });

    await assert.rejects(
      () => createMediaUploadIntent.run(guestRequest(uid, {
        originalName: "guest-photo.png", contentType: "image/png",
        sizeBytes: 128, purpose: "room",
      })),
      (error) => error && error.code === "permission-denied",
    );

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
    assert.ok(afterAudio.messages.some((item) => item.mediaId === memberAudioMediaId && item.mediaCategory === "audio"));
    assert.ok(afterAudio.messages.some((item) => item.content === "رسالة من عضو البريد التجريبي"));
    assert.ok(afterAudio.messages.some((item) => item.content === "رسالة من العضو المقابل التجريبي"));

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
    assert.equal((await roomRef(roomId).collection("members").doc(uid).get()).exists, false);
    assert.equal((await roomRef(roomId).get()).data().memberCount, 2);
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
      db.collection("mediaAssets").doc(memberAudioMediaId).delete().catch(() => undefined),
      previousGuestPersona.exists ? guestPersonaRef.set(previousGuestPersona.data()) : guestPersonaRef.delete().catch(() => undefined),
      db.collection("roomAuditLogs").where("roomId", "in", roomIds).get().then((snapshot) =>
        Promise.all(snapshot.docs.map((doc) => doc.ref.delete()))),
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
