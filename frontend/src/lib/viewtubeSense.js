/**
 * On-device visual nervous system for viewTube.
 *
 * The cloud is too slow to "watch." The phone samples a tiny frame ~8fps and
 * emits edges: lost, found, face, shock, settled. Instant voice rides those
 * edges. GPT only looks after the bench settles from a shock.
 *
 * Keep thresholds in sync with backend/viewtube.py SENSE_SPEC.
 */

export const SENSE = {
  width: 96,
  height: 54,
  sampleMs: 120,
  dark: 0.12,
  motionStir: 0.045,
  motionShock: 0.11,
  motionSettle: 0.028,
  skinFace: 0.22,
  lostFrames: 8,
  settleFrames: 6,
  shockCooldownMs: 8000,
  heartbeatMs: 15000,
};

export function motionMatters(watch) {
  return watch === "placement" || watch === "danger";
}

export function createSenseState() {
  return {
    mode: "idle",
    lostStreak: 0,
    settleStreak: 0,
    lastShockAt: 0,
    lastEdge: null,
  };
}

function luminance(r, g, b) {
  return (r + g + b) / 3;
}

function isSkin(r, g, b) {
  return r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15;
}

export function analyzeFrame(pixels, prevGray, width, height) {
  const n = width * height;
  const gray = new Float32Array(n);
  const benchStart = Math.floor(height * 0.32);
  let brightSum = 0;
  let skin = 0;
  let skinUpper = 0;
  let upperN = 0;
  let motionBench = 0;
  let benchN = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const p = i * 4;
      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];
      const yv = luminance(r, g, b);
      gray[i] = yv;
      brightSum += yv;
      if (isSkin(r, g, b)) {
        skin += 1;
        if (y < benchStart) skinUpper += 1;
      }
      if (y < benchStart) upperN += 1;
      if (y >= benchStart) {
        benchN += 1;
        if (prevGray) motionBench += Math.abs(yv - prevGray[i]);
      }
    }
  }

  return {
    brightness: brightSum / n / 255,
    skin: skin / n,
    face: upperN ? skinUpper / upperN : 0,
    motion: benchN && prevGray ? motionBench / benchN / 255 : 0,
    gray,
  };
}

export function reduceSense(state, sample, now = Date.now()) {
  const next = {
    mode: state.mode,
    lostStreak: state.lostStreak,
    settleStreak: state.settleStreak,
    lastShockAt: state.lastShockAt,
    lastEdge: null,
  };

  const dark = sample.brightness < SENSE.dark;
  const facing = sample.face >= SENSE.skinFace && sample.brightness > 0.18;

  if (dark) {
    next.lostStreak = state.lostStreak + 1;
    next.settleStreak = 0;
    if (next.lostStreak >= SENSE.lostFrames && state.mode !== "lost") {
      next.mode = "lost";
      next.lastEdge = "lost";
    }
    return next;
  }

  next.lostStreak = 0;

  if (state.mode === "lost") {
    next.mode = "idle";
    next.lastEdge = "found";
    return next;
  }

  if (facing && state.mode !== "face") {
    next.mode = "face";
    next.lastEdge = "face";
    return next;
  }

  if (!facing && state.mode === "face") {
    next.mode = "idle";
    next.lastEdge = "found";
    return next;
  }

  if (
    sample.motion >= SENSE.motionShock &&
    now - state.lastShockAt > SENSE.shockCooldownMs
  ) {
    next.mode = "shock";
    next.lastShockAt = now;
    next.settleStreak = 0;
    next.lastEdge = "shock";
    return next;
  }

  if (state.mode === "shock" || state.mode === "stirring") {
    if (sample.motion <= SENSE.motionSettle) {
      next.settleStreak = state.settleStreak + 1;
      if (next.settleStreak >= SENSE.settleFrames) {
        next.mode = "settled";
        next.lastEdge = "settled";
      } else {
        next.mode = state.mode;
      }
    } else if (sample.motion >= SENSE.motionStir) {
      next.mode = "stirring";
      next.settleStreak = 0;
    } else {
      next.mode = state.mode;
    }
    return next;
  }

  if (sample.motion >= SENSE.motionStir) {
    next.mode = "stirring";
    next.settleStreak = 0;
  }

  return next;
}

export function sampleVideo(video, canvas, ctx) {
  if (!video || video.readyState < 2 || !ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

/** Fill a pixel buffer for tests. rgb is [r,g,b]. */
export function fillPixels(width, height, rgb) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const p = i * 4;
    pixels[p] = rgb[0];
    pixels[p + 1] = rgb[1];
    pixels[p + 2] = rgb[2];
    pixels[p + 3] = 255;
  }
  return pixels;
}

export function paintRect(pixels, width, x0, y0, x1, y1, rgb) {
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const p = (y * width + x) * 4;
      pixels[p] = rgb[0];
      pixels[p + 1] = rgb[1];
      pixels[p + 2] = rgb[2];
      pixels[p + 3] = 255;
    }
  }
}
