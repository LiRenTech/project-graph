import { appCacheDir, dataDir } from "@tauri-apps/api/path";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open as openFileDialog, save as saveFileDialog } from "@tauri-apps/plugin-dialog";
import { open as openFilePath } from "@tauri-apps/plugin-shell";
import { useAtom } from "jotai";
import {
  AppWindow,
  Axe,
  Database,
  Dock,
  File,
  FileClock,
  FileCode,
  FileDown,
  FileInput,
  FilePlus2,
  FileType,
  Folder,
  FolderClock,
  FolderCog,
  FolderOpen,
  Folders,
  Fullscreen,
  Group,
  Image as ImageIcon,
  Info,
  Keyboard,
  Locate,
  Monitor,
  MonitorX,
  MoreHorizontal,
  PersonStanding,
  Rabbit,
  Radar,
  Radiation,
  Redo,
  // PartyPopper,
  RefreshCcw,
  RefreshCcwDot,
  Save,
  Scaling,
  ScrollText,
  Settings as SettingsIcon,
  SquareDashedMousePointer,
  TestTube2,
  Undo,
  View,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dialog } from "../../components/dialog";
import { Panel } from "../../components/panel";
import { Popup } from "../../components/popup";
import { Rectangle } from "../../core/dataStruct/shape/Rectangle";
import { Vector } from "../../core/dataStruct/Vector";
import { Controller } from "../../core/service/controlService/controller/Controller";
import { FileLoader } from "../../core/service/dataFileService/fileLoader";
import { RecentFileManager } from "../../core/service/dataFileService/RecentFileManager";
import { StageSaveManager } from "../../core/service/dataFileService/StageSaveManager";
import { GenerateFromFolderEngine } from "../../core/service/dataGenerateService/generateFromFolderEngine/GenerateFromFolderEngine";
import { ComplexityDetector } from "../../core/service/dataManageService/ComplexityDetector";
import { CopyEngine } from "../../core/service/dataManageService/copyEngine/copyEngine";
import { SoundService } from "../../core/service/feedbackService/SoundService";
import { HelpService } from "../../core/service/helpService/helpService";
import { Settings } from "../../core/service/Settings";
import { SubWindow } from "../../core/service/SubWindow";
import { Camera } from "../../core/stage/Camera";
import { Stage } from "../../core/stage/Stage";
import { StageDumper } from "../../core/stage/StageDumper";
import { GraphMethods } from "../../core/stage/stageManager/basicMethods/GraphMethods";
import { StageHistoryManager } from "../../core/stage/stageManager/StageHistoryManager";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { TextNode } from "../../core/stage/stageObject/entity/TextNode";
import {
  fileAtom,
  isClassroomModeAtom,
  isExportPNGPanelOpenAtom,
  isExportTreeTextPanelOpenAtom,
  store,
} from "../../state";
import { cn } from "../../utils/cn";
import { createFolder, exists } from "../../utils/fs";
import { PathString } from "../../utils/pathString";
import { isDesktop, isWeb } from "../../utils/platform";
import ComplexityResultPanel from "../_fixed_panel/_complexity_result_panel";
import ExportSvgPanel from "../_popup_panel/_export_svg_panel";
import RecentFilesWindow from "./RecentFilesWindow";
import SettingsWindow from "./SettingsWindow";

