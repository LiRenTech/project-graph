/* eslint-disable */

import { readFileSync, writeFileSync } from "fs";

const features = process.argv[2].split(",");

const CARGO_TOML_PATH = "app/src-tauri/Cargo.toml";

const conf = readFileSync(CARGO_TOML_PATH);
const updated = conf
  .toString()
  .replace(
    /tauri = { version = "(.*)", features = \["(.*)"\] }/,
    `tauri = { version = "$1", features = ["macos-private-api", "${features.join('", "')}"] }`,
  );

writeFileSync(CARGO_TOML_PATH, updated);

console.log(updated);
