import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./global.css";
import "katex/dist/katex.css";

const inter = Inter({
  subsets: ["latin"],
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          search={{
            enabled: false,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
