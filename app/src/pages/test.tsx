import { useEffect, useState } from "react";
import Button from "../components/Button";
import { Settings } from "../core/service/Settings";
import tipsJson from "../assets/projectGraphTips.json";
// import DetailsEditSidePanel from "./_details_edit_side_panel";
// import MarkdownEditor from "./_vditor_panel";
// import Vditor from "vditor";
import "vditor/dist/index.css";
import { Panel } from "../components/panel";

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
      <div className="p-4">
        <h1> Test Page </h1>
        <Button onClick={() => console.log(tipsJson)}>test json</Button>
        <div className="h-16 bg-gray-800" />
        <p>当前主题: {theme}</p>
        <div className="bg-test-bg h-64 w-64 outline-2"></div>
        <div className="bg-test-bg h-64 w-64 outline-2 hover:cursor-pointer"></div>
        <Button
          onClick={() => {
            Panel.show(
              {
                title: "这是标题",
                buttons: [
                  {
                    label: "一个按钮",
                    onClick: () => {},
                  },
                ],
              },
              <>内容</>,
            );
          }}
        >
          open panel
        </Button>
      </div>
    </>
  );
}
