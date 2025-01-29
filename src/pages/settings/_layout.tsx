import { Bot, Brain, Command, Eye, Info, Keyboard, Plug, Settings, Sparkles, Speaker, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";
import Github from "../../assets/github.svg?react";

export default function SettingsLayout() {
  const { t } = useTranslation("settings");

  return (
    <div className="fixed top-24 right-20 bottom-20 left-20">
      <h1 className="flex items-center gap-2 text-3xl font-bold">
        <Settings className="h-8 w-8" />
        {t("title")}
      </h1>
      <div className="mt-4 flex h-full gap-8">
        <div className="*:page:bg-white/10 flex flex-col gap-2 *:flex *:cursor-pointer *:items-center *:gap-2 *:rounded-full *:px-3 *:py-2 *:transition *:hover:bg-neutral-800 *:active:scale-90">
          <NavLink to="/settings/about">
            <Info />
            {t("tabs.about")}
          </NavLink>
          <NavLink to="/settings/visual">
            <Eye />
            {t("tabs.visual")}
          </NavLink>
          <NavLink to="/settings/performance">
            <Zap />
            {t("tabs.performance")}
          </NavLink>
          <NavLink to="/settings/effects">
            <Sparkles />
            {t("tabs.effects")}
          </NavLink>
          <NavLink to="/settings/automation">
            <Bot />
            {t("tabs.automation")}
          </NavLink>
          <NavLink to="/settings/control">
            <Keyboard />
            {t("tabs.control")}
          </NavLink>
          <NavLink to="/settings/keybinds">
            <Command />
            {t("tabs.keybinds")}
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
        <div className="mx-auto w-[1024px] overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
