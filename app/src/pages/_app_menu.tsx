import { open as openFileDialog, save as saveFileDialog } from "@tauri-apps/plugin-dialog";
import { open as openFilePath } from "@tauri-apps/plugin-shell";
import { useAtom } from "jotai";
import {
  AppWindow,
  Axe,
  Database,
  Dock,
  File,
  FileCode,
  FileType,
  Folder,
  FolderCog,
  FolderOpen,
  Fullscreen,
  Info,
  Monitor,
  MonitorX,
  MoreHorizontal,
  PersonStanding,
  Radar,
  // PartyPopper,
  RefreshCcw,
  Save,
  Scaling,
  Search,
  Settings as SettingsIcon,
  SquareDashedMousePointer,
  TestTube2,
  Undo,
  View,
  Image as ImageIcon,
  FileClock,
  FileInput,
  FilePlus2,
  FileDown,
  Rabbit,
  Group,
  ScrollText,
  RefreshCcwDot,
} from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "../core/stage/Camera";
import { StageDumper } from "../core/stage/StageDumper";
import { StageManager } from "../core/stage/stageManager/StageManager";
import {
  fileAtom,
  isClassroomModeAtom,
  isExportPNGPanelOpenAtom,
  isExportTreeTextPanelOpenAtom,
  isRecentFilePanelOpenAtom,
} from "../state";
import { cn } from "../utils/cn";
import { getCurrentWindow, isDesktop, isWeb } from "../utils/platform";
// import { writeTextFile } from "@tauri-apps/plugin-fs";
import { dataDir } from "@tauri-apps/api/path";
import { useTranslation } from "react-i18next";
import { Dialog } from "../components/dialog";
import { Panel } from "../components/panel";
import { Popup } from "../components/popup";
import { Settings } from "../core/service/Settings";
import { RecentFileManager } from "../core/service/dataFileService/RecentFileManager";
import { StageSaveManager } from "../core/service/dataFileService/StageSaveManager";
import { ComplexityDetector } from "../core/service/dataManageService/ComplexityDetector";
import { CopyEngine } from "../core/service/dataManageService/copyEngine/copyEngine";
import { SoundService } from "../core/service/feedbackService/SoundService";
import { HelpService } from "../core/service/helpService/helpService";
import { Stage } from "../core/stage/Stage";
import { StageHistoryManager } from "../core/stage/stageManager/StageHistoryManager";
import { GraphMethods } from "../core/stage/stageManager/basicMethods/GraphMethods";
import { TextNode } from "../core/stage/stageObject/entity/TextNode";
import { PathString } from "../utils/pathString";
import ComplexityResultPanel from "./_fixed_panel/_complexity_result_panel";
import ExportSvgPanel from "./_popup_panel/_export_svg_panel";
import SearchingNodePanel from "./_popup_panel/_searching_node_panel";
import { createFolder, exists } from "../utils/fs";

