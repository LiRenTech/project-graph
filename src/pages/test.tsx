import { useEffect } from "react";

export default function TestPage() {
  useEffect(() => {
    // 在页面上创建一个textarea元素
    const textarea = document.createElement("textarea");
    // 设置textarea的样式
    textarea.style.width = "400px";
    textarea.style.height = "400px";
    textarea.style.position = "fixed";
    textarea.style.top = "200px";
    textarea.style.left = "300px";
    textarea.style.backgroundColor = "transparent";
    textarea.autocomplete = "off";
    textarea.style.border = "solid 1px white";
    textarea.style.padding = "1px";

    // 将textarea元素添加到页面上
    document.body.appendChild(textarea);
  });

  return (
    <>
      <div className="p-4">
        <h1> Test Page </h1>
        <div className="h-16 bg-gray-800" />
      </div>
    </>
  );
}
