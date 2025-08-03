import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StageExportSvg, SvgExportConfig } from "@/core/service/dataGenerateService/stageExportEngine/StageExportSvg";
import { isWeb } from "@/utils/platform";
import { save as saveFileDialog } from "@tauri-apps/plugin-dialog";
import { useState } from "react";

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
      <Select
        value={configObject.imageMode}
        onValueChange={(value) => setConfigObject({ ...configObject, imageMode: value as any })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="图片节点导出模式" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>图片节点导出模式</SelectLabel>
            <SelectItem value="absolutePath">绝对路径</SelectItem>
            <SelectItem value="relativePath">相对路径</SelectItem>
            {/* <SelectItem value="base64">base64编码</SelectItem> */}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex flex-col gap-2">
        <Button onClick={onSaveSVGNew}>导出全部内容为SVG</Button>
        <Button onClick={onSaveSVGSelected}>仅导出选中的内容为SVG</Button>
      </div>
    </div>
  );
}
