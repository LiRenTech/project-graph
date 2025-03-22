import { useEffect } from "react";
import { isExportPNGPanelOpenAtom } from "../../state";
import { useAtom } from "jotai";
import { cn } from "../../utils/cn";
import Button from "../../components/Button";
import { StageExportPng } from "../../core/service/dataGenerateService/stageExportEngine/StageExportPng";

/**
 * 导出png的面板
 * @returns
 */
export default function ExportPNGPanel() {
  const [isExportPngPanelOpen, setIsExportPngPanelOpen] = useAtom(isExportPNGPanelOpenAtom);

  useEffect(() => {
    if (!isExportPngPanelOpen) {
      return;
    }
  }, [isExportPngPanelOpen]);

  const downloadImage = () => {
    const imageBox = document.getElementById("export-png-image-box") as HTMLDivElement;
    const image = imageBox.querySelector("img") as HTMLImageElement;
    if (image) {
      const a = document.createElement("a");
      a.href = image.src;
      a.download = `${114514}.png`;
      a.click();
    }
  };

  return (
    <div
      className={cn(
        "fixed left-1/2 top-1/2 z-10 flex h-4/5 w-3/4 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center overflow-y-scroll rounded-md bg-gray-800 px-2 py-6",
        {
          hidden: !isExportPngPanelOpen,
        },
      )}
    >
      <h2>导出png图片</h2>
      <p>test……</p>
      <div className="h-96 w-full overflow-hidden ring" id="export-png-image-box"></div>
      <div className="my-2 flex justify-center gap-2">
        <Button
          onClick={() => {
            // 先清空box内部的内容
            const exportPngImageBox = document.getElementById("export-png-image-box");
            if (exportPngImageBox) {
              exportPngImageBox.innerHTML = "";
            }
            //
            StageExportPng.exportStage();
          }}
        >
          渲染图片
        </Button>
        <Button onClick={downloadImage}>另存为图片</Button>
      </div>
      {/* 关闭按钮 */}
      <button
        className="absolute right-0 top-0 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
        onClick={() => setIsExportPngPanelOpen(false)}
      >
        关闭
      </button>
    </div>
  );
}
