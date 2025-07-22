import { blogPosts, docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { icons } from "lucide-react";
import { createElement } from "react";
import { i18n } from "./i18n";

// `loader()` also assign a URL to your pages
// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  icon(icon) {
    if (!icon) {
      return;
    }
    if (icon in icons) {
      return createElement(icons[icon as keyof typeof icons]);
    }
    return createElement(icons.OctagonAlert);
  },
  i18n,
});

export const blog = loader({
  baseUrl: "/blog",
  source: createMDXSource(blogPosts),
});
