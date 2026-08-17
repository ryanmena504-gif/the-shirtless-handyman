/**
 * Instant coach audio. Games do not wait on HTMLAudioElement.
 * Decode into an AudioBuffer and start() on a gesture-unlocked context.
 * IndexedDB keeps MP3s across visits so Cole is already in the room.
 */

const DB_NAME = "viewtube-voice";
const STORE = "mp3";
const bufferCache = new Map();

let audioCtx = null;
let currentSource = null;
let fallbackEl = null;

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function idbGetMp3(key) {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

export async function idbPutMp3(key, blob) {
  const db = await openDb();
  if (!db || !blob) return;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

export function unlockViewTubeVoice() {
  const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function stopViewTubeVoice() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // already stopped
    }
    currentSource = null;
  }
  if (fallbackEl) {
    fallbackEl.pause();
  }
}

export async function playViewTubeUrl(url) {
  if (!url) return;
  const ctx = unlockViewTubeVoice();
  if (!ctx) {
    if (!fallbackEl) fallbackEl = new Audio();
    fallbackEl.src = url;
    await fallbackEl.play();
    return;
  }

  let buffer = bufferCache.get(url);
  if (!buffer) {
    const res = await fetch(url);
    const raw = await res.arrayBuffer();
    buffer = await ctx.decodeAudioData(raw.slice(0));
    bufferCache.set(url, buffer);
  }

  stopViewTubeVoice();
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);
  src.start();
  currentSource = src;
  src.onended = () => {
    if (currentSource === src) currentSource = null;
  };
}
