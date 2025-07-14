/* eslint-disable */

import { writeFileSync } from "fs";

// 命令行参数：
// node ./generate-pkgbuild.mjs <pkgname> <pkgver> <sha256sums>
const pkgname = process.argv[2];
const pkgver = process.argv[3];
const sha256sums = process.argv[4];

if (!pkgname || !pkgver || !sha256sums) {
  console.error("Usage: node generate-pkgbuild.mjs <pkgname> <pkgver> <sha256sums>");
  process.exit(1);
}

const conflicts =
  pkgname === "project-graph-nightly-bin"
    ? ["project-graph-bin", "project-graph-git"]
    : ["project-graph-nightly-bin", "project-graph-git"];
const source =
  pkgname === "project-graph-nightly-bin"
    ? `https://github.com/LiRenTech/project-graph/releases/download/nightly/Project.Graph_0.0.0-nightly.${pkgver}_amd64.deb`
    : `https://github.com/LiRenTech/project-graph/releases/download/v${pkgver}/Project.Graph_${pkgver}_amd64.deb`;

const PKGBUILD = `# Maintainer: zty012 <me@zty012.de>
pkgname=${pkgname}
pkgver=${pkgver}
pkgrel=1
pkgdesc="A simple tool to create topology diagrams."
arch=('x86_64')
url="https://github.com/LiRenTech/project-graph"
license=('mit')
depends=('cairo' 'desktop-file-utils' 'gdk-pixbuf2' 'glib2' 'gtk3' 'hicolor-icon-theme' 'libsoup' 'pango' 'webkit2gtk')
options=('!strip' '!emptydirs')
provides=('project-graph')
conflicts=(${conflicts.map((x) => `'${x}'`).join(" ")})
install=${pkgname}.install
source_x86_64=('${source}')
sha256sums_x86_64=('${sha256sums}')
package() {
  # Extract package data
  tar -xz -f data.tar.gz -C "\${pkgdir}"
}
`;

console.log("===== PKGBUILD =====");
console.log(PKGBUILD);
writeFileSync("./PKGBUILD", PKGBUILD);

const SRCINFO = `pkgbase = ${pkgname}
\tpkgdesc = A simple tool to create topology diagrams.
\tpkgver = ${pkgver}
\tpkgrel = 1
\turl = https://github.com/LiRenTech/project-graph
\tinstall = ${pkgname}.install
\tarch = x86_64
\tlicense = mit
\tdepends = cairo
\tdepends = desktop-file-utils
\tdepends = gdk-pixbuf2
\tdepends = glib2
\tdepends = gtk3
\tdepends = hicolor-icon-theme
\tdepends = libsoup
\tdepends = pango
\tdepends = webkit2gtk
\tprovides = project-graph
${conflicts.map((x) => `\tconflicts = ${x}`).join("\n")}
\toptions = !strip
\toptions = !emptydirs
\tsource_x86_64 = ${source}
\tsha256sums_x86_64 = ${sha256sums}

pkgname = ${pkgname}`;

console.log("===== .SRCINFO =====");
console.log(SRCINFO);
writeFileSync("./.SRCINFO", SRCINFO);
