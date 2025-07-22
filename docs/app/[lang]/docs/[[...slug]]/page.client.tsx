"use client";

import { File } from "lucide-react";

export function RelatedFileButton({ relatedFile }: { relatedFile: string }) {
  return (
    <button
      className={
        "[&_svg]:text-fd-muted-foreground bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2 text-sm transition [&_svg]:size-3.5"
      }
      onClick={() => {
        window.open("https://github.com/LiRenTech/project-graph/blob/master/" + relatedFile, "_blank");
      }}
    >
      <File />
      {relatedFile.split("/").pop()}
    </button>
  );
}
