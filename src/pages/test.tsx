import { useEffect } from "react";
import { InputElement } from "../core/render/domElement/inputElement";
import { Vector } from "../core/dataStruct/Vector";
import Button from "../components/ui/Button";
import { Renderer } from "../core/render/canvas2d/renderer";
import { Camera } from "../core/stage/Camera";
import { StageStyleManager } from "../core/stageStyle/StageStyleManager";

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

  return (
    <>
      <div className="p-4">
        <h1> Test Page </h1>
        <Button onClick={testInput}>TestInput</Button>
        <Button onClick={testTextarea}>TestTextarea</Button>
        <div className="h-16 bg-gray-800" />
      </div>
    </>
  );
}
