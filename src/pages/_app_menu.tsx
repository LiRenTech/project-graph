import React from "react";
import { cn } from "../utils/cn";
import {
  Cuboid,
  File,
  FilePlus,
  FileText,
  Image,
  Info,
  MoreHorizontal,
  Plus,
  Save,
  Settings,
  TestTube2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { NodeValidator } from "../core/NodeValidator";
import { useDialog } from "../utils/dialog";
import { isDesktop } from "../utils/platform";
import { NodeManager } from "../core/NodeManager";
import { Node } from "../core/Node";

export default function AppMenu({
  className = "",
  open = false,
}: {
  className?: string;
  open: boolean;
}) {
  const navigate = useNavigate();
  const dialog = useDialog();

  const onOpen = async () => {
    const path = await openFileDialog({
      title: "打开文件",
      directory: false,
      multiple: false,
      filters: isDesktop
        ? [
            {
              name: "Project Graph",
              extensions: ["json"],
            },
          ]
        : [],
    });
    if (!path) {
      return;
    }
    if (isDesktop && !path.endsWith(".json")) {
      dialog.show({
        title: "请选择JSON文件",
        type: "error",
      });
      return;
    }
    try {
      const content = await readTextFile(path);
      const data = NodeValidator.validate(JSON.parse(content));
      const startTime = performance.now();
      for (const node of data.nodes) {
        NodeManager.addNode(new Node(node));
      }
      const endTime = performance.now();
      dialog.show({
        title: "导入成功",
        content: `\
解析耗时: ${(endTime - startTime).toFixed(2)} ms
${data.nodes.length} 个节点，${data.edges.length} 条边`,
        type: "success",
      });
    } catch (e) {
      dialog.show({
        title: "请选择正确的JSON文件",
        content: String(e),
        type: "error",
      });
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-none flex origin-top-left scale-75 flex-col gap-4 rounded-md border border-neutral-700 bg-neutral-800 p-3 opacity-0 transition",
        {
          "pointer-events-auto scale-100 opacity-100": open,
        },
        className,
      )}
    >
      <Row icon={<File />}>
        <Col icon={<FilePlus />}>新建</Col>
        <Col icon={<FileText />} onClick={onOpen}>
          打开
        </Col>
        <Col icon={<Save />}>保存</Col>
      </Row>
      <Row icon={<Plus />}>
        <Col icon={<Cuboid />}>节点</Col>
        <Col icon={<Image />}>图片</Col>
      </Row>
      <Row icon={<MoreHorizontal />}>
        <Col icon={<Settings />} onClick={() => navigate("/settings")}>
          设置
        </Col>
        <Col icon={<Info />} onClick={() => navigate("/about")}>
          关于
        </Col>
        <Col icon={<TestTube2 />} onClick={() => navigate("/test")}>
          测试
        </Col>
      </Row>
    </div>
  );
}

function Row({
  children,
  icon,
}: React.PropsWithChildren<{ icon: React.ReactNode }>) {
  return (
    <div className="flex gap-2">
      <span className="text-neutral-400">{icon}</span>
      <div className="w-0.5 bg-neutral-700"></div>
      {children}
    </div>
  );
}

function Col({
  children,
  icon,
  onClick = () => {},
}: React.PropsWithChildren<{ icon: React.ReactNode; onClick?: () => void }>) {
  return (
    <div
      className="flex w-max items-center gap-1 transition hover:opacity-80 active:scale-90"
      onClick={onClick}
    >
      {icon}
      {children}
    </div>
  );
}
