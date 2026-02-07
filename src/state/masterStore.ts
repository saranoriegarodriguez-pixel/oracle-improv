// src/state/masterStore.ts
const KEY_MASTER = "oracle.master.enabled.v1";

export function isLocalDev() {
  const host = window.location.hostname;
  const localHost = host === "localhost" || host === "127.0.0.1";
  return import.meta.env.DEV && localHost;
}

export function loadMasterEnabled() {
  try {
    return localStorage.getItem(KEY_MASTER) === "1";
  } catch {
    return false;
  }
}

export function setMasterEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY_MASTER, on ? "1" : "0");
  } catch {}
  return on;
}
