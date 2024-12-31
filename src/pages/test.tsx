import { readText } from "@tauri-apps/plugin-clipboard-manager";

export default function TestPage() {
  return (
    <>
      <h1>Test Page</h1>
      <p>This is a test page.</p>
      <div className="h-32">123</div>
      <button
        onClick={() => {
          readText().then((text) => {
            console.log(text);
          });
        }}
      >
        test
      </button>
    </>
  );
}
