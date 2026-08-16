import axios from "axios";
import { idbGetMp3, idbPutMp3 } from "./viewtubeVoice";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const INSTANT = {
  looking: "Looking.",
  sawThat: "Hold. I saw that.",
  lost: "I lost the bench. Tip the phone down.",
  found: "Got you. Keep going.",
  face: "I see you, not the work. Point me at the bench.",
};

export const LOOKING_LINE = INSTANT.looking;
export const SAW_THAT_LINE = INSTANT.sawThat;

export const VIEWTUBE = {
  name: "viewTube",
  tagline: "YouTube shows you how. viewTube watches you do it.",
  promise:
    "The phone watches motion. The cloud only looks when something changes. Charming. Strict. Stops you before the board goes on backwards.",
};

const speakCache = new Map();
const speakInflight = new Map();

export function speakCacheKey(coachId, text) {
  return `${coachId}|${String(text || "").trim()}`;
}

export function peekViewTubeSpeakCache(coachId, text) {
  return speakCache.get(speakCacheKey(coachId, text)) || "";
}

export function clearViewTubeSpeakCache() {
  for (const url of speakCache.values()) {
    URL.revokeObjectURL(url);
  }
  speakCache.clear();
  speakInflight.clear();
}

export async function fetchViewTubeCatalog() {
  const { data } = await axios.get(`${API}/viewtube/catalog`);
  return data;
}

export async function createViewTubeSession(coachId, projectId) {
  const { data } = await axios.post(`${API}/viewtube/sessions`, {
    coach_id: coachId,
    project_id: projectId,
  });
  return data;
}

export async function fetchViewTubeSession(sessionId) {
  const { data } = await axios.get(`${API}/viewtube/sessions/${sessionId}`);
  return data;
}

export async function postViewTubeEvent(sessionId, type, signals = {}, frame = "", frameRef = "") {
  const { data } = await axios.post(`${API}/viewtube/sessions/${sessionId}/events`, {
    type,
    signals,
    frame: frame || "",
    frame_ref: frameRef || "",
  });
  return data;
}

export async function speakViewTubeLine(coachId, text) {
  const cleaned = String(text || "").trim();
  if (!coachId || !cleaned) {
    throw new Error("Nothing to say");
  }
  const key = speakCacheKey(coachId, cleaned);
  if (speakCache.has(key)) return speakCache.get(key);
  if (speakInflight.has(key)) return speakInflight.get(key);

  const pending = (async () => {
    const stored = await idbGetMp3(key);
    if (stored) {
      const url = URL.createObjectURL(stored);
      speakCache.set(key, url);
      return url;
    }
    const { data } = await axios.post(
      `${API}/viewtube/speak`,
      { coach_id: coachId, text: cleaned },
      { responseType: "blob" },
    );
    if (data.type && data.type.includes("json")) {
      const err = JSON.parse(await data.text());
      throw new Error(err.detail || "AI voice failed");
    }
    const url = URL.createObjectURL(data);
    speakCache.set(key, url);
    idbPutMp3(key, data).catch(() => {});
    return url;
  })();

  speakInflight.set(key, pending);
  try {
    return await pending;
  } finally {
    speakInflight.delete(key);
  }
}

export async function prefetchViewTubeLines(coachId, texts = []) {
  const unique = [];
  const seen = new Set();
  for (const text of texts) {
    const cleaned = String(text || "").trim();
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    unique.push(cleaned);
  }
  if (!coachId || unique.length === 0) return;
  const urgent = unique.slice(0, 5);
  const rest = unique.slice(5);
  await Promise.all(urgent.map((text) => speakViewTubeLine(coachId, text).catch(() => null)));
  rest.forEach((text) => {
    speakViewTubeLine(coachId, text).catch(() => null);
  });
}

export function sampleFrameSignals(videoEl) {
  const signals = {};
  if (!videoEl || videoEl.readyState < 2) {
    return signals;
  }
  const canvas = document.createElement("canvas");
  const w = 64;
  const h = 36;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(videoEl, 0, 0, w, h);
  const pixels = ctx.getImageData(0, 0, w, h).data;
  let sum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    sum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
  }
  signals.brightness = sum / (pixels.length / 4) / 255;
  return signals;
}

export function captureFrame(videoEl, maxWidth = 640, quality = 0.72) {
  if (!videoEl || videoEl.readyState < 2) return "";
  const vw = videoEl.videoWidth || 640;
  const vh = videoEl.videoHeight || 360;
  const scale = Math.min(1, maxWidth / vw);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(vw * scale));
  canvas.height = Math.max(1, Math.round(vh * scale));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}
