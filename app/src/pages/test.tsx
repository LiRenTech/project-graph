import { useEffect, useState } from "react";
import Button from "../components/Button";
import { Settings } from "../core/service/Settings";
import tipsJson from "../assets/projectGraphTips.json";
// import DetailsEditSidePanel from "./_details_edit_side_panel";
// import MarkdownEditor from "./_vditor_panel";
// import Vditor from "vditor";
import "vditor/dist/index.css";
import MarkdownEditor from "./_vditor_panel";

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

  const [inputCurrentDetails, setInputCurrentDetails] = useState("");
  const setInputCurrentDetailsHandler = (value?: string | undefined) => {
    if (value !== undefined) {
      setInputCurrentDetails(value);
    }
  };
  return (
    <>
      <div className="p-4">
        <h1> Test Page </h1>
        <Button onClick={() => console.log(tipsJson)}>test json</Button>
        <div className="h-16 bg-gray-800" />
        <p>当前主题: {theme}</p>
        <div className="bg-test-bg h-64 w-64 outline-2"></div>
        <div className="bg-test-bg h-64 w-64 outline-2 hover:cursor-pointer"></div>
        <MarkdownEditor
          id="details-editor"
          className="fixed bottom-4 right-4 top-20 z-50 overflow-hidden rounded-xl"
          onChange={setInputCurrentDetailsHandler}
          defaultValue={inputCurrentDetails}
          options={{
            width: "50%",
            toolbar: [
              // {
              //   name: "confirm",
              //   tip: "确认",
              //   tipPosition: "n",
              //   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1024 1024"><path fill="currentColor" d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5L207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8"/></svg>',
              //   click: handleConfirmDetailsEdit,
              // },
              "fullscreen",
              "|",
              "headings",
              "bold",
              "italic",
              "strike",
              "link",
              "|",
              "list",
              "ordered-list",
              "check",
              "outdent",
              "indent",
              "|",
              "quote",
              "line",
              "code",
              "inline-code",
              "table",
              "|",
              "undo",
              "redo",
            ],
          }}
        />
      </div>
    </>
  );
}
