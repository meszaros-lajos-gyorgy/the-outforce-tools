const fs = require("fs");
const path = require("path");
const { DEFAULT_INSTALL_DIR } = require("../../src/constants");
require("stringview");

const file = "Music.box";

(async () => {
  const src = path.resolve(DEFAULT_INSTALL_DIR, "./Outforce/", file);
  const box = await fs.promises.readFile(src);

  const io = new DataView(box.buffer);

  const directoryOffset = io.getUint32(io.byteLength - 4, true);
  const numberOfFiles = io.getUint32(directoryOffset, true);

  const files = [];

  let cursor = directoryOffset + 4;
  for (let i = 0; i < numberOfFiles; i++) {
    const filename = io.getStringNT(cursor);
    cursor += filename.length + 1;
    files.push({
      filename,
      offset: io.getUint32(cursor, true),
      size: io.getUint32(cursor + 4, true),
    });
    cursor += 8;
  }

  console.log("           file:", file);
  console.log("number of files:", numberOfFiles);
  console.log(files);
})();
