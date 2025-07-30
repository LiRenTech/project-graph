import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import { useEffect, useRef, useState } from "react";
import { Settings } from "@/core/service/Settings";
import { Themes } from "@/core/service/Themes";
import "../css/markdown.css";
import { cn } from "@/utils/cn";

export default function Markdown({ source, className = "" }: { source: string; className?: string }) {
  Settings.get("theme").then((theme) => {
    const themeMetadata = Themes.getThemeById(theme)?.metadata;
    if (themeMetadata) {
      if (themeMetadata.type === "dark") {
        import("highlight.js/styles/github-dark.css");
      } else {
        import("highlight.js/styles/github.css");
      }
    } else {
      import("highlight.js/styles/github.css");
    }
  });

  const mdit = useRef(
    new MarkdownIt({
      breaks: true,
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, {
              language: lang,
              ignoreIllegals: true,
            }).value;
          } catch (e) {
            console.error(e);
          }
        }
        return "";
      },
    }),
  );

  const [html, setHtml] = useState("");

  useEffect(() => {
    setHtml(mdit.current.render(source));
  }, [source]);

  return <div className={cn(className, "markdown-body")} dangerouslySetInnerHTML={{ __html: html }}></div>;
}
