import { Bot, Brain, Command, Eye, Info, Keyboard, Plug, Settings, Sparkles, Speaker, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import Github from "../../assets/github.svg?react";
import NavLinkButton from "../../components/NavLinkButton";

export default function SettingsLayout() {
  const { t } = useTranslation("settings");

  return (
    <div className="fixed bottom-20 left-20 right-20 top-24">
      <h1 className="text-appmenu-item-text flex items-center gap-2 text-3xl font-bold">
        <Settings className="h-8 w-8" />
        {t("title")}
      </h1>
      <div className="mt-4 flex h-full gap-8">
        <div className="text-appmenu-item-text *:hover:bg-appmenu-hover-bg flex flex-col gap-2 *:flex *:cursor-pointer *:items-center *:gap-2 *:rounded-full *:px-3 *:py-2 *:transition *:active:scale-90">
          <NavLinkButton to="/settings/about">
            <Info />
            {t("tabs.about")}
          </NavLinkButton>
          {/* 越是用户可能频繁更改的，越靠上。（除了“关于”） */}
          <NavLinkButton to="/settings/visual">
            <Eye />
            {t("tabs.visual")}
          </NavLinkButton>
          <NavLinkButton to="/settings/control">
            <Keyboard />
            {t("tabs.control")}
          </NavLinkButton>
          <NavLinkButton to="/settings/keybinds">
            <Command />
            {t("tabs.keybinds")}
          </NavLinkButton>
          <NavLinkButton to="/settings/performance">
            <Zap />
            {t("tabs.performance")}
          </NavLinkButton>
          <NavLinkButton to="/settings/effects">
            <Sparkles />
            {t("tabs.effects")}
          </NavLinkButton>
          <NavLinkButton to="/settings/automation">
            <Bot />
            {t("tabs.automation")}
          </NavLinkButton>
          <NavLinkButton to="/settings/ai">
            <Brain />
            {t("tabs.ai")}
          </NavLinkButton>
          <NavLinkButton to="/settings/github">
            <Github />
            {t("tabs.github")}
          </NavLinkButton>
          <NavLinkButton to="/settings/sounds">
            <Speaker />
            {t("tabs.sounds")}
          </NavLinkButton>
          <NavLinkButton to="/settings/plugins">
            <Plug />
            {t("tabs.plugins")}
          </NavLinkButton>
        </div>
        <div className="mx-auto w-[1024px] overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
