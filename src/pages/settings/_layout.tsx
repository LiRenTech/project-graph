import {
  Bot,
  Eye,
  Info,
  Keyboard,
  Plug,
  Server,
  Sparkles,
  Speaker,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";
import Github from "../../assets/github.svg?react";

export default function SettingsLayout() {
  const { t } = useTranslation("settings");

  return (
    <div className="fixed bottom-20 left-20 right-20 top-24">
      <h1 className="text-3xl font-bold">设置</h1>
      <div className="mt-4 flex h-full gap-8">
        <div className="flex flex-col gap-2 *:cursor-pointer *:rounded-full *:px-3 *:py-2 *:transition hover:*:bg-neutral-800 active:*:scale-90 page:*:bg-white/10">
          <NavLink to="/settings/about" className="flex items-center gap-2">
            <Info />
            {t("tabs.about")}
          </NavLink>
          <NavLink to="/settings/visual" className="flex items-center gap-2">
            <Eye />
            {t("tabs.visual")}
          </NavLink>
          <NavLink
            to="/settings/performance"
            className="flex items-center gap-2"
          >
            <Sparkles />
            {t("tabs.performance")}
          </NavLink>
          <NavLink
            to="/settings/automation"
            className="flex items-center gap-2"
          >
            <Bot />
            {t("tabs.automation")}
          </NavLink>
          <NavLink to="/settings/control" className="flex items-center gap-2">
            <Keyboard />
            {t("tabs.control")}
          </NavLink>
          <NavLink to="/settings/ai" className="flex items-center gap-2">
            <Server />
            {t("tabs.ai")}
          </NavLink>
          <NavLink to="/settings/github" className="flex items-center gap-2">
            <Github />
            {t("tabs.github")}
          </NavLink>
          <NavLink to="/settings/sounds" className="flex items-center gap-2">
            <Speaker />
            {t("tabs.sounds")}
          </NavLink>
          <NavLink to="/settings/plugins" className="flex items-center gap-2">
            <Plug />
            {t("tabs.plugins")}
          </NavLink>
        </div>
        <div className="container mx-auto flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
