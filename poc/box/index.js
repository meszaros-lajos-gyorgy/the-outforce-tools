const fs = require("fs");
const path = require("path");
const { DEFAULT_INSTALL_DIR } = require("../../src/constants");

(async () => {
  const src = path.resolve(DEFAULT_INSTALL_DIR, "./Outforce/Music.box");
  const box = await fs.promises.readFile(src);
  console.log(box.length);
})();
