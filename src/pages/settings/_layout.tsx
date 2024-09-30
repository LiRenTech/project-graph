import { NavLink, Outlet } from "react-router-dom";

export default function SettingsLayout() {
  return (
    <div className="fixed bottom-20 left-20 right-20 top-24">
      <h1 className="text-3xl font-bold">设置</h1>
      <div className="mt-4 flex h-full gap-8">
        <div className="page:*:bg-white/20 flex flex-col gap-2 *:rounded-full *:px-3 *:py-2 *:transition">
          <NavLink to="/settings/about">关于</NavLink>
          <NavLink to="/settings/visual">显示</NavLink>
          <NavLink to="/settings/physics">物理</NavLink>
          <NavLink to="/settings/performance">性能</NavLink>
          <NavLink to="/settings/auto-namer">自动命名</NavLink>
          <NavLink to="/settings/ai">AI</NavLink>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
