import { useEffect } from "react";
import { InputElement } from "../core/render/domElement/inputElement";
import { Vector } from "../core/dataStruct/Vector";
import Button from "../components/ui/Button";

export default function TestPage() {
  useEffect(() => {
    // InputElement.textarea(new Vector(300, 300), "hello world");
  });

  function testInput() {
    InputElement.input(new Vector(300, 300), "hello world");
  }

  function testTextarea() {
    InputElement.textarea(new Vector(300, 300), "hello world");
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
