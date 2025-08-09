import { Button } from "@/components/ui/button";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
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
  Dot,
  LayoutDashboard,
  Plus,
  Scissors,
  TextSelect,
  Trash,
} from "lucide-react";

const Content = ContextMenuContent;
const Item = ContextMenuItem;
const Sub = ContextMenuSub;
const SubTrigger = ContextMenuSubTrigger;
const SubContent = ContextMenuSubContent;
const Separator = ContextMenuSeparator;

export default function MyContextMenuContent() {
  const [p] = useAtom(activeProjectAtom);
  if (!p) return <></>;

  return (
    <Content>
      <Item className="bg-transparent! gap-0 p-0">
        <Button variant="ghost" size="icon">
          <Copy />
        </Button>
        <Button variant="ghost" size="icon">
          <Clipboard />
        </Button>
        <Button variant="ghost" size="icon">
          <Scissors />
        </Button>
        {p.stageManager.getSelectedStageObjects().length > 0 && (
          <Button variant="ghost" size="icon">
            <Trash className="text-destructive" />
          </Button>
        )}
      </Item>
      {p.stageManager.getSelectedStageObjects().length === 0 && (
        <>
          <Item>
            <TextSelect />
            新建文本节点
          </Item>
          <Sub>
            <SubTrigger>
              <Plus />
              新建节点
            </SubTrigger>
            <SubContent>
              <Item>
                <Dot />
                质点
              </Item>
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
          <Separator />
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
    </Content>
  );
}
