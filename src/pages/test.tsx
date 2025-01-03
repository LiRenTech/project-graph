import { readText, readImage } from "@tauri-apps/plugin-clipboard-manager";
// import { writeFileBase64 } from "../utils/fs";

export default function TestPage() {
  return (
    <>
      <h1 className="h-32">Test Page</h1>
      <p>This is a test page.</p>
      <div className="h-32">123</div>
      <button
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={async () => {
          const text = await readText();
          console.log("text: ", text);
        }}
      >
        readText
      </button>
      <button
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={async () => {
          const image = await readImage();
          console.log("image: ", image);
          const rgbaData = await image.rgba();
          console.log("rgbaData: ", rgbaData);
          const blob = new Blob([rgbaData], { type: "image/png" });
          console.log("blob: ", blob);
          // const blob = new Blob([rgbaData], {
          //   type: "image/png",
          // });
          // const imagePath = "D:/Desktop/test1.png";
          // // writeFile(imagePath, new Uint8Array(await blob.arrayBuffer()));
          // const base64Content = await convertBlobToBase64(blob);
          // console.log(base64Content);
          // writeFileBase64(imagePath, base64Content);
        }}
      >
        readImage
      </button>
      <button
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={async () => {
          const userAgent = navigator.userAgent;
          console.log("userAgent: ", userAgent);
          // 判断用户使用的操作系统
          if (userAgent.indexOf("Windows NT 10.0") !== -1) {
            console.log("用户使用的是 Windows 10 或 Windows 11");
          } else if (userAgent.indexOf("Windows NT 6.3") !== -1) {
            console.log("用户使用的是 Windows 8.1");
          } else if (userAgent.indexOf("Windows NT 6.2") !== -1) {
            console.log("用户使用的是 Windows 8");
          } else if (userAgent.indexOf("Windows NT 6.1") !== -1) {
            console.log("用户使用的是 Windows 7");
          } else {
            console.log("用户使用的是其他操作系统");
          }
        }}
      >
        点击userAgent
      </button>
      <pre>{navigator.userAgent}</pre>
    </>
  );
}

// 将 Blob 转换为 Base64 字符串
// async function convertBlobToBase64(blob: Blob): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       if (typeof reader.result === "string") {
//         resolve(reader.result.split(",")[1]); // 去掉"data:image/png;base64,"前缀
//       } else {
//         reject(new Error("Invalid result type"));
//       }
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// }
