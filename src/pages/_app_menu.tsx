import {
  open as openFileDialog,
  save as saveFileDialog,
} from "@tauri-apps/plugin-dialog";
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
  PartyPopper,
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
import { useRecoilState } from "recoil";
import { Camera } from "../core/stage/Camera";
import { StageDumper } from "../core/stage/StageDumper";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { fileAtom, isExportTreeTextPanelOpenAtom, isRecentFilePanelOpenAtom } from "../state";
import { cn } from "../utils/cn";
import { useDialog } from "../utils/dialog";
import { isDesktop } from "../utils/platform";
// import { writeTextFile } from "@tauri-apps/plugin-fs";
import { dataDir } from "@tauri-apps/api/path";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTranslation } from "react-i18next";
import { RecentFileManager } from "../core/RecentFileManager";
import { Settings } from "../core/Settings";
import { Stage } from "../core/stage/Stage";
import { StageDumperSvg } from "../core/stage/StageDumperSvg";
import { StageSaveManager } from "../core/stage/StageSaveManager";
import { TextNode } from "../core/stageObject/entity/TextNode";
import { PathString } from "../utils/pathString";

export default function AppMenu({
  className = "",
  open = false,
}: {
  className?: string;
  open: boolean;
}) {
  const navigate = useNavigate();
  const dialog = useDialog();
  const [file, setFile] = useRecoilState(fileAtom);
  const { t } = useTranslation("appMenu");
  const [, setRecentFilePanelOpen] = useRecoilState(isRecentFilePanelOpenAtom);
  const [, setExportTreeTextPanelOpen] = useRecoilState(isExportTreeTextPanelOpenAtom);

  const onNew = () => {
    if (StageSaveManager.isSaved()) {
      StageManager.destroy();
      setFile("Project Graph");
    } else {
      dialog.show({
        title: "未保存",
        content: "是否保存当前文件？",
        buttons: [
          {
            text: "保存",
            onClick: () => {
              onSave();
              onNew();
            },
          },
          { text: "取消" },
        ],
      });
    }
  };

  const onOpen = async () => {
    if (!StageSaveManager.isSaved()) {
      dialog.show({
        title: "未保存",
        content: "是否保存当前文件？",
        buttons: [
          {
            text: "保存",
            onClick: () => {
              onSave();
              onNew();
            },
          },
          { text: "取消" },
        ],
      });
      return;
    }
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
      dialog.show({
        title: "请选择正确的JSON文件",
        content: String(e),
        type: "error",
      });
    }
  };

  const onSave = () => {
    const path_ = file;

    if (path_ === "Project Graph") {
      // 如果文件名为 "Project Graph" 则说明是新建文件。
      // 要走另存为流程
      onSaveNew();
      return;
    }
    const data = StageDumper.dump(); // 获取当前节点和边的数据
    // 2024年10月6日发现保存文件也开始变得没有权限了，可能是tauri-plugin-fs的bug
    // await writeTextFile(path, JSON.stringify(data, null, 2)); // 将数据写入文件
    StageSaveManager.saveHandle(
      path_,
      data,
      () => {},
      (err) => {
        dialog.show({
          title: "保存失败",
          content: String(err),
          type: "error",
        });
      },
    );
  };

  const onSaveNew = async () => {
    const path = await saveFileDialog({
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
    StageSaveManager.saveHandle(
      path,
      data,
      () => {
        setFile(path);
      },
      (err) => {
        dialog.show({
          title: "保存失败",
          content: String(err),
          type: "error",
        });
      },
    );
  };
  const onBackup = async () => {
    if (Stage.Path.isDraft()) {
      const autoBackupDraftPath = await Settings.get("autoBackupDraftPath");
      const backupPath = `${autoBackupDraftPath}${Stage.Path.getSep()}${PathString.getTime()}.json`;
      StageSaveManager.backupHandle(
        backupPath,
        StageDumper.dump(),
        () => {
          dialog.show({
            title: "备份成功",
            content: "已备份在您设置的备份目录下",
            type: "success",
          });
        },
        (err) => {
          dialog.show({
            title: "备份失败",
            content: String(err),
            type: "error",
          });
        },
      );
      return;
    }
    StageSaveManager.backupHandleWithoutCurrentPath(
      StageDumper.dump(),
      () => {
        dialog.show({
          title: "备份成功",
          content: "已备份在项目相同目录下",
          type: "success",
        });
      },
      (err) => {
        dialog.show({
          title: "备份失败",
          content: String(err),
          type: "error",
        });
      },
      true,
    );
  };
  const onSaveSVGNew = async () => {
    const path = await saveFileDialog({
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

    const data = StageDumperSvg.dumpStageToSVGString();
    StageSaveManager.saveSvgHandle(
      path,
      data,
      () => {},
      (err) => {
        dialog.show({
          title: "保存失败",
          content: String(err),
          type: "error",
        });
      },
    );
  };

  const onExportTreeText = async () => {
    const selectedNodes = StageManager.getSelectedEntities().filter(
      (entity) => entity instanceof TextNode,
    );
    if (selectedNodes.length === 0) {
      dialog.show({
        title: "没有选中节点",
        content:
          "请先至少选择一个节点再使用此功能",
        type: "error",
      });
      return;
    }
    setExportTreeTextPanelOpen(true);
  }

  const onSaveMarkdownNew = async () => {
    const selectedNodes = StageManager.getSelectedEntities().filter(
      (entity) => entity instanceof TextNode,
    );
    if (selectedNodes.length === 0) {
      dialog.show({
        title: "没有选中节点",
        content:
          "请先选中一个根节点再使用此功能，并且根节点所形成的结构必须为树状结构",
        type: "error",
      });
      return;
    } else if (selectedNodes.length > 1) {
      dialog.show({
        title: "选中节点数量过多",
        content: "只能选中一个根节点，并且根节点所形成的结构必须为树状结构",
        type: "error",
      });
      return;
    }
    if (!StageManager.isTree(selectedNodes[0])) {
      dialog.show({
        title: "结构错误",
        content: "根节点所形成的结构必须为树状结构",
        type: "error",
      });
      return;
    }

    const path = await saveFileDialog({
      title: "另存为",
      defaultPath: "新文件.md", // 提供一个默认的文件名
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
    StageSaveManager.saveMarkdownHandle(
      path,
      selectedNodes[0],
      () => {},
      (err) => {
        dialog.show({
          title: "保存失败",
          content: String(err),
          type: "error",
        });
      },
    );
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
        onNew();
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
        "!pointer-events-none flex origin-top-left scale-0 flex-col gap-4 rounded-md border border-neutral-700 bg-neutral-800 p-3 opacity-0",
        {
          "!pointer-events-auto scale-100 opacity-100": open,
        },
        className,
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Row icon={<File />} title={t("file.title")}>
        <Col icon={<FilePlus />} onClick={onNew}>
          {t("file.items.new")}
        </Col>
        <Col icon={<FileText />} onClick={onOpen}>
          {t("file.items.open")}
        </Col>
        <Col icon={<FileText />} onClick={() => setRecentFilePanelOpen(true)}>
          {t("file.items.recent")}
        </Col>
        <Col icon={<Save />} onClick={onSave}>
          {t("file.items.save")}
        </Col>
        <Col icon={<Save />} onClick={onSaveNew}>
          {t("file.items.saveAs")}
        </Col>

        <Col icon={<Database />} onClick={onBackup}>
          {t("file.items.backup")}
        </Col>
      </Row>
      <Row icon={<Folder />} title={t("location.title")}>
        <Col
          icon={<FolderCog />}
          onClick={async () => {
            dialog.show({
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
            dialog.show({
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
      <Row icon={<File />} title={t("export.title")}>
        <Col icon={<FileCode />} onClick={onSaveSVGNew}>
          {t("export.items.exportAsSVGByAll")}
        </Col>
        <Col icon={<FileType />} onClick={onSaveMarkdownNew}>
          {t("export.items.exportAsMarkdownBySelected")}
        </Col>
        <Col icon={<FileCode />} onClick={onExportTreeText}>
          导出纯文本
        </Col>
      </Row>
      <Row icon={<View />} title={t("view.title")}>
        <Col icon={<SquareDashedKanbanIcon />} onClick={() => Camera.reset()}>
          {t("view.items.resetByAll")}
        </Col>
        <Col
          icon={<SquareDashedMousePointer />}
          onClick={() => Camera.resetBySelected()}
        >
          {t("view.items.resetBySelect")}
        </Col>
        <Col icon={<Scaling />} onClick={() => Camera.resetScale()}>
          {t("view.items.resetScale")}
        </Col>
      </Row>
      <Row icon={<MoreHorizontal />} title={t("more.title")}>
        <Col
          icon={<SettingsIcon />}
          onClick={() => navigate("/settings/visual")}
        >
          {t("more.items.settings")}
        </Col>
        <Col icon={<Info />} onClick={() => navigate("/settings/about")}>
          {t("more.items.about")}
        </Col>

        <Col
          icon={<PartyPopper />}
          onClick={() => {
            navigate("/welcome");
          }}
        >
          {t("more.items.welcome")}
        </Col>
      </Row>
      <Row icon={<AppWindow />} title={t("window.title")}>
        {import.meta.env.DEV && (
          <Col icon={<RefreshCcw />} onClick={() => window.location.reload()}>
            重载
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
      <Row icon={<Dock />} title="测试">
        <Col icon={<TestTube2 />} onClick={() => navigate("/test")}>
          测试页面
        </Col>
        <Col
          icon={<TestTube2 />}
          onClick={() =>
            dialog.show({
              title: "舞台序列化",
              type: "info",
              code: JSON.stringify(StageDumper.dump(), null, 2),
            })
          }
        >
          查看json
        </Col>
        <Col icon={<TestTube2 />} onClick={() => {}}>
          控制台输出
        </Col>
      </Row>
    </div>
  );
}

function Row({
  children,
  title,
  icon,
}: React.PropsWithChildren<{ title: string; icon: React.ReactNode }>) {
  return (
    <div className="flex gap-2">
      <span className="flex gap-1 text-neutral-400">
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
      className="flex w-max cursor-pointer items-center gap-1 hover:opacity-80 active:scale-90"
      onClick={onClick}
    >
      {icon}
      {children}
    </div>
  );
}
