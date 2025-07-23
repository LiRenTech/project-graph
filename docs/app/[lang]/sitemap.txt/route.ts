import { source } from "@/lib/source";
import { NextResponse } from "next/server";

export const revalidate = false;

export async function GET() {
  return new NextResponse(
    ["https://project-graph.top/", ...source.getPages().map((page) => `https://project-graph.top${page.url}`)].join(
      "\n",
    ),
    {
      headers: {
        "Content-Type": "text/plain",
      },
    },
  );
}
