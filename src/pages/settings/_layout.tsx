import {
  Bot,
  Brain,
  Eye,
  Info,
  Keyboard,
  Plug,
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
        <div className="flex flex-col gap-2 *:flex *:cursor-pointer *:items-center *:gap-2 *:rounded-full *:px-3 *:py-2 *:transition hover:*:bg-neutral-800 active:*:scale-90 page:*:bg-white/10">
          <NavLink to="/settings/about">
            <Info />
            {t("tabs.about")}
          </NavLink>
          <NavLink to="/settings/visual">
            <Eye />
            {t("tabs.visual")}
          </NavLink>
          <NavLink to="/settings/performance">
            <Sparkles />
            {t("tabs.performance")}
          </NavLink>
          <NavLink to="/settings/automation">
            <Bot />
            {t("tabs.automation")}
          </NavLink>
          <NavLink to="/settings/control">
            <Keyboard />
            {t("tabs.control")}
          </NavLink>
          <NavLink to="/settings/ai">
            <Brain />
            {t("tabs.ai")}
          </NavLink>
          <NavLink to="/settings/github">
            <Github />
            {t("tabs.github")}
          </NavLink>
          <NavLink to="/settings/sounds">
            <Speaker />
            {t("tabs.sounds")}
          </NavLink>
          <NavLink to="/settings/plugins">
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
