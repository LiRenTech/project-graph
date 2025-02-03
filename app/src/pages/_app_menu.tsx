import { open as openFileDialog, save as saveFileDialog } from "@tauri-apps/plugin-dialog";
import { useAtom } from "jotai";
import {
  AppWindow,
  Database,
  Dock,
  File,
  FileCode,
  FilePlus,
  FileText,
  FileType,
  Folder,
  FolderCog,
  FolderOpen,
  Fullscreen,
  Info,
  MoreHorizontal,
  // PartyPopper,
  RefreshCcw,
  Save,
  Scaling,
  Settings as SettingsIcon,
  SquareDashedKanbanIcon,
  SquareDashedMousePointer,
  TestTube2,
  View,
} from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "../core/stage/Camera";
import { StageDumper } from "../core/stage/StageDumper";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { fileAtom, isExportTreeTextPanelOpenAtom, isRecentFilePanelOpenAtom } from "../state";
import { cn } from "../utils/cn";
import { getCurrentWindow, isDesktop, isWeb } from "../utils/platform";
// import { writeTextFile } from "@tauri-apps/plugin-fs";
import { dataDir } from "@tauri-apps/api/path";
import { useTranslation } from "react-i18next";
import { Dialog } from "../components/dialog";
import { Settings } from "../core/service/Settings";
import { RecentFileManager } from "../core/service/dataFileService/RecentFileManager";
import { StageSaveManager } from "../core/service/dataFileService/StageSaveManager";
import { StageExportSvg } from "../core/service/dataGenerateService/stageExportEngine/StageExportSvg";
import { CopyEngine } from "../core/service/dataManageService/copyEngine/copyEngine";
import { Stage } from "../core/stage/Stage";
import { GraphMethods } from "../core/stage/stageManager/basicMethods/GraphMethods";
import { TextNode } from "../core/stage/stageObject/entity/TextNode";
import { PathString } from "../utils/pathString";
import { VFileSystem } from "../core/service/dataFileService/VFileSystem";
import { PROJECT_GRAPH_FILE_EXT } from "../utils/fs/com";

