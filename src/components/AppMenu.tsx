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
} from "lucide-react";

export default function AppMenu({
  className = "",
  open = false,
}: {
  className?: string;
  open: boolean;
}) {
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        "flex origin-top-left scale-75 flex-col gap-4 rounded-md border border-neutral-700 bg-neutral-800 p-3 opacity-0 transition",
        {
          "scale-100 opacity-100": open,
        },
        className,
      )}
    >
      <Row icon={<File />}>
        <Col icon={<FilePlus />}>新建</Col>
        <Col icon={<FileText />}>打开</Col>
        <Col icon={<Save />}>保存</Col>
      </Row>
      <Row icon={<Plus />}>
        <Col icon={<Cuboid />}>节点</Col>
        <Col icon={<Image />}>图片</Col>
      </Row>
      <Row icon={<MoreHorizontal />}>
        <Col icon={<Settings />}>设置</Col>
        <Col icon={<Info />}>关于</Col>
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
      {icon}
      <div className="w-0.5 bg-neutral-700"></div>
      {children}
    </div>
  );
}

function Col({
  children,
  icon,
}: React.PropsWithChildren<{ icon: React.ReactNode }>) {
  return (
    <div className="flex w-max items-center gap-1 transition hover:opacity-80 active:scale-90">
      {icon}
      {children}
    </div>
  );
}
