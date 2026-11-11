const test = require("node:test");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const {
  initializeTestEnvironment,
  assertFails,
} = require("@firebase/rules-unit-testing");
const { ref, uploadBytes, getBytes } = require("firebase/storage");

let env;

test.before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-mawda-rules",
    storage: {
      rules: readFileSync(resolve(__dirname, "../../../storage.rules"), "utf8"),
    },
  });
});

test.after(async () => {
  await env.cleanup();
});

test("Storage denies uploads and downloads for signed-in and anonymous clients", async () => {
  const payload = new Uint8Array([77, 65, 87, 68, 65]);
  const signedInStorage = env.authenticatedContext("alice").storage();
  const anonymousStorage = env.unauthenticatedContext().storage();

  await assertFails(
    uploadBytes(ref(signedInStorage, "avatars/alice/avatar.png"), payload),
  );
  await assertFails(
    getBytes(ref(signedInStorage, "avatars/alice/avatar.png")),
  );
  await assertFails(
    uploadBytes(ref(anonymousStorage, "avatars/anonymous/avatar.png"), payload),
  );
});
