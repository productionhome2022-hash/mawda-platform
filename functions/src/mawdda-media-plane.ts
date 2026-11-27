/**
 * Mawdda-owned real-time media-plane contract.
 *
 * This module validates the control-plane configuration and health evidence
 * for a self-managed SFU/TURN deployment. It does not pretend that signaling
 * or Firebase alone transports media, and it never provisions infrastructure.
 */
export interface MawddaMediaPlaneConfig {
  owner: "mawdda";
  deploymentId: string;
  sfuEndpoint: string;
  turnUrls: string[];
  turnCredentialSecretRef: string;
  enabled: boolean;
}

export interface MawddaMediaPlaneHealth {
  deploymentId: string;
  checkedAtMs: number;
  sfuReachable: boolean;
  turnReachable: boolean;
  certificateValid: boolean;
  capacityAvailable: boolean;
}

export type MawddaMediaPlaneReadiness =
  | { ready: true; deploymentId: string; checkedAtMs: number }
  | {
      ready: false;
      deploymentId: string | null;
      checkedAtMs: number | null;
      reasons: Array<
        | "disabled"
        | "invalid_config"
        | "missing_health"
        | "stale_health"
        | "deployment_mismatch"
        | "sfu_unreachable"
        | "turn_unreachable"
        | "certificate_invalid"
        | "capacity_unavailable"
      >;
    };

const HEALTH_MAX_AGE_MS = 30_000;

function isSecureMediaUrl(value: unknown, protocols: string[]): value is string {
  if (typeof value !== "string" || value.length > 2048 ||
      value.trim() !== value || /[\s\u0000-\u001f]/.test(value)) return false;

  // TURN URIs are opaque RFC 7065 URIs, not hierarchical URLs. The WHATWG
  // URL parser treats "turns:host:port" as an opaque path and yields no host.
  if (protocols.length === 1 && protocols[0] === "turns:") {
    return /^turns:[A-Za-z0-9.-]+(?::[0-9]{1,5})?(?:\?transport=tcp)?$/i.test(value);
  }

  try {
    const url = new URL(value);
    return protocols.includes(url.protocol) && Boolean(url.hostname) &&
      !url.username && !url.password && !url.hash &&
      (url.protocol !== "wss:" || !url.search);
  } catch {
    return false;
  }
}

/** Secrets are referenced, never embedded in configuration or health payloads. */
export function validateMawddaMediaPlaneConfig(value: unknown): MawddaMediaPlaneConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("MAWDDA_MEDIA_PLANE_CONFIG_INVALID");
  }
  const input = value as Record<string, unknown>;
  if (input.owner !== "mawdda" ||
      typeof input.deploymentId !== "string" ||
      !/^[A-Za-z0-9_-]{8,100}$/.test(input.deploymentId) ||
      !isSecureMediaUrl(input.sfuEndpoint, ["wss:"]) ||
      !Array.isArray(input.turnUrls) || input.turnUrls.length < 1 ||
      input.turnUrls.length > 8 ||
      !input.turnUrls.every((url) => isSecureMediaUrl(url, ["turns:"])) ||
      typeof input.turnCredentialSecretRef !== "string" ||
      !/^[A-Za-z0-9_./-]{3,200}$/.test(input.turnCredentialSecretRef) ||
      !input.turnCredentialSecretRef.includes("/") ||
      typeof input.enabled !== "boolean") {
    throw new Error("MAWDDA_MEDIA_PLANE_CONFIG_INVALID");
  }
  return {
    owner: "mawdda",
    deploymentId: input.deploymentId,
    sfuEndpoint: input.sfuEndpoint,
    turnUrls: [...input.turnUrls] as string[],
    turnCredentialSecretRef: input.turnCredentialSecretRef,
    enabled: input.enabled,
  };
}

/**
 * Readiness is fail-closed. A valid config alone never proves media transport;
 * health must be fresh, deployment-bound, and prove SFU, TURN, TLS and capacity.
 */
export function evaluateMawddaMediaPlaneReadiness(args: {
  config: unknown;
  health: unknown;
  nowMs: number;
}): MawddaMediaPlaneReadiness {
  if (!Number.isSafeInteger(args.nowMs) || args.nowMs < 0) {
    throw new Error("MAWDDA_MEDIA_PLANE_CLOCK_INVALID");
  }
  let config: MawddaMediaPlaneConfig;
  try {
    config = validateMawddaMediaPlaneConfig(args.config);
  } catch {
    return {
      ready: false, deploymentId: null, checkedAtMs: null,
      reasons: ["invalid_config"],
    };
  }
  const reasons: Array<"disabled" | "invalid_config" | "missing_health" | "stale_health" | "deployment_mismatch" | "sfu_unreachable" | "turn_unreachable" | "certificate_invalid" | "capacity_unavailable"> = [];
  if (!config.enabled) reasons.push("disabled");
  const health = args.health;
  if (!health || typeof health !== "object" || Array.isArray(health)) {
    reasons.push("missing_health");
  } else {
    const status = health as Record<string, unknown>;
    const checkedAtMs = status.checkedAtMs;
    if (!Number.isSafeInteger(checkedAtMs) ||
        (checkedAtMs as number) > args.nowMs ||
        args.nowMs - (checkedAtMs as number) > HEALTH_MAX_AGE_MS) {
      reasons.push("stale_health");
    }
    if (status.deploymentId !== config.deploymentId) reasons.push("deployment_mismatch");
    if (status.sfuReachable !== true) reasons.push("sfu_unreachable");
    if (status.turnReachable !== true) reasons.push("turn_unreachable");
    if (status.certificateValid !== true) reasons.push("certificate_invalid");
    if (status.capacityAvailable !== true) reasons.push("capacity_unavailable");
  }
  if (reasons.length > 0) {
    const status = health && typeof health === "object" && !Array.isArray(health)
      ? health as Record<string, unknown> : {};
    return {
      ready: false,
      deploymentId: config.deploymentId,
      checkedAtMs: Number.isSafeInteger(status.checkedAtMs) ? status.checkedAtMs as number : null,
      reasons,
    };
  }
  return {
    ready: true,
    deploymentId: config.deploymentId,
    checkedAtMs: (health as MawddaMediaPlaneHealth).checkedAtMs,
  };
}
