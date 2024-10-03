import { NavLink, Outlet } from "react-router-dom";

export default function SettingsLayout() {
  return (
    <div className="fixed bottom-20 left-20 right-20 top-24">
      <h1 className="text-3xl font-bold">设置</h1>
      <div className="mt-4 flex h-full gap-8">
        <div className="flex flex-col gap-2 *:cursor-pointer *:rounded-full *:px-3 *:py-2 *:transition hover:*:bg-neutral-800 active:*:scale-90 page:*:bg-white/10">
          <NavLink to="/settings/about">关于</NavLink>
          <NavLink to="/settings/visual">显示</NavLink>
          <NavLink to="/settings/physics">物理</NavLink>
          <NavLink to="/settings/performance">性能</NavLink>
          <NavLink to="/settings/auto-namer">自动命名</NavLink>
          <NavLink to="/settings/ai">AI</NavLink>
          <NavLink to="/settings/github">Github</NavLink>
        </div>
        <div className="container mx-auto flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