export default function AppMenuWindow() {
  const navigate = useNavigate();
  const [file, setFile] = useAtom(fileAtom);
  const [isClassroomMode] = useAtom(isClassroomModeAtom);
  const { t } = useTranslation("appMenu");
  const [, setExportTreeTextPanelOpen] = useAtom(isExportTreeTextPanelOpenAtom);
  const [, setExportPNGPanelOpen] = useAtom(isExportPNGPanelOpenAtom);

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
    setTimeout(() => {
      if (document.getElementsByClassName("lucide" + "-info").length === 0) {
        // getCurrentWindow().close();
      }
    }, 5000);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-3" onPointerDown={(e) => e.stopPropagation()}>
      <Row icon={<File />} title={t("file.title")}>
        {!isWeb && (
          <>
            <Col icon={<FileClock />} onClick={RecentFilesWindow.open}>
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
        <Col icon={<FileInput />} onClick={onOpen} details="选择一个曾经保存的json文件并打开。">
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
            details={t("location.items.openDataFolder.description")}
          >
            {t("location.items.openDataFolder.title")}
          </Col>
          <Col
            icon={<FolderClock />}
            onClick={async () => {
              const path = await appCacheDir();
              openFilePath(path);
            }}
            details={t("location.items.openCacheFolder.description")}
          >
            {t("location.items.openCacheFolder.title")}
          </Col>
          <Col
            icon={<FolderOpen />}
            onClick={() => {
              const folderPath = PathString.dirPath(file);
              openFilePath(folderPath);
            }}
            details={t("location.items.openProjectFolder.description")}
          >
            {t("location.items.openProjectFolder.title")}
          </Col>
        </Row>
      )}
      <Row icon={<File />} title={t("import.title")}>
        <Col
          icon={<Folders />}
          onClick={() => {
            openFolderByDialogWindow();
          }}
          details={t("import.items.generateSectionByFolder.description")}
        >
          {t("import.items.generateSectionByFolder.title")}
        </Col>
      </Row>

      {/* 导出 */}
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

      {/* 视野相关操作 */}
      <Row icon={<View />} title={t("view.title")}>
        <Col icon={<Group />} onClick={() => Camera.reset()} details={t("view.items.resetByAll.description")}>
          {t("view.items.resetByAll.title")}
        </Col>
        <Col
          icon={<SquareDashedMousePointer />}
          onClick={() => Camera.resetBySelected()}
          details={t("view.items.resetBySelect.description")}
        >
          {t("view.items.resetBySelect.title")}
        </Col>
        <Col icon={<Scaling />} onClick={() => Camera.resetScale()} details={t("view.items.resetScale.description")}>
          {t("view.items.resetScale.title")}
        </Col>
        <Col
          icon={<Locate />}
          onClick={() => (Camera.location = new Vector(0, 0))}
          details={t("view.items.resetLocation.description")}
        >
          {t("view.items.resetLocation.title")}
        </Col>
      </Row>
      <Row icon={<Axe />} title={"操作"}>
        <Col
          icon={<RefreshCcwDot />}
          onClick={() => {
            StageManager.refreshAllStageObjects();
          }}
          details="刷新当前舞台所有实体，例如图片重新加载，实体大小重新计算等"
        >
          刷新
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
          icon={<Redo />}
          onClick={() => {
            StageHistoryManager.redo();
          }}
          details="反撤销：用于撤销撤过头了，恢复一次撤销"
        >
          重做
        </Col>
        <Col
          icon={<Keyboard />}
          onClick={() => {
            Controller.pressingKeySet.clear();
          }}
          details="松开全部按键，仅用于观察到左下角有异常按键时使用"
        >
          松开按键
        </Col>
        {/* <Col
          icon={<Search />}
          onClick={() => {
            Popup.show(<SearchingNodePanel />, false);
          }}
          details="根据文字，搜索节点/实体详细信息，等含有文字的内容，建议将鼠标移动到窗口边缘后按ctrl+f"
        >
          查找
        </Col> */}
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
          details="统计当前舞台上的实体信息、计算复杂度、检测异常"
        >
          统计
        </Col>
        <Col
          icon={<Radiation />}
          onClick={() => {
            Dialog.show({
              title: "危险操作！确认清空？",
              content: "确认清空当前舞台全部内容？",
              type: "warning",
              buttons: [
                {
                  text: "清空",
                  color: "red",
                  onClick: () => {
                    StageManager.destroy();
                    Camera.reset();
                  },
                },
                { text: "我再想想！>.<" },
              ],
            });
          }}
          details="清空当前舞台全部内容，用于当前舞台内容不重要，出现无法手动删除的故障内容时，一键清理草稿"
        >
          清空
        </Col>
      </Row>
      <Row icon={<MoreHorizontal />} title={t("more.title")}>
        {/* id存在的原因：使得快捷键能够查询到，并打开设置界面 */}
        <Col icon={<SettingsIcon />} onClick={() => SettingsWindow.open()}>
          {t("more.items.settings")}
        </Col>
        <Col
          icon={<PersonStanding />}
          onClick={() => {
            HelpService.loadHelp();
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
          <Col icon={<TestTube2 />} onClick={() => navigate("/ui_test")}>
            ui测试页面
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
              navigate("/user/login");
            }}
          >
            user
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
  details = "",
  id, // 移除默认值
  onClick = () => {},
}: React.PropsWithChildren<{
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  details?: string;
  id?: string;
}>) {
  const [showDetails, setShowDetails] = useState(false);

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
        setShowDetails(true);
        SoundService.play.mouseEnterButton();
      }}
      onMouseLeave={() => {
        setShowDetails(false);
      }}
    >
      {icon}
      {children}

      {showDetails && details && (
        <div
          className="bg-appmenu-hover-bg text-appmenu-item-text fixed -bottom-12 left-0 right-0 flex h-12 w-full items-center justify-center rounded-md bg-opacity-70 p-2 text-sm"
          style={{ zIndex: 1000 }}
        >
          {details}
        </div>
      )}
    </div>
  );
}

