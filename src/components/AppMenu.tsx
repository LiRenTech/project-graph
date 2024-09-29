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

export default function AppMenu({
  className = "",
  open = false,
}: {
  className?: string;
  open: boolean;
}) {
  const navigate = useNavigate();

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
        <Col
          icon={<FileText />}
          onClick={async () => {
            const path = await openFileDialog({
              multiple: false,
              directory: false,
              filters: [
                {
                  name: "Project Graph",
                  extensions: ["json"],
                },
              ],
            });
            if (!path) {
              return;
            }
            const content = await readTextFile(path);
            try {
              const data = NodeValidator.validate(JSON.parse(content));
              console.log(data);
              alert("导入成功");
            } catch (e) {
              alert(e);
            }
          }}
        >
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
