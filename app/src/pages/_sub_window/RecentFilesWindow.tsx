import { Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { CircleHelp, Delete, DoorOpen, File, FolderInput, LoaderPinwheel, Radiation, Star } from "lucide-react";
import React, { useEffect } from "react";
import Button from "../../components/Button";
import { Dialog } from "../../components/dialog";
import IconButton from "../../components/IconButton";
import Input from "../../components/Input";
import { RecentFileManager } from "../../core/service/dataFileService/RecentFileManager";
import { StartFilesManager } from "../../core/service/dataFileService/StartFilesManager";
import { SubWindow } from "../../core/service/SubWindow";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { cn } from "../../utils/cn";
import { PathString } from "../../utils/pathString";
import { isDesktop } from "../../utils/platform";

/**
 * 最近文件面板按钮
 * @returns
 */
export default function RecentFilesWindow({ winId = "" }: { winId?: string }) {
  /**
   * 数据中有多少就是多少
   */
  const [recentFiles, setRecentFiles] = React.useState<RecentFileManager.RecentFile[]>([]);
  /**
   * 经过搜索字符串过滤后的
   */
  const [recentFilesFiltered, setRecentFilesFiltered] = React.useState<RecentFileManager.RecentFile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // 当前预选中的文件下标
  const [currentPreselect, setCurrentPreselect] = React.useState<number>(0);
  const [searchString, setSearchString] = React.useState("");

  /**
   * 用于刷新页面显示
   */
  const updateRecentFiles = async () => {
    setIsLoading(true);
    await RecentFileManager.validAndRefreshRecentFiles();
    await RecentFileManager.sortTimeRecentFiles();
    const files = await RecentFileManager.getRecentFiles();
    setRecentFiles(files);
    setRecentFilesFiltered(files);
    setIsLoading(false);
  };

  const onInputChange = (input: string) => {
    if (input === "#") {
      // 默认的shift + 3 会触发井号
      return;
    }
    setCurrentPreselect(0); // 一旦有输入，就设置下标为0
    setSearchString(input);
    setRecentFilesFiltered(recentFiles.filter((file) => file.path.includes(input)));
  };

  useEffect(() => {
    updateRecentFiles();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const currentRect = SubWindow.get(winId).rect;
    const createdWin = SubWindow.create({
      titleBarOverlay: true,
      children: (
        <div className="flex flex-col gap-1 p-5">
          <span className="text-sm">文件路径</span>
          <span>{recentFilesFiltered[currentPreselect].path}</span>
          <div className="h-1"></div>
          <span className="text-sm">修改时间</span>
          <span>{new Date(recentFilesFiltered[currentPreselect].time).toLocaleString()}</span>
          <div className="flex flex-col items-start gap-2 pt-1">
            <Button onClick={() => addToStartFiles(recentFilesFiltered[currentPreselect].path)}>
              <Star />
              收藏
            </Button>
            <Button onClick={() => addPortalNodeToStage(recentFilesFiltered[currentPreselect].path)}>
              <DoorOpen />
              创建传送门
            </Button>
            <Button onClick={() => removeStartFile(recentFilesFiltered[currentPreselect].path)}>
              <Delete />
              删除
            </Button>
          </div>
        </div>
      ),
      rect: new Rectangle(currentRect.rightTop.add(new Vector(10, 0)), Vector.same(-1)),
      closeWhenClickOutside: true,
    });
    return () => {
      SubWindow.close(createdWin.id);
    };
  }, [currentPreselect, isLoading]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      setCurrentPreselect((prev) => Math.max(0, prev - 1));
    } else if (e.key === "ArrowDown") {
      setCurrentPreselect((prev) => Math.min(recentFilesFiltered.length - 1, prev + 1));
    } else if (e.key === "Enter") {
      const file = recentFilesFiltered[currentPreselect];
      checkoutFile(file);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [recentFilesFiltered]); // isRecentFilePanelOpen, recentFiles, currentPreselect

  const onCheckoutFile = (file: RecentFileManager.RecentFile) => {
    if (currentFile === Stage.path.draftName) {
      Dialog.show({
        title: "真的要切换吗？",
        content: "您现在的新建草稿没有保存，是否要切换项目？",
        buttons: [
          {
            text: "取消",
            onClick: () => {},
          },
          {
            text: "切换",
            onClick: () => {
              checkoutFile(file);
            },
          },
        ],
      });
    } else {
      if (StageSaveManager.isSaved()) {
        checkoutFile(file);
      } else {
        Dialog.show({
          title: "切换失败",
          content: "由于您当前的文件没有保存，请先保存后再切换文件",
          type: "error",
        });
      }
    }
  };
  const checkoutFile = (file: RecentFileManager.RecentFile) => {
    try {
      const path = file.path;
      setFile(decodeURIComponent(path));
      if (isDesktop && !path.endsWith(".json")) {
        Dialog.show({
          title: "请选择一个JSON文件",
          type: "error",
        });
        return;
      }
      FileLoader.openFileByPath(path);
      SubWindow.close(winId);
    } catch (error) {
      Dialog.show({
        title: "请选择正确的JSON文件",
        content: String(error),
        type: "error",
      });
    }
  };
  const addToStartFiles = async (path: string) => {
    const addSuccess = await StartFilesManager.addStartFile(path);
    if (!addSuccess) {
      Dialog.show({
        title: "文件添加失败",
        content: `可能是重复了：${path}`,
        type: "error",
      });
    } else {
      Dialog.show({
        title: "添加成功",
        content: `已经成功添加到快速启动界面的列表：${path}`,
        type: "success",
      });
    }
  };

  const removeStartFile = async (path: string) => {
    const removeSuccess = await RecentFileManager.removeRecentFileByPath(path);
    if (!removeSuccess) {
      Dialog.show({
        title: "文件删除失败",
        content: `可能是文件不存在：${path}`,
        type: "error",
      });
    } else {
      Dialog.show({
        title: "删除成功",
        content: `已经成功从快速启动界面的列表中删除：${path}`,
        type: "success",
      });
      updateRecentFiles();
    }
  };

  const addPortalNodeToStage = (path: string) => {
    const result = StageManager.addPortalNodeToStage(path);
    if (result) {
      Dialog.show({
        title: "添加传送门成功",
        content: `已经成功添加传送门：${path}，注意看您的舞台上已经多了一个传送门`,
      });
    } else {
      Dialog.show({
        title: "添加传送门失败",
        content: `可能是这个文件和当前文件路径距离过远`,
      });
    }
  };

  return (
    <div className={cn("flex h-full flex-col items-center gap-2")}>
      {/* 顶部区域 */}
      <div className="flex items-center gap-2">
        <IconButton
          onClick={() => {
            Dialog.show({
              title: "“最近打开的文件”界面说明",
              content:
                "点击文件列表中的文件可以快速切换\n搜索和筛选文件时，会根据绝对路径匹配\n可用快捷键打开和关闭此面板",
            });
          }}
          tooltip="查看帮助"
        >
          <CircleHelp />
        </IconButton>
        <IconButton
          onClick={async () => {
            try {
              const path = await openFileDialog({
                title: "选择包含JSON文件的文件夹",
                directory: true,
                multiple: false,
              });
              if (!path) {
                return;
              }
              const jsonFiles = await readFolderRecursive(path, [".json"]);
              const filteredFiles = jsonFiles.filter((path) => !path.toLowerCase().includes("backup"));

              await RecentFileManager.addRecentFilesByPaths(filteredFiles);
              updateRecentFiles();
              Dialog.show({
                title: "导入完成",
                content: `成功导入 ${filteredFiles.length} 个文件，过滤掉 ${jsonFiles.length - filteredFiles.length} 个备份文件`,
                type: filteredFiles.length > 0 ? "success" : "info",
              });
            } catch (error) {
              Dialog.show({
                title: "导入失败",
                content: String(error),
                type: "error",
              });
            }
          }}
          tooltip="从文件夹导入多个文件进入列表"
        >
          <FolderInput />
        </IconButton>
        <IconButton
          className="cursor-pointer rounded"
          onClick={() => {
            Dialog.show({
              title: "确认操作",
              content: "确认清空全部记录？",
              buttons: [
                {
                  text: "取消",
                  onClick: () => {},
                },
                {
                  text: "确认",
                  onClick: () => {
                    setRecentFiles([]);
                    RecentFileManager.clearRecentFiles();
                  },
                },
              ],
            });
          }}
          tooltip="清空全部记录"
        >
          <Radiation />
        </IconButton>
      </div>
      <Input placeholder="请输入要筛选的文件" onChange={onInputChange} value={searchString} autoFocus />

      {/* 加载中提示 */}
      {isLoading && (
        <div className="flex h-full items-center justify-center text-8xl">
          <LoaderPinwheel className="scale-200 animate-spin" />
        </div>
      )}
      {/* 滚动区域单独封装 */}
      {!isLoading && recentFilesFiltered.length === 0 && (
        <div className="flex h-full items-center justify-center text-8xl">
          <span>NULL</span>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {recentFilesFiltered.map((file, index) => (
          <div
            key={index}
            className={cn("flex origin-left items-center gap-2 border-l-4 border-transparent px-2 py-1 opacity-75", {
              "border-panel-success-text scale-110 opacity-100": index === currentPreselect,
            })}
            onMouseEnter={() => setCurrentPreselect(index)}
            onClick={() => onCheckoutFile(file)}
          >
            <File size={16} />
            {PathString.absolute2file(file.path)}
          </div>
        ))}
      </div>
    </div>
  );
}

RecentFilesWindow.open = () => {
  SubWindow.create({
    title: "最近打开的文件",
    children: <RecentFilesWindow />,
    rect: new Rectangle(new Vector(50, 50), new Vector(250, window.innerHeight - 100)),
  });
};
