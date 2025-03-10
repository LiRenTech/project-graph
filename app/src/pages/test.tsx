import { useEffect, useState } from "react";
import { Settings } from "../core/service/Settings";
import { isLinux, isMac, isMobile, isWeb, isWindows } from "../utils/platform";

export default function TestPage() {
  useEffect(() => {
    // InputElement.textarea(new Vector(300, 300), "hello world");
  });

  const [theme, setTheme] = useState("light");
  // const [vd, setVd] = useState<Vditor>();
  useEffect(() => {
    Settings.watch("uiTheme", (value) => {
      setTheme(value);
      document.documentElement.setAttribute("data-theme", value);
    });
    return () => {
      // vd?.destroy();
      // setVd(undefined);
    };
  }, []);

  return (
    <>
      <div className="px-4 pt-20">
        <p>当前主题: {theme}</p>
        <p>isMac: {isMac}</p>
        <p>
          isWeb: {isWeb}, isMobile: {isMobile}
        </p>
        <p>
          {isWindows}, {isLinux}
        </p>
      </div>
    </>
  );
}
