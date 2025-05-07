/* eslint-disable */

import { readFileSync, writeFileSync } from "fs";

const version = process.argv[2];

const TAURI_CONF_PATH = "app/src-tauri/tauri.conf.json";

const conf = JSON.parse(readFileSync(TAURI_CONF_PATH));
conf.version = version;

writeFileSync(TAURI_CONF_PATH, JSON.stringify(conf, null, 2));

console.log(conf);
