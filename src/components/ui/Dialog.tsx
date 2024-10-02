import { cn } from "../../utils/cn";
import { useDialog } from "../../utils/dialog";
import Button from "./Button";
import { isDesktop, isMobile } from "../../utils/platform";

/**
 * 中央小弹窗，只能点确定
 * 
 * 使用方法：
 * const dialog = useDialog();
 * 
 * dialog.show({
    title: "舞台序列化",
    type: "info",
    content: JSON.stringify(NodeDumper.dumpToV3()),
   })
 * @returns 
 */
export default function Dialog() {
  const dialog = useDialog();

  // React.useEffect(() => {
  //   window.addEventListener("keydown", (e) => {
  //     if (e.key === "Escape" && dialog.showDialog) {
  //       dialog.showDialog = false;
  //     }
  //   });
  //   window.addEventListener("click", () => {
  //     if (dialog.showDialog) {
  //       dialog.showDialog = false;
  //     }
  //   });
  // }, []);

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-4 overflow-auto text-wrap break-words p-8 text-white shadow-xl shadow-neutral-900 transition duration-500 ease-[cubic-bezier(.19,1,.22,1)]",
        {
          "pointer-events-none": !dialog.showDialog,
          "bottom-0 right-0 top-0 w-1/4 duration-300": isMobile,
          "translate-x-full": isMobile && !dialog.showDialog,
          "left-1/2 top-1/2 max-h-[50vh] max-w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-2xl":
            isDesktop,
          "scale-95 opacity-0": isDesktop && !dialog.showDialog,
          "bg-blue-950": dialog.type === "info",
          "bg-green-950": dialog.type === "success",
          "bg-yellow-950": dialog.type === "warning",
          "bg-red-950": dialog.type === "error",
        },
      )}
    >
      <h1 className="text-2xl font-bold">{dialog.title}</h1>
      <div className="flex-1 overflow-auto">
        {dialog.content.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {dialog.code.trim() !== "" && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">代码</h2>
          <pre className="overflow-auto rounded-md bg-neutral-900 p-2 text-white text-sm">
            {dialog.code}
          </pre>
        </div>
      )}

      {dialog.buttons.map((btn, i) => (
        <Button key={i} onClick={btn.onClick}>
          {btn.text}
        </Button>
      ))}
    </div>
  );
}
