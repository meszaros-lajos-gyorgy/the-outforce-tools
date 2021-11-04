const fs = require("fs");
const path = require("path");
const {
  pluck,
  compose,
  map,
  split,
  init,
  join,
  uniq,
  reject,
  isEmpty,
} = require("ramda");
const { DEFAULT_INSTALL_DIR } = require("../../src/constants");
require("stringview");

// source: https://gist.github.com/miguelmota/5b06ae5698877322d0ca#gistcomment-3611597
const toArrayBuffer = (buffer) => {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
};

const openBox = async (file) => {
  const src = path.resolve(DEFAULT_INSTALL_DIR, `./Outforce/${file}.box`);

  try {
    await fs.promises.access(src, fs.constants.R_OK);
  } catch (e) {
    console.error("file not found:", src);
    return;
  }

  const box = await fs.promises.readFile(src);
  const io = new DataView(toArrayBuffer(box));

  const directoryOffset = io.getUint32(box.length - 4, true);
  const numberOfFiles = io.getUint32(directoryOffset, true);

  const files = [];

  let cursor = directoryOffset + 4;
  for (let i = 0; i < numberOfFiles; i++) {
    const filename = io.getStringNT(cursor);
    const offset = io.getUint32(cursor + filename.length + 1, true);
    const size = io.getUint32(cursor + filename.length + 5, true);
    cursor += filename.length + 9;
    files.push({
      path: filename.replace("\\", "/"),
      data: box.slice(offset, offset + size),
    });
  }

  return files;
};

const getFolders = (files) => {
  return compose(
    reject(isEmpty),
    uniq,
    map(compose(join("/"), init, split("/"))),
    pluck("path")
  )(files);
};

const saveToDisk = async (outputDir, files) => {
  const folders = getFolders(files);

  for (let folder of folders) {
    await fs.promises.mkdir(path.resolve(outputDir, folder), {
      recursive: true,
    });
  }

  for (let file of files) {
    await fs.promises.writeFile(path.resolve(outputDir, file.path), file.data);
  }
};

(async () => {
  const boxname = "Music";

  const files = await openBox(boxname);

  // const outputDir = path.resolve(DEFAULT_INSTALL_DIR, "./unpacked/boxes/", `${boxname}.box`);
  const outputDir = path.resolve("e:/the-outforce-boxes/", `${boxname}.box`);

  await saveToDisk(outputDir, files);

  console.log("done");
})();
