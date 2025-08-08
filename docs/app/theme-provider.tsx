"use client";

import { useTheme } from "next-themes";
import { ReactNode, useEffect } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.dataset.colorMode = theme;
  }, [theme]);

  return children;
}
