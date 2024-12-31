import { readText, readImage } from "@tauri-apps/plugin-clipboard-manager";
// import { writeFileBase64 } from "../utils/fs";

export default function TestPage() {
  return (
    <>
      <h1>Test Page</h1>
      <p>This is a test page.</p>
      <div className="h-32">123</div>
      <button
        onClick={async () => {
          const text = await readText();
          console.log("text: ", text);
        }}
      >
        readText
      </button>
      <button
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
