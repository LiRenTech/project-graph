import { loadAllServices } from "@/core/loadAllServices";
import { Project } from "@/core/Project";
import { Telemetry } from "@/core/service/Telemetry";
import { projectsAtom, store } from "@/state";
import { URI } from "vscode-uri";
import { open } from "@tauri-apps/plugin-dialog";

export default function Welcome() {
  // 目前这两个函数是从GlobalMenu.tsx中复制过来的
  // 代码重复了，可能要优化一下

  // 创建新工程
  const onNewProject = async () => {
    const project = Project.newDraft();
    loadAllServices(project);
    await project.init();
    store.set(projectsAtom, [...store.get(projectsAtom), project]);
  };

  const onOpenFile = async () => {
    const path = await open({
      directory: false,
      multiple: false,
      filters: [{ name: "工程文件", extensions: ["prg"] }],
    });
    if (!path) return;
    const project = new Project(URI.file(path));
    const t = performance.now();
    loadAllServices(project);
    const loadServiceTime = performance.now() - t;
    await project.init();
    const readFileTime = performance.now() - t;
    store.set(projectsAtom, [...store.get(projectsAtom), project]);
    Telemetry.event("打开文件", {
      loadServiceTime,
      readFileTime,
    });
  };

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-green-900 via-blue-900 to-stone-900">
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 text-center">
        {/* 主标题 */}
        <h1 className="text-7xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Welcome Project Graph 2.0
        </h1>

        {/* 副标题 */}
        <p className="max-w-2xl text-xl text-gray-300">
          Start your visual journey with Project Graph
          <br />
          Create, connect and explore knowledge in a whole new way
        </p>

        {/* 操作按钮组 */}
        <div className="mt-8 flex space-x-6">
          <button
            className="cursor-pointer rounded-lg bg-white/10 px-6 py-3 text-white backdrop-blur-sm transition hover:bg-white/20"
            onClick={onNewProject}
          >
            New Project
          </button>
          <button
            className="cursor-pointer rounded-lg border border-white/20 px-6 py-3 text-white transition hover:bg-white/10"
            onClick={onOpenFile}
          >
            Open File
          </button>
        </div>

        {/* 版本信息 */}
        <p className="absolute bottom-8 text-sm text-gray-400">Version 2 · Built with Tauri & React</p>
      </div>
    </div>
  );
}
