const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateMawddaMediaPlaneConfig,
  evaluateMawddaMediaPlaneReadiness,
} = require("../lib/mawdda-media-plane");

const config = {
  owner: "mawdda",
  deploymentId: "mawdda_sfu_2026",
  sfuEndpoint: "wss://media.mawdda.example/sfu",
  turnUrls: ["turns:turn.mawdda.example:5349"],
  turnCredentialSecretRef: "secret-manager/mawdda-turn",
  enabled: true,
};
const health = {
  deploymentId: config.deploymentId,
  checkedAtMs: 100_000,
  sfuReachable: true,
  turnReachable: true,
  certificateValid: true,
  capacityAvailable: true,
};

test("accepts only Mawdda-owned secure SFU/TURN configuration with secret references", () => {
  assert.equal(validateMawddaMediaPlaneConfig(config).owner, "mawdda");
  assert.throws(() => validateMawddaMediaPlaneConfig({
    ...config, sfuEndpoint: "http://media.example/sfu",
  }), /MAWDDA_MEDIA_PLANE_CONFIG_INVALID/);
  assert.throws(() => validateMawddaMediaPlaneConfig({
    ...config, turnUrls: ["turn:turn.example:3478"],
  }), /MAWDDA_MEDIA_PLANE_CONFIG_INVALID/);
  assert.throws(() => validateMawddaMediaPlaneConfig({
    ...config, turnUrls: ["turns:turn.example:0"],
  }), /MAWDDA_MEDIA_PLANE_CONFIG_INVALID/);
  assert.throws(() => validateMawddaMediaPlaneConfig({
    ...config, turnUrls: ["turns:turn.example:65536"],
  }), /MAWDDA_MEDIA_PLANE_CONFIG_INVALID/);
  assert.throws(() => validateMawddaMediaPlaneConfig({
    ...config, turnUrls: ["turns:bad..example:5349"],
  }), /MAWDDA_MEDIA_PLANE_CONFIG_INVALID/);
  assert.equal(validateMawddaMediaPlaneConfig({
    ...config, turnUrls: ["turns:turn.example:65535?transport=tcp"],
  }).turnUrls[0], "turns:turn.example:65535?transport=tcp");
  assert.throws(() => validateMawddaMediaPlaneConfig({
    ...config, sfuEndpoint: "wss://user:password@media.example/sfu",
  }), /MAWDDA_MEDIA_PLANE_CONFIG_INVALID/);
  assert.throws(() => validateMawddaMediaPlaneConfig({
    ...config, turnCredentialSecretRef: "plain-secret-value",
  }), /MAWDDA_MEDIA_PLANE_CONFIG_INVALID/);
  for (const secretRef of [
    "/secret-manager/mawdda-turn",
    "secret-manager/mawdda-turn/",
    "secret-manager//mawdda-turn",
    "secret-manager/../mawdda-turn",
    "secret-manager/./mawdda-turn",
  ]) {
    assert.throws(() => validateMawddaMediaPlaneConfig({
      ...config, turnCredentialSecretRef: secretRef,
    }), /MAWDDA_MEDIA_PLANE_CONFIG_INVALID/);
  }
  assert.throws(() => validateMawddaMediaPlaneConfig({
    ...config, turnUrls: [config.turnUrls[0], config.turnUrls[0]],
  }), /MAWDDA_MEDIA_PLANE_CONFIG_INVALID/);
});

test("does not declare readiness from configuration without live health evidence", () => {
  const result = evaluateMawddaMediaPlaneReadiness({
    config, health: null, nowMs: 100_000,
  });
  assert.equal(result.ready, false);
  assert.ok(result.reasons.includes("missing_health"));
});

test("requires fresh deployment-bound SFU, TURN, TLS and capacity health", () => {
  assert.deepEqual(evaluateMawddaMediaPlaneReadiness({
    config, health, nowMs: 110_000,
  }), {
    ready: true, deploymentId: config.deploymentId, checkedAtMs: 100_000,
  });
  const failed = evaluateMawddaMediaPlaneReadiness({
    config,
    health: { ...health, turnReachable: false, certificateValid: false },
    nowMs: 110_000,
  });
  assert.equal(failed.ready, false);
  assert.ok(failed.reasons.includes("turn_unreachable"));
  assert.ok(failed.reasons.includes("certificate_invalid"));
});

test("rejects stale, future-dated and cross-deployment health evidence", () => {
  for (const altered of [
    { ...health, checkedAtMs: 1 },
    { ...health, checkedAtMs: 100_001 },
    { ...health, deploymentId: "another_sfu_2026" },
  ]) {
    const result = evaluateMawddaMediaPlaneReadiness({
      config, health: altered, nowMs: 100_000,
    });
    assert.equal(result.ready, false);
  }
});

test("disabled media plane remains unavailable even when every health check passes", () => {
  const result = evaluateMawddaMediaPlaneReadiness({
    config: { ...config, enabled: false }, health, nowMs: 100_000,
  });
  assert.equal(result.ready, false);
  assert.ok(result.reasons.includes("disabled"));
});
