import React, { useEffect } from "react";
import { cn } from "../utils/cn";
import {
  AppWindow,
  Cuboid,
  File,
  FilePlus,
  FileText,
  Image,
  Info,
  MoreHorizontal,
  PartyPopper,
  Plus,
  RefreshCcw,
  Save,
  Settings as SettingsIcon,
  TestTube2,
  View,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  open as openFileDialog,
  save as saveFileDialog,
} from "@tauri-apps/plugin-dialog";
import { useDialog } from "../utils/dialog";
import { isDesktop } from "../utils/platform";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { useRecoilState } from "recoil";
import { fileAtom, isRecentFilePanelOpenAtom } from "../state";
import { Camera } from "../core/stage/Camera";
import { StageDumper } from "../core/stage/StageDumper";
// import { writeTextFile } from "@tauri-apps/plugin-fs";
import { Stage } from "../core/stage/Stage";
import { ViewFlashEffect } from "../core/effect/concrete/ViewFlashEffect";
import { Color } from "../core/dataStruct/Color";
import { RecentFileManager } from "../core/RecentFileManager";
import { invoke } from "@tauri-apps/api/core";
import { Settings } from "../core/Settings";

export default function AppMenu({
  className = "",
  open = false,
}: {
  className?: string;
  open: boolean;
}) {
  const navigate = useNavigate();
  const dialog = useDialog();
  let [file, setFile] = useRecoilState(fileAtom);

  const [_, setRecentFilePanelOpen] = useRecoilState(isRecentFilePanelOpenAtom);

  const onNew = () => {
    StageManager.destroy();
    setFile("Project Graph");
  };

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
        title: "请选择一个JSON文件",
        type: "error",
      });
      return;
    }
    try {
      console.log("正在打开文件", `<${path}>`, typeof path);
      await RecentFileManager.openFileByPath(path);
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
    console.log("准备保存，当前路径是", path_);

    if (path_ === "Project Graph") {
      // 如果文件名为 "Project Graph" 则说明是新建文件。
      // 要走另存为流程
      console.log("要走另存为流程");
      onSaveNew();
      return;
    }

    try {
      const data = StageDumper.dump(); // 获取当前节点和边的数据
      // 2024年10月6日发现保存文件也开始变得没有权限了，可能是tauri-plugin-fs的bug
      // await writeTextFile(path, JSON.stringify(data, null, 2)); // 将数据写入文件

      invoke<string>("save_json_by_path", {
        path: path_,
        content: JSON.stringify(data, null, 2),
      })
        .then((res) => {
          console.log("保存成功", res);
          Stage.effects.push(new ViewFlashEffect(Color.Black));
        })
        .catch((err) => {
          dialog.show({
            title: "保存失败",
            content: String(err),
            type: "error",
          });
        });
    } catch (e) {
      dialog.show({
        title: "保存失败",
        content: String(e),
        type: "error",
      });
    }
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

    try {
      const data = StageDumper.dump(); // 获取当前节点和边的数据
      invoke<string>("save_json_by_path", {
        path,
        content: JSON.stringify(data, null, 2),
      })
        .then((res) => {
          console.log("保存成功", res);
          Stage.effects.push(new ViewFlashEffect(Color.Black));
        })
        .catch((err) => {
          dialog.show({
            title: "保存失败",
            content: String(err),
            type: "error",
          });
        });
    } catch (e) {
      dialog.show({
        title: "保存失败",
        content: String(e),
        type: "error",
      });
    }
  };
  const onSaveSelectedNew = async () => {
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

    try {
      const selectedNodes = [];
      for (const node of StageManager.getEntities()) {
        if (node.isSelected) {
          selectedNodes.push(node);
        }
      }
      const data = StageDumper.dumpSelected(selectedNodes);
      invoke<string>("save_json_by_path", {
        path,
        content: JSON.stringify(data, null, 2),
      })
        .then((res) => {
          console.log("保存成功", res);
          Stage.effects.push(new ViewFlashEffect(Color.Black));
        })
        .catch((err) => {
          dialog.show({
            title: "保存失败",
            content: String(err),
            type: "error",
          });
        });
    } catch (e) {
      dialog.show({
        title: "保存失败",
        content: String(e),
        type: "error",
      });
    }
  };

  useEffect(() => {
    RecentFileManager.startHookFunction = () => {
      if (RecentFileManager.isOpenByPathWhenAppStart()) {
        Settings.get("autoOpenPath").then((autoOpenPath) => {
          setFile(autoOpenPath);
        });
      } else {
        console.log("没有打开过文件");
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
        "!pointer-events-none flex origin-top-left scale-75 flex-col gap-4 rounded-md border border-neutral-700 bg-neutral-800 p-3 opacity-0 transition",
        {
          "!pointer-events-auto scale-100 opacity-100": open,
        },
        className,
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Row icon={<File />} title="文件">
        <Col icon={<FilePlus />} onClick={onNew}>
          新建
        </Col>
        <Col icon={<FileText />} onClick={onOpen}>
          打开
        </Col>
        <Col icon={<FileText />} onClick={() => setRecentFilePanelOpen(true)}>
          最近
        </Col>
        <Col icon={<Save />} onClick={onSave}>
          保存
        </Col>
        <Col icon={<Save />} onClick={onSaveNew}>
          另存为
        </Col>
        <Col icon={<Save />} onClick={onSaveSelectedNew}>
          将选中部分另存为
        </Col>
      </Row>
      <Row icon={<Plus />} title="创建">
        <Col icon={<Cuboid />}>节点</Col>
        <Col icon={<Image />}>图片</Col>
      </Row>
      <Row icon={<View />} title="视图">
        <Col icon={<RefreshCcw />} onClick={() => Camera.reset()}>
          重置
        </Col>
      </Row>
      <Row icon={<MoreHorizontal />} title="更多">
        <Col
          icon={<SettingsIcon />}
          onClick={() => navigate("/settings/visual")}
        >
          设置
        </Col>
        <Col icon={<Info />} onClick={() => navigate("/settings/about")}>
          关于
        </Col>
        <Col icon={<TestTube2 />} onClick={() => navigate("/test")}>
          测试
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
          json
        </Col>
        <Col
          icon={<TestTube2 />}
          onClick={() => {
            console.log(StageManager.getTextNodes());
            console.log(StageManager.getEdges());
            console.log(file);
            // localStorage测试
            // 尽量不要用这个，端口号一变就没了
            localStorage.setItem("_test", "123");
          }}
        >
          print
        </Col>
        <Col
          icon={<PartyPopper />}
          onClick={() => {
            navigate("/welcome");
          }}
        >
          welcome
        </Col>
      </Row>
      <Row icon={<AppWindow />} title="窗口">
        <Col icon={<RefreshCcw />} onClick={() => window.location.reload()}>
          刷新
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
      className="flex w-max items-center gap-1 transition hover:opacity-80 active:scale-90"
      onClick={onClick}
    >
      {icon}
      {children}
    </div>
  );
}
