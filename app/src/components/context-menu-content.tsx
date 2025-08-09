import { Button } from "@/components/ui/button";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { MouseLocation } from "@/core/service/controlService/MouseLocation";
import { TextNode } from "@/core/stage/stageObject/entity/TextNode";
import { activeProjectAtom } from "@/state";
import { useAtom } from "jotai";
import {
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  Asterisk,
  Box,
  Clipboard,
  Copy,
  LayoutDashboard,
  Package,
  Plus,
  Scissors,
  TextSelect,
  Trash,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const Content = ContextMenuContent;
const Item = ContextMenuItem;
const Sub = ContextMenuSub;
const SubTrigger = ContextMenuSubTrigger;
const SubContent = ContextMenuSubContent;
// const Separator = ContextMenuSeparator;

export default function MyContextMenuContent() {
  const [p] = useAtom(activeProjectAtom);
  if (!p) return <></>;

  return (
    <Content>
      <Item className="bg-transparent! gap-0 p-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Copy />
            </Button>
          </TooltipTrigger>
          <TooltipContent>复制</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Clipboard />
            </Button>
          </TooltipTrigger>
          <TooltipContent>粘贴</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Scissors />
            </Button>
          </TooltipTrigger>
          <TooltipContent>剪切</TooltipContent>
        </Tooltip>
        {p.stageManager.getSelectedStageObjects().length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => p.stageManager.deleteSelectedStageObjects()}>
                <Trash className="text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>删除</TooltipContent>
          </Tooltip>
        )}
      </Item>
      {p.stageManager.getSelectedStageObjects().length === 0 && (
        <>
          <Item
            onClick={() =>
              p.controllerUtils.addTextNodeByLocation(p.renderer.transformView2World(MouseLocation.vector()), true)
            }
          >
            <TextSelect />
            新建文本节点
          </Item>
          <Sub>
            <SubTrigger>
              <Plus />
              新建节点
            </SubTrigger>
            <SubContent>
              {/* <Item
                onClick={() =>
                  p.controllerUtils.createConnectPoint(p.renderer.transformView2World(MouseLocation.vector()))
                }
              >
                <Dot />
                质点
              </Item> */}
              <Item>待完善...</Item>
            </SubContent>
          </Sub>
        </>
      )}
      {p.stageManager.getSelectedEntities().length >= 2 && (
        <>
          <Sub>
            <SubTrigger>
              <LayoutDashboard />
              对齐
            </SubTrigger>
            <SubContent className="grid min-w-0 grid-cols-3 grid-rows-3">
              <div />
              <Button variant="ghost" size="icon" className="size-6">
                <AlignStartHorizontal />
              </Button>
              <div />
              <Button variant="ghost" size="icon" className="size-6">
                <AlignStartVertical />
              </Button>
              <div />
              <Button variant="ghost" size="icon" className="size-6">
                <AlignEndVertical />
              </Button>
              <div />
              <Button variant="ghost" size="icon" className="size-6">
                <AlignEndHorizontal />
              </Button>
            </SubContent>
          </Sub>
          <Item onClick={() => p.stageManager.packEntityToSectionBySelected()}>
            <Box />
            打包为 Section
          </Item>
          <Sub>
            <SubTrigger>
              <Plus />
              创建关系
            </SubTrigger>
            <SubContent>
              <Item>
                <Asterisk />
                无源多向边
              </Item>
            </SubContent>
          </Sub>
        </>
      )}
      {p.stageManager.getSelectedEntities().filter((it) => it instanceof TextNode).length > 0 && (
        <>
          <Item
            onClick={() =>
              p.stageManager.getSelectedEntities().map((it) => p.sectionPackManager.targetTextNodeToSection(it))
            }
          >
            <Package />
            {p.stageManager.getSelectedEntities().length >= 2 && "分别"}转换为 Section
          </Item>
        </>
      )}
    </Content>
  );
}