AppMenuWindow.open = () => {
  SubWindow.create({
    children: <AppMenuWindow />,
    rect: new Rectangle(new Vector(16, 64), Vector.same(-1)),
    titleBarOverlay: true,
    closeWhenClickInside: true,
    closeWhenClickOutside: true,
  });
};

/**
 * 新建草稿
 */
export const onNewDraft = () => {
  if (StageSaveManager.isSaved() || StageManager.isEmpty()) {
    StageManager.destroy();
    store.set(fileAtom, "Project Graph");
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
            store.set(fileAtom, "Project Graph");
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
export const onNewFile = async () => {
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
  const newFolderCreated = await createFolder(path);
  if (!newFolderCreated) {
    Dialog.show({
      title: "创建文件夹失败",
      content: "创建文件夹时失败：(" + path + ")" + "请换一个文件夹名称",
      type: "error",
    });
    return;
  }
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
  // 更新历史
  RecentFileManager.addRecentFileByPath(filePath);
  // 创建文件
  try {
    StageManager.destroy();
    store.set(fileAtom, filePath);
    Camera.reset();
  } catch {
    Dialog.show({
      title: "创建文件失败",
      content: "创建文件时失败：(" + filePath + ")",
      type: "error",
    });
  }
};

export const onOpen = async () => {
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
                name: "JSON 格式，兼容旧版本",
                extensions: ["json"],
              },
              {
                name: "新版 PRG 格式，文件更小",
                extensions: ["prg"],
              },
            ]
          : [],
      });
  if (!path) {
    return;
  }
  try {
    await FileLoader.openFileByPath(path); // 已经包含历史记录重置功能
    // 更改file
    store.set(fileAtom, path);
  } catch (e) {
    Dialog.show({
      title: "请选择正确的JSON文件",
      content: String(e),
      type: "error",
    });
  }
};

const openFolderByDialogWindow = async () => {
  const path = await openFileDialog({
    title: "打开文件夹",
    directory: true,
    multiple: false,
    filters: [],
  });
  if (!path) {
    return;
  }
  // console.log(path);
  GenerateFromFolderEngine.generateFromFolder(path);
};

export const onSave = async () => {
  const path_ = store.get(fileAtom);

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
  } catch (error) {
    await Dialog.show({
      title: "保存失败",
      code: `${error}`,
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
            name: "JSON 格式，兼容旧版本",
            extensions: ["json"],
          },
          {
            name: "新版 PRG 格式，文件更小",
            extensions: ["prg"],
          },
        ],
      });

  if (!path) {
    return;
  }

  const data = StageDumper.dump(); // 获取当前节点和边的数据
  try {
    await StageSaveManager.saveHandle(path, data);
    store.set(fileAtom, path);
    RecentFileManager.addRecentFileByPath(path);
  } catch {
    await Dialog.show({
      title: "保存失败",
      content: "保存失败，请重试",
    });
  }
};
export const onBackup = async () => {
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
