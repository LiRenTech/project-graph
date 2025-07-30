import { save as saveFileDialog } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import Button from "@/components/Button";
import { Dialog } from "@/components/dialog";
import Select from "@/components/Select";
import { StageExportSvg, SvgExportConfig } from "@/core/service/dataGenerateService/stageExportEngine/StageExportSvg";
import { isWeb } from "@/utils/platform";

export default function ExportSvgPanel() {
  const onSaveSVGNew = async () => {
    const path = isWeb
      ? "file.svg"
      : await saveFileDialog({
          title: "另存为",
          defaultPath: "新文件.svg", // 提供一个默认的文件名
          filters: [
            {
              name: "Project Graph",
              extensions: ["svg"],
            },
          ],
        });

    if (!path) {
      return;
    }
    StageExportSvg.setConfig(configObject);
    const data = StageExportSvg.dumpStageToSVGString();
    try {
      await Stage.exportEngine.saveSvgHandle(path, data);
    } catch {
      await Dialog.show({
        title: "保存失败",
        content: "保存失败，请重试",
      });
    }
  };

  const onSaveSVGSelected = () => {
    StageExportSvg.setConfig(configObject);
    const svgString = StageExportSvg.dumpSelectedToSVGString();
    Dialog.show({
      title: "导出SVG",
      content:
        "SVG的本质是一堆标签代码，如果您是在写markdown格式的博客，可以直接把下面的标签代码粘贴在您的文章中。如果您想保存成文件，可以把这段代码复制到txt中并改后缀名成svg",
      code: svgString,
      type: "info",
    });
  };

  const [configObject, setConfigObject] = useState<SvgExportConfig>({
    imageMode: "relativePath",
  });

  return (
    <div className="bg-panel-bg text-panel-text p-4">
      <h2 className="mb-4 text-center text-2xl font-bold">导出SVG</h2>
      {/* 导出图片的svg使用绝对路径，使用相对路径，使用base64编码 */}
      <div className="mb-4">
        <p>图片节点导出模式：</p>
        <Select
          value={configObject.imageMode}
          options={[
            { label: "绝对路径", value: "absolutePath" },
            { label: "相对路径", value: "relativePath" },
            // { label: "base64编码", value: "base64" },
          ]}
          onChange={(value) => {
            if (value === "absolutePath" || value === "relativePath" || value === "base64") {
              setConfigObject({ ...configObject, imageMode: value });
            }
          }}
        ></Select>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={onSaveSVGNew}>导出全部内容为SVG</Button>
        <Button onClick={onSaveSVGSelected}>仅导出选中的内容为SVG</Button>
      </div>
    </div>
  );
}
