import { useEffect, useState } from "react";
import Button from "../components/Button";
import { Vector } from "../core/dataStruct/Vector";
import { Renderer } from "../core/render/canvas2d/renderer";
import { InputElement } from "../core/render/domElement/inputElement";
import { StageStyleManager } from "../core/service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../core/stage/Camera";
import { Settings } from "../core/service/Settings";
import tipsJson from "../assets/projectGraphTips.json";

export default function TestPage() {
  useEffect(() => {
    // InputElement.textarea(new Vector(300, 300), "hello world");
  });

  function testInput() {
    InputElement.input(new Vector(300, 300), "hello world", () => {}, {
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: StageStyleManager.currentStyle.StageObjectBorderColor.toString(),
      outline: "solid 1px white",
      marginTop: -8 * Camera.currentScale + "px",
      width: "100vw",
    });
  }

  function testTextarea() {
    InputElement.textarea(new Vector(300, 300), "hello world", () => {}, {
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: StageStyleManager.currentStyle.StageObjectBorderColor.toString(),
      outline: "solid 1px white",
      marginTop: -8 * Camera.currentScale + "px",
    });
  }

  const [theme, setTheme] = useState("light");
  useEffect(() => {
    Settings.watch("uiTheme", (value) => {
      setTheme(value);
      document.documentElement.setAttribute("data-theme", value);
    });
  }, []);

  return (
    <>
      <div className="p-4">
        <h1> Test Page </h1>
        <Button onClick={testInput}>TestInput</Button>
        <Button onClick={testTextarea}>TestTextarea</Button>
        <Button onClick={() => console.log(tipsJson)}>test json</Button>
        <div className="h-16 bg-gray-800" />
        <p>当前主题: {theme}</p>
        <div className="bg-test-bg h-64 w-64 outline-2"></div>
        <div className="bg-test-bg h-64 w-64 outline-2 hover:cursor-pointer"></div>
      </div>
    </>
  );
}
