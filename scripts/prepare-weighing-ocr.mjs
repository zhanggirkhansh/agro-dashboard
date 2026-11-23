import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const worker = require.resolve("tesseract.js/dist/worker.min.js");
const requireCore = createRequire(worker);
const output = new URL("../public/weighing-ocr/", import.meta.url);

await mkdir(output, { recursive: true });
await Promise.all(Object.entries({
  "worker.min.js": worker,
  "worker.min.js.LICENSE.txt": require.resolve("tesseract.js/dist/worker.min.js.LICENSE.txt"),
  "tesseract-license.txt": require.resolve("tesseract.js/LICENSE.md"),
  "tesseract-core-lstm.wasm.js": requireCore.resolve("tesseract.js-core/tesseract-core-lstm.wasm.js"),
  "tesseract-core-license.txt": requireCore.resolve("tesseract.js-core/LICENSE"),
  "eng.traineddata.gz": require.resolve("@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz"),
}).map(([name, source]) => copyFile(source, new URL(name, output))));
