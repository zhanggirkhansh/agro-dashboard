import type { Worker } from "tesseract.js";

const ASSET_PATH = "/weighing-ocr";
const MAX_IMAGE_SIDE = 1800;

function extractNumbers(text: string): string[] {
  const candidates = text.match(/\b[0-9OoIl]{3,}\b/g) ?? [];
  return [...new Set(candidates
    .filter((candidate) => /\d/.test(candidate))
    .map((candidate) => candidate.replace(/[Oo]/g, "0").replace(/[Il]/g, "1")))];
}

async function prepareImage(photo: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(photo);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare the ear tag photo");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function readEarTagNumbers(photo: File, signal: AbortSignal): Promise<string[]> {
  let worker: Worker | undefined;
  let cancel: () => void = () => {};
  let reportError: (error: unknown) => void = () => {};
  const stopped = new Promise<never>((_, reject) => {
    cancel = () => reject(signal.reason);
    reportError = reject;
  });
  signal.addEventListener("abort", cancel, { once: true });

  async function recognize(): Promise<string[]> {
    const [{ createWorker, OEM, PSM }, image] = await Promise.all([
      import("tesseract.js"),
      prepareImage(photo),
    ]);
    signal.throwIfAborted();
    const recognizer = await createWorker("eng", OEM.LSTM_ONLY, {
      workerPath: ASSET_PATH + "/worker.min.js",
      corePath: ASSET_PATH + "/tesseract-core-lstm.wasm.js",
      langPath: ASSET_PATH,
      workerBlobURL: false,
      errorHandler: reportError,
    });
    if (signal.aborted) {
      await recognizer.terminate();
      signal.throwIfAborted();
    }
    worker = recognizer;

    for (const mode of [PSM.SPARSE_TEXT, PSM.SINGLE_BLOCK]) {
      await recognizer.setParameters({ tessedit_pageseg_mode: mode });
      const { data: { text } } = await recognizer.recognize(image);
      const numbers = extractNumbers(text);
      if (numbers.length > 0) return numbers;
    }
    return [];
  }

  try {
    signal.throwIfAborted();
    return await Promise.race([recognize(), stopped]);
  } finally {
    signal.removeEventListener("abort", cancel);
    await worker?.terminate();
  }
}