export default function AppMenu({ className = "", open = false }: { className?: string; open: boolean }) {
  const navigate = useNavigate();
  const [file, setFile] = useAtom(fileAtom);
  const [isClassroomMode] = useAtom(isClassroomModeAtom);
  const { t } = useTranslation("appMenu");
  const [, setRecentFilePanelOpen] = useAtom(isRecentFilePanelOpenAtom);
  const [, setExportTreeTextPanelOpen] = useAtom(isExportTreeTextPanelOpenAtom);
  const [, setExportPNGPanelOpen] = useAtom(isExportPNGPanelOpenAtom);

  /**
   * 新建草稿
   */
  const onNewDraft = () => {
    if (StageSaveManager.isSaved() || StageManager.isEmpty()) {
      StageManager.destroy();
      setFile("Project Graph");
      Camera.reset();
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
            onClick: () => {
              StageManager.destroy();
              setFile("Project Graph");
              Camera.reset();
            },
          },
          { text: "我再想想" },
        ],
      });
    }
  };

  /**
   * 新建文件夹和文件
   */
  const onNewFile = async () => {
    // 选择文件夹路径
    if (!StageSaveManager.isSaved()) {
      Dialog.show({
        title: "未保存",
        content: "您打算新建一个文件，但当前文件未保存，请选择您的操作",
        buttons: [
          {
            text: "保存",
            onClick: onSave,
          },
        ],
      });
      return;
    }
    const path = await saveFileDialog({
      title: "新建文件，更改“XXX”时，不要输入后缀名，直接输入文件名即可",
      defaultPath: "XXX", // 提供一个默认的文件名
      // filters: [
      //   {
      //     name: "Project Graph",
      //     extensions: ["json"],
      //   },
      // ],
    });

    if (!path) {
      return;
    }

    console.log("onNewFile", path);
    // D:\Desktop\插件测试\XXX
    await createFolder(path);
    const createFolderResult = await exists(path);
    if (!createFolderResult) {
      Dialog.show({
        title: "创建文件夹失败",
        content: "创建文件夹时失败：(" + path + ")",
        type: "error",
      });
      return;
    }
    // 文件夹创建成功
    // 开始创建文件
    // 获取文件名
    const fileName = PathString.getFileNameFromPath(path);
    const filePath = `${path}${PathString.getSep()}${fileName}.json`;
    // 创建文件
    try {
      StageManager.destroy();
      setFile(filePath);
      Camera.reset();
    } catch {
      Dialog.show({
        title: "创建文件失败",
        content: "创建文件时失败：(" + filePath + ")",
        type: "error",
      });
    }
  };

  const onOpen = async () => {
    if (!StageSaveManager.isSaved()) {
      if (StageManager.isEmpty()) {
        //空项目不需要保存
        StageManager.destroy();
        openFileByDialogWindow();
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
                openFileByDialogWindow();
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
                onSave().then(openFileByDialogWindow);
              },
            },
            { text: "我再想想" },
          ],
        });
      }
    } else {
      // 直接打开文件
      openFileByDialogWindow();
    }
  };

  const openFileByDialogWindow = async () => {
    const path = isWeb
      ? "file.json"
      : await openFileDialog({
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
      Dialog.show({
        title: "请选择一个JSON文件",
        type: "error",
      });
      return;
    }
    try {
      await RecentFileManager.openFileByPath(path); // 已经包含历史记录重置功能
      // 更改file
      setFile(path);
    } catch (e) {
      Dialog.show({
        title: "请选择正确的JSON文件",
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
    } catch {
      await Dialog.show({
        title: "保存失败",
        content: "保存失败，请重试",
      });
    }
  };

  const onSaveNew = async () => {
    const path = isWeb
      ? "file.json"
      : await saveFileDialog({
          title: "另存为",
          defaultPath: "新文件.json", // 提供一个默认的文件名
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

    const data = StageDumper.dump(); // 获取当前节点和边的数据
    try {
      await StageSaveManager.saveHandle(path, data);
      setFile(path);
    } catch {
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

  const onExportPng = () => {
    setExportPNGPanelOpen(true);
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
    // info页面关闭
    if (document.getElementsByClassName("lucide" + "-info").length === 0) {
      getCurrentWindow().close();
    }
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
        {!isWeb && (
          <>
            <Col icon={<FileClock />} id="app-menu-recent-file-btn" onClick={() => setRecentFilePanelOpen(true)}>
              {t("file.items.recent")}
            </Col>
            <Col icon={<Save />} onClick={onSave}>
              {t("file.items.save")}
            </Col>
          </>
        )}
        {!isWeb && (
          <Col icon={<FilePlus2 />} onClick={onNewFile}>
            {t("file.items.newFile")}
          </Col>
        )}
        <Col icon={<ScrollText />} onClick={onNewDraft}>
          {t("file.items.new")}
        </Col>
        <Col icon={<FileInput />} onClick={onOpen}>
          {t("file.items.open")}
        </Col>
        <Col icon={<FileDown />} onClick={onSaveNew}>
          {t("file.items.saveAs")}
        </Col>

        {!isWeb && (
          <Col icon={<Database />} onClick={onBackup}>
            {t("file.items.backup")}
          </Col>
        )}
      </Row>
      {!isWeb && (
        <Row icon={<Folder />} title={t("location.title")}>
          <Col
            icon={<FolderCog />}
            onClick={async () => {
              const path = (await dataDir()) + PathString.getSep() + "liren.project-graph";
              openFilePath(path);
            }}
          >
            {t("location.items.openDataFolder")}
          </Col>
          <Col
            icon={<FolderOpen />}
            onClick={() => {
              const folderPath = PathString.dirPath(file);
              openFilePath(folderPath);
            }}
          >
            {t("location.items.openProjectFolder")}
          </Col>
        </Row>
      )}
      <Row icon={<File />} title={t("export.title")}>
        <Col icon={<FileCode />} onClick={() => Popup.show(<ExportSvgPanel />, false)}>
          {t("export.items.exportAsSvg")}
        </Col>
        <Col icon={<ImageIcon />} onClick={onExportPng} className="opacity-20 hover:opacity-100">
          PNG
        </Col>
        <Col icon={<FileType />} onClick={onSaveMarkdownNew}>
          {t("export.items.exportAsMarkdownBySelected")}
        </Col>
        <Col icon={<FileCode />} onClick={onExportTreeText}>
          {t("export.items.exportAsPlainText")}
        </Col>
      </Row>
      <Row icon={<View />} title={t("view.title")}>
        <Col icon={<Group />} onClick={() => Camera.reset()}>
          {t("view.items.resetByAll")}
        </Col>
        <Col icon={<SquareDashedMousePointer />} onClick={() => Camera.resetBySelected()}>
          {t("view.items.resetBySelect")}
        </Col>
        <Col icon={<Scaling />} onClick={() => Camera.resetScale()}>
          {t("view.items.resetScale")}
        </Col>
      </Row>
      <Row icon={<Axe />} title={"操作"}>
        <Col
          icon={<RefreshCcwDot />}
          onClick={() => {
            StageManager.refreshAllStageObjects();
          }}
        >
          刷新全部实体
        </Col>
        <Col
          icon={<Undo />}
          onClick={() => {
            StageHistoryManager.undo();
          }}
        >
          撤销
        </Col>
        <Col
          icon={<Search />}
          onClick={() => {
            Popup.show(<SearchingNodePanel />, false);
          }}
        >
          查找
        </Col>
        <Col
          icon={<Radar />}
          onClick={async () => {
            Panel.show(
              {
                title: `${Stage.path.isDraft() ? "草稿内容复杂度" : PathString.absolute2file(file) + " 内容复杂度"}`,
                widthRate: 1,
              },
              <>
                <pre className="text-xs">{ComplexityResultPanel(ComplexityDetector.detectorCurrentStage())}</pre>
              </>,
            );
          }}
        >
          内容复杂度检测
        </Col>
      </Row>
      <Row icon={<MoreHorizontal />} title={t("more.title")}>
        {/* id存在的原因：使得快捷键能够查询到，并打开设置界面 */}
        <Col icon={<SettingsIcon />} id={"app-menu-settings-btn"} onClick={() => navigate("/settings/visual")}>
          {t("more.items.settings")}
        </Col>
        <Col
          icon={<PersonStanding />}
          onClick={() => {
            if (StageManager.isEmpty()) {
              HelpService.loadHelp();
            } else {
              Dialog.show({
                title: "帮助内容会覆盖当前舞台",
                type: "warning",
                content: "加载帮助内容会在您的当前舞台上贴入很多内容，建议清空舞台或新建草稿后再加载帮助。",
                buttons: [
                  {
                    text: "加载",
                    onClick: () => {
                      HelpService.loadHelp();
                    },
                  },
                  { text: "我先切换一下草稿" },
                ],
              });
            }
          }}
        >
          新手引导
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

        <Col
          icon={<Rabbit />}
          className="opacity-20 hover:opacity-50"
          onClick={() => {
            navigate("/secret");
          }}
        >
          秘籍键
        </Col>
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
          <Col
            icon={isClassroomMode ? <MonitorX /> : <Monitor />}
            onClick={async () => {
              if (!isClassroomMode) {
                Dialog.show({
                  title: "恢复方法",
                  content: "左上角菜单按钮仅仅是透明了，并没有消失",
                });
              }
              // setIsClassroomMode(!isClassroomMode);
              Settings.set("isClassroomMode", !(await Settings.get("isClassroomMode")));
            }}
          >
            {isClassroomMode ? "退出专注" : "专注模式"}
          </Col>
        </Row>
      )}
      {import.meta.env.DEV && (
        <Row icon={<Dock />} title="测试">
          <Col icon={<TestTube2 />} onClick={() => navigate("/test")}>
            测试页面
          </Col>
          <Col icon={<TestTube2 />} onClick={() => navigate("/ui_test")}>
            ui测试页面
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
      <div className="bg-appmenu-category-separator w-0.5"></div>
      {children}
    </div>
  );
}

function Col({
  children,
  icon,
  className = "",
  id, // 移除默认值
  onClick = () => {},
}: React.PropsWithChildren<{ icon: React.ReactNode; onClick?: () => void; className?: string; id?: string }>) {
  return (
    <div
      className={cn(
        className,
        "hover:bg-appmenu-hover-bg hover:outline-appmenu-hover-bg text-appmenu-item-text flex w-max cursor-pointer items-center gap-1 rounded-lg outline-0 outline-white/0 transition-all hover:outline-8 active:scale-90",
      )}
      {...(id && { id })}
      onClick={onClick}
      onMouseDown={() => {
        SoundService.play.mouseClickButton();
      }}
      onMouseEnter={() => {
        SoundService.play.mouseEnterButton();
      }}
    >
      {icon}
      {children}
    </div>
  );
}
