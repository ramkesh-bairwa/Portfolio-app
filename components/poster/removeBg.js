'use client';
// Removes the background behind people in a photo, in the browser (MediaPipe selfie segmentation).
// Returns a PNG/WebP File with a transparent background, ready to upload.
const VERSION = '1.0.1';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';
const MAX_SIDE = 1600;

let segmenterPromise = null;
function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`);
      return ImageSegmenter.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' },
        runningMode: 'IMAGE',
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
    })().catch((e) => { segmenterPromise = null; throw e; });
  }
  return segmenterPromise;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read this photo. Upload it from your device and try again.'));
    img.src = src;
  });
}

// Connected areas of the "person" mask; returns 1 for pixels in big enough areas
function largestParts(bg, mw, mh) {
  const label = new Int32Array(mw * mh);
  const sizes = [0];
  const stack = [];
  for (let i = 0; i < mw * mh; i++) {
    if (label[i] || 1 - bg[i] < 0.35) continue;
    const id = sizes.length;
    let size = 0;
    label[i] = id;
    stack.push(i);
    while (stack.length) {
      const p = stack.pop();
      size++;
      const x = p % mw;
      const y = (p - x) / mw;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= mw || ny >= mh) continue;
        const q = ny * mw + nx;
        if (!label[q] && 1 - bg[q] >= 0.35) { label[q] = id; stack.push(q); }
      }
    }
    sizes.push(size);
  }
  const biggest = Math.max(0, ...sizes);
  const keepId = sizes.map((n) => n >= biggest * 0.2);
  const out = new Uint8Array(mw * mh);
  for (let i = 0; i < out.length; i++) {
    // soft edge pixels (below the threshold) stay if they touch a kept area
    if (label[i]) out[i] = keepId[label[i]] ? 1 : 0;
    else {
      const x = i % mw;
      const near = [i - 1, i + 1, i - mw, i + mw].some((q) => q >= 0 && q < out.length && Math.abs((q % mw) - x) <= 1 && label[q] && keepId[label[q]]);
      out[i] = near ? 1 : 0;
    }
  }
  return out;
}

const toBlob = (canvas, type, q) => new Promise((res) => canvas.toBlob(res, type, q));

export async function removeBackground(src) {
  const [segmenter, img] = await Promise.all([getSegmenter(), loadImage(src)]);
  const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * k);
  const h = Math.round(img.naturalHeight * k);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);

  const result = segmenter.segment(canvas);
  // Mask 0 is "background" confidence; everything else (hair, skin, clothes) is the person
  const mask = result.confidenceMasks[0];
  const bg = mask.getAsFloat32Array();
  const mw = mask.width;
  const mh = mask.height;
  // Keep only the main figure: drop separate islands smaller than a fifth of the largest one
  const keep = largestParts(bg, mw, mh);
  const data = ctx.getImageData(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const my = Math.min(mh - 1, Math.floor((y * mh) / h));
    for (let x = 0; x < w; x++) {
      const mx = Math.min(mw - 1, Math.floor((x * mw) / w));
      const person = keep[my * mw + mx] ? 1 - bg[my * mw + mx] : 0;
      // soften the edge a little instead of a hard cut
      const a = Math.max(0, Math.min(1, (person - 0.35) / 0.3));
      data.data[(y * w + x) * 4 + 3] = Math.round(a * 255);
    }
  }
  result.close?.();
  ctx.putImageData(data, 0, 0);

  let blob = await toBlob(canvas, 'image/webp', 0.92);
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/png');
  if (blob.size > 4.8 * 1024 * 1024) {
    const small = document.createElement('canvas');
    small.width = Math.round(w * 0.7);
    small.height = Math.round(h * 0.7);
    small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height);
    blob = await toBlob(small, 'image/png');
  }
  const ext = blob.type === 'image/webp' ? 'webp' : 'png';
  return new File([blob], `cutout.${ext}`, { type: blob.type });
}