export default function AppMenu({ className = "", open = false }: { className?: string; open: boolean }) {
  const navigate = useNavigate();
  const [file, setFile] = useAtom(fileAtom);
  const { t } = useTranslation("appMenu");
  const [, setRecentFilePanelOpen] = useAtom(isRecentFilePanelOpenAtom);
  const [, setExportTreeTextPanelOpen] = useAtom(isExportTreeTextPanelOpenAtom);

  /**
   * 新建草稿
   */
  const onNewDraft = async () => {
    if (StageSaveManager.isSaved() || StageManager.isEmpty()) {
      StageManager.destroy();
      await VFileSystem.clear();
      setFile("Project Graph");
    } else {
      // 当前文件未保存
      // 但当前可能是草稿没有保存，也可能是曾经的文件改动了没有保存
      Dialog.show({
        title: "未保存",
        content: "您打算新建一个文件，但当前文件未保存，请选择您的操作",
        buttons: [
          {
            text: "保存",
            onClick: () => {
              onSave().then(onNewDraft);
            },
          },
          {
            text: "丢弃当前并直接新开",
            onClick: async () => {
              StageManager.destroy();
              await VFileSystem.clear();
              setFile("Project Graph");
            },
          },
          { text: "我再想想" },
        ],
      });
    }
  };

  const onOpen = async (legacy: boolean = false) => {
    if (!StageSaveManager.isSaved()) {
      if (StageManager.isEmpty()) {
        //空项目不需要保存
        StageManager.destroy();
        openFileByDialogWindow(legacy);
      } else if (Stage.path.isDraft()) {
        Dialog.show({
          title: "草稿未保存",
          content: "当前草稿未保存，是否保存？",
          buttons: [
            { text: "我再想想" },
            { text: "保存草稿", onClick: onSave },
            {
              text: "丢弃并打开新文件",
              onClick: () => {
                StageManager.destroy();
                openFileByDialogWindow(legacy);
              },
            },
          ],
        });
      } else {
        Dialog.show({
          title: "未保存",
          content: "是否保存当前文件？",
          buttons: [
            {
              text: "保存并打开新文件",
              onClick: () => {
                onSave().then(() => openFileByDialogWindow(legacy));
              },
            },
            { text: "我再想想" },
          ],
        });
      }
    } else {
      // 直接打开文件
      openFileByDialogWindow(legacy);
    }
  };

  const openLegacyFileByDialogWindow = async () => {
    const path = isWeb
      ? "file.json"
      : await openFileDialog({
          title: "打开文件",
          directory: false,
          multiple: false,
          filters: [],
        });
    if (!path) {
      return;
    }
    try {
      await RecentFileManager.openLegacyFileByPath(path); // 已经包含历史记录重置功能
      // 设置为草稿
      setFile("Project Graph");
    } catch (e) {
      Dialog.show({
        title: "请选择正确的文件",
        content: String(e),
        type: "error",
      });
    }
  };

  const openFileByDialogWindow = async (legacy: boolean = false) => {
    if (legacy) return openLegacyFileByDialogWindow();
    const path = isWeb
      ? `file.${PROJECT_GRAPH_FILE_EXT}`
      : await openFileDialog({
          title: "打开文件",
          directory: false,
          multiple: false,
          filters: isDesktop
            ? [
                {
                  name: "Project Graph",
                  extensions: [PROJECT_GRAPH_FILE_EXT],
                },
              ]
            : [],
        });
    if (!path) {
      return;
    }
    if (isDesktop && !path.endsWith(`.${PROJECT_GRAPH_FILE_EXT}`)) {
      Dialog.show({
        title: `请选择一个.${PROJECT_GRAPH_FILE_EXT}文件`,
        type: "error",
      });
      return;
    }
    try {
      const isOpenSuccess = await RecentFileManager.openFileByPath(path); // 已经包含历史记录重置功能
      if (isOpenSuccess) {
        // 更改file
        setFile(path);
      }
    } catch (e) {
      Dialog.show({
        title: `请选择正确的.${PROJECT_GRAPH_FILE_EXT}文件`,
        content: String(e),
        type: "error",
      });
    }
  };

  const onSave = async () => {
    const path_ = file;

    if (path_ === "Project Graph") {
      // 如果文件名为 "Project Graph" 则说明是新建文件。
      // 要走另存为流程
      await onSaveNew();
      return;
    }
    const data = StageDumper.dump(); // 获取当前节点和边的数据
    // 2024年10月6日发现保存文件也开始变得没有权限了，可能是tauri-plugin-fs的bug
    // await writeTextFile(path, JSON.stringify(data, null, 2)); // 将数据写入文件
    try {
      await StageSaveManager.saveHandle(path_, data);
    } catch (e) {
      console.error(e);
      await Dialog.show({
        title: "保存失败",
        content: "保存失败，请重试",
      });
    }
  };

  const onSaveNew = async () => {
    const path = isWeb
      ? `file.${PROJECT_GRAPH_FILE_EXT}`
      : await saveFileDialog({
          title: "另存为",
          defaultPath: `新文件.${PROJECT_GRAPH_FILE_EXT}`, // 提供一个默认的文件名
          filters: [
            {
              name: "Project Graph",
              extensions: [PROJECT_GRAPH_FILE_EXT],
            },
          ],
        });

    if (!path) {
      return;
    }

    const data = StageDumper.dump(); // 获取当前节点和边的数据
    try {
      await StageSaveManager.saveHandle(path, data);
      setFile(path);
    } catch (e) {
      console.error(e);
      await Dialog.show({
        title: "保存失败",
        content: "保存失败，请重试",
      });
    }
  };
  const onBackup = async () => {
    try {
      if (Stage.path.isDraft()) {
        const autoBackupDraftPath = await Settings.get("autoBackupDraftPath");
        const backupPath = `${autoBackupDraftPath}${PathString.getSep()}${PathString.getTime()}.json`;
        await StageSaveManager.backupHandle(backupPath, StageDumper.dump());
        return;
      }
      await StageSaveManager.backupHandleWithoutCurrentPath(StageDumper.dump(), true);
    } catch {
      await Dialog.show({
        title: "备份失败",
        content: "备份失败，请重试",
      });
    }
  };
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

  const onExportTreeText = async () => {
    const selectedNodes = StageManager.getSelectedEntities().filter((entity) => entity instanceof TextNode);
    if (selectedNodes.length === 0) {
      Dialog.show({
        title: "没有选中节点",
        content: "请先至少选择一个节点再使用此功能",
        type: "error",
      });
      return;
    }
    setExportTreeTextPanelOpen(true);
  };

  const onSaveMarkdownNew = async () => {
    const selectedNodes = StageManager.getSelectedEntities().filter((entity) => entity instanceof TextNode);
    if (selectedNodes.length === 0) {
      Dialog.show({
        title: "没有选中节点",
        content: "请先选中一个根节点再使用此功能，并且根节点所形成的结构必须为树状结构",
        type: "error",
      });
      return;
    } else if (selectedNodes.length > 1) {
      Dialog.show({
        title: "选中节点数量过多",
        content: "只能选中一个根节点，并且根节点所形成的结构必须为树状结构",
        type: "error",
      });
      return;
    }
    if (!GraphMethods.isTree(selectedNodes[0])) {
      Dialog.show({
        title: "结构错误",
        content: "根节点所形成的结构必须为树状结构",
        type: "error",
      });
      return;
    }

    const path = isWeb
      ? "file.md"
      : await saveFileDialog({
          title: "另存为",
          defaultPath: "新文件.md", // 提供一个默认的文件名
          filters: [
            {
              name: "Project Graph",
              extensions: ["md"],
            },
          ],
        });

    if (!path) {
      return;
    }
    try {
      await Stage.exportEngine.saveMarkdownHandle(path, selectedNodes[0]);
    } catch {
      await Dialog.show({
        title: "保存失败",
        content: "保存失败，请重试",
      });
    }
  };

  useEffect(() => {
    RecentFileManager.startHookFunction = (autoOpenPath: string) => {
      if (RecentFileManager.isOpenByPathWhenAppStart()) {
        // 触发用户打开自定义工程文件
        setFile(autoOpenPath);
      } else {
        // 没有触发用户打开自定义工程文件
        setFile("Project Graph");
      }
    };
  }, []);

  useEffect(() => {
    // 绑定快捷键
    const keyDownFunction = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "n") {
        onNewDraft();
      } else if (e.ctrlKey && e.key === "o") {
        onOpen();
      } else if (e.ctrlKey && e.key === "s") {
        onSave();
      } else if (e.altKey && e.key === "F4") {
        if (StageSaveManager.isSaved()) {
          getCurrentWindow().close();
        } else {
          onSave().then(() => getCurrentWindow().close());
        }
      }
    };
    document.addEventListener("keydown", keyDownFunction);

    return () => {
      document.removeEventListener("keydown", keyDownFunction);
    };
  }, [file]); // 不能填空数组，否则绑定的函数里面的 file 值不会更新

  return (
    <div
      className={cn(
        "bg-appmenu-bg border-appmenu-border !pointer-events-none flex origin-top-left scale-0 flex-col gap-4 rounded-md border p-3 opacity-0",
        {
          "!pointer-events-auto scale-100 opacity-100": open,
        },
        className,
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Row icon={<File />} title={t("file.title")}>
        <Col icon={<FilePlus />} onClick={onNewDraft}>
          {t("file.items.new")}
        </Col>
        <Col icon={<FileText />} onClick={() => onOpen()}>
          {t("file.items.open")}
        </Col>
        {!isWeb && (
          <>
            <Col icon={<FileText />} onClick={() => setRecentFilePanelOpen(true)}>
              {t("file.items.recent")}
            </Col>
            <Col icon={<Save />} onClick={onSave}>
              {t("file.items.save")}
            </Col>
          </>
        )}
        <Col icon={<Save />} onClick={onSaveNew}>
          {t("file.items.saveAs")}
        </Col>

        {!isWeb && (
          <Col icon={<Database />} onClick={onBackup}>
            {t("file.items.backup")}
          </Col>
        )}
        {!isWeb && (
          <Col icon={<FileText />} onClick={() => onOpen(true)}>
            {t("file.items.openLegacy")}
          </Col>
        )}
      </Row>
      {!isWeb && (
        <Row icon={<Folder />} title={t("location.title")}>
          <Col
            icon={<FolderCog />}
            onClick={async () => {
              Dialog.show({
                title: "数据文件夹位置",
                type: "info",
                code: await dataDir(),
                content: "软件数据文件夹位置",
              });
            }}
          >
            {t("location.items.openDataFolder")}
          </Col>
          <Col
            icon={<FolderOpen />}
            onClick={() => {
              Dialog.show({
                title: "数据文件夹位置",
                type: "info",
                code: file,
                content: "软件数据文件夹位置",
              });
            }}
          >
            {t("location.items.openProjectFolder")}
          </Col>
        </Row>
      )}
      <Row icon={<File />} title={t("export.title")}>
        <Col icon={<FileCode />} onClick={onSaveSVGNew}>
          {t("export.items.exportAsSVGByAll")}
        </Col>
        <Col icon={<FileType />} onClick={onSaveMarkdownNew}>
          {t("export.items.exportAsMarkdownBySelected")}
        </Col>
        <Col icon={<FileCode />} onClick={onExportTreeText}>
          {t("export.items.exportAsPlainText")}
        </Col>
      </Row>
      <Row icon={<View />} title={t("view.title")}>
        <Col icon={<SquareDashedKanbanIcon />} onClick={() => Camera.reset()}>
          {t("view.items.resetByAll")}
        </Col>
        <Col icon={<SquareDashedMousePointer />} onClick={() => Camera.resetBySelected()}>
          {t("view.items.resetBySelect")}
        </Col>
        <Col icon={<Scaling />} onClick={() => Camera.resetScale()}>
          {t("view.items.resetScale")}
        </Col>
      </Row>
      <Row icon={<MoreHorizontal />} title={t("more.title")}>
        <Col icon={<SettingsIcon />} onClick={() => navigate("/settings/visual")}>
          {t("more.items.settings")}
        </Col>
        <Col icon={<Info />} onClick={() => navigate("/settings/about")}>
          {t("more.items.about")}
        </Col>
        {/* welcome界面没有东西，容易误导 */}
        {/* <Col
          icon={<PartyPopper />}
          onClick={() => {
            navigate("/welcome");
          }}
        >
          {t("more.items.welcome")}
        </Col> */}
      </Row>
      {!isWeb && (
        <Row icon={<AppWindow />} title={t("window.title")}>
          {import.meta.env.DEV && (
            <Col icon={<RefreshCcw />} onClick={() => window.location.reload()}>
              {t("window.items.refresh")}
            </Col>
          )}
          <Col
            icon={<Fullscreen />}
            onClick={() =>
              getCurrentWindow()
                .isFullscreen()
                .then((res) => getCurrentWindow().setFullscreen(!res))
            }
          >
            {t("window.items.fullscreen")}
          </Col>
        </Row>
      )}
      {import.meta.env.DEV && (
        <Row icon={<Dock />} title="测试">
          <Col icon={<TestTube2 />} onClick={() => navigate("/test")}>
            测试页面
          </Col>
          <Col icon={<TestTube2 />} onClick={() => navigate("/ui_test")}>
            ui
          </Col>
          <Col icon={<TestTube2 />} onClick={() => navigate("/info")}>
            Info
          </Col>
          <Col
            icon={<TestTube2 />}
            onClick={() =>
              Dialog.show({
                title: "舞台序列化",
                type: "info",
                code: JSON.stringify(StageDumper.dump(), null, 2),
              })
            }
          >
            看json
          </Col>
          <Col
            icon={<TestTube2 />}
            onClick={() =>
              Dialog.show({
                title: "舞台序列化",
                type: "info",
                code: JSON.stringify(CopyEngine.copyBoardData, null, 2),
              })
            }
          >
            clipboard json
          </Col>
          <Col
            icon={<TestTube2 />}
            onClick={() => {
              StageManager.destroy();
            }}
          >
            废了
          </Col>
          <Col
            icon={<TestTube2 />}
            onClick={() => {
              throw new Error("手动报错");
            }}
          >
            报错
          </Col>
          <Col
            icon={<TestTube2 />}
            onClick={() => {
              StageManager.switchLineEdgeToCrEdge();
            }}
          >
            Cr
          </Col>
          <Col
            icon={<TestTube2 />}
            onClick={() => {
              StageManager.moveAllEntityToIntegerLocation();
            }}
          >
            int
          </Col>
        </Row>
      )}
    </div>
  );
}

function Row({ children, title, icon }: React.PropsWithChildren<{ title: string; icon: React.ReactNode }>) {
  return (
    <div className="flex gap-2">
      <span className="text-appmenu-category-title flex gap-1">
        {icon} {title}
      </span>
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
      className="hover:bg-appmenu-hover-bg hover:outline-appmenu-hover-bg text-appmenu-item-text flex w-max cursor-pointer items-center gap-1 rounded-lg outline-0 outline-white/0 transition-all hover:outline-8 active:scale-90"
      onClick={onClick}
    >
      {icon}
      {children}
    </div>
  );
}
