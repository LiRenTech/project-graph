import { useAtom } from "jotai";
import { Download, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/Button";
import { Dialog } from "../../components/dialog";
import { StageExportPng } from "../../core/service/dataGenerateService/stageExportEngine/StageExportPng";
import { Camera } from "../../core/stage/Camera";
import { Stage } from "../../core/stage/Stage";
import { isExportPNGPanelOpenAtom } from "../../state";
import { cn } from "../../utils/cn";
import { PathString } from "../../utils/pathString";

/**
 * 导出png的面板
 * @returns
 */
export default function ExportPNGPanel() {
  const [isExportPngPanelOpen, setIsExportPngPanelOpen] = useAtom(isExportPNGPanelOpenAtom);
  const [isRendering, setIsRendering] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [isTransparentBackground, setIsTransparentBackground] = useState(true);

  useEffect(() => {
    if (!isExportPngPanelOpen) {
      return;
    }
    StageExportPng.startRender = () => {
      setIsRendering(true);
    };
    StageExportPng.finishRender = () => {
      setIsRendering(false);
    };
    StageExportPng.tickRenderer = (c, t) => {
      setCurrent(c);
      setTotal(t);
    };
  }, [isExportPngPanelOpen]);

  useEffect(() => {
    StageExportPng.setHaveBackground(!isTransparentBackground);
  }, [isTransparentBackground]);

  const [cameraScaleWhenExport, setCameraScaleWhenExport] = useState(0.5);

  const downloadImage = () => {
    const imageBox = document.getElementById("export-png-image-box") as HTMLDivElement;
    const image = imageBox.querySelector("img") as HTMLImageElement;
    if (image) {
      const a = document.createElement("a");
      a.href = image.src;

      let fileName = "file";
      if (Stage.path.isDraft()) {
        fileName = "草稿";
      } else {
        fileName = PathString.getFileNameFromPath(Stage.path.getFilePath());
      }
      a.download = `${fileName}.png`;
      a.click();
    } else {
      Dialog.show({
        title: "提示",
        content: "请先渲染图片",
      });
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
      <div className="flex h-96 w-full overflow-hidden rounded-md bg-black" id="export-png-image-box">
        <span className="p-8">暂时没有渲染结果，请先点击渲染图片</span>
      </div>
      <div className="flex w-full items-center">
        <span>摄像机缩放比例：</span>
        <input
          type="range"
          max={1}
          min={0.05}
          step={0.05}
          value={cameraScaleWhenExport}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setCameraScaleWhenExport(value);
            Camera.currentScale = value;
            Camera.targetScale = value;
            StageExportPng.changeCameraScaleWhenExport(value);
          }}
        />

        <span>{cameraScaleWhenExport}</span>
        <span className="mx-4">
          <input
            type="checkbox"
            checked={isTransparentBackground}
            onChange={() => setIsTransparentBackground(!isTransparentBackground)}
          />
          <span>透明化背景</span>
        </span>
      </div>
      <div className="flex w-full items-center">
        <span>当您的舞台内容过多过大时，一定要调小此值，防止图片过大崩溃</span>
      </div>
      <div className="my-2 flex justify-center gap-2">
        <Button
          onClick={() => {
            // 先清空box内部的内容
            const exportPngImageBox = document.getElementById("export-png-image-box");
            if (exportPngImageBox) {
              exportPngImageBox.innerHTML = "";
            }
            setCurrent(0);
            //
            StageExportPng.exportStage();
          }}
          disabled={isRendering}
        >
          <RefreshCcw /> 重新渲染图片
        </Button>
        {isRendering && (
          <div className="flex items-center gap-2">
            <span>渲染中...</span>
            <span>
              {current}/{total}
            </span>
          </div>
        )}
        <Button onClick={downloadImage}>
          <Download />
          下载当前图片
        </Button>
      </div>
      <div>
        <p className="text-panel-details-text text-xs">
          渲染图片时，会逐个拼接小块，需要等待若干秒才能完成渲染，摄像机缩放比率越大，渲染时间越长，画面分辨率越高
        </p>
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
