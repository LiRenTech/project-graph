import type { MetadataRoute } from "next";

import { source } from "@/lib/source";
import { NextResponse } from "next/server";

export const revalidate = false;

export async function GET() {
  return NextResponse.json([
    {
      url: "/",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "/docs",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...(await Promise.all(
      source.getPages().map(async (page) => {
        return {
          url: page.url,
          changeFrequency: "daily",
          priority: 0.5,
        } as MetadataRoute.Sitemap[number];
      }),
    )),
  ] as MetadataRoute.Sitemap);
}
