import { readFileSync, writeFileSync } from "fs";

function convertNamespaceToClass(code: string): string {
  return code
    .replace(/namespace (\w+)/gm, "class $1")
    .replace(/^ {2}export (let|const) ([A-Z_]+)/gm, "static $2")
    .replace(/^ {2}export let (\w+)/gm, "$1")
    .replace(/^ {2}export const (\w+)/gm, "readonly $1")
    .replace(/^ {2}let (\w+)/gm, "private $1")
    .replace(/^ {2}const (\w+)/gm, "private readonly $1")
    .replace(/^ {2}export function init\(\)/gm, "constructor()")
    .replace(/^ {2}export function (\w+)/gm, "$1")
    .replace(/^ {2}export async function (\w+)/gm, "async $1")
    .replace(/^ {2}function (\w+)/gm, "private $1");
}

const path = process.argv[2];
const code = readFileSync(path, "utf-8");
const result = convertNamespaceToClass(code);
writeFileSync(path, result, "utf-8");
