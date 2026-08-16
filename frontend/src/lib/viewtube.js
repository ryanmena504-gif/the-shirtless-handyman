import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const VIEWTUBE = {
  name: "viewTube",
  tagline: "YouTube shows you how. viewTube watches you do it.",
  promise: "A live coach in your pocket. Charming. Strict. Stops you before the board goes on backwards.",
};

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

export async function postViewTubeEvent(sessionId, type, signals = {}) {
  const { data } = await axios.post(`${API}/viewtube/sessions/${sessionId}/events`, {
    type,
    signals,
  });
  return data;
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

export function pickSpeechVoice(voices, gender) {
  const pool = voices.filter((v) => {
    const name = `${v.name} ${v.lang}`.toLowerCase();
    if (!name.includes("en")) return false;
    if (gender === "female") {
      return /female|samantha|victoria|karen|moira|siri|zira|susan|fiona|karen/.test(name);
    }
    return /male|daniel|alex|fred|david|tom|daniel|aaron|oliver/.test(name);
  });
  return pool[0] || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}
