import {
  Bot,
  Brain,
  CodeXml,
  Command,
  Eye,
  Info,
  Keyboard,
  Palette,
  Plug,
  Settings,
  Sparkles,
  Speaker,
  Wrench,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import Github from "../../assets/github.svg?react";
import NavLinkButton from "../../components/NavLinkButton";
import { isMac } from "../../utils/platform";

export default function SettingsLayout() {
  const { t } = useTranslation("settings");
  return (
    <div className="top-18 fixed bottom-12 left-20 right-20 flex flex-col">
      <h1 className="text-appmenu-item-text my-2 flex items-center gap-2 text-3xl font-bold">
        <Settings className="h-8 w-8" />
        {t("title")}
      </h1>
      <div className="flex flex-1 gap-8 overflow-hidden">
        <div className="text-appmenu-item-text *:hover:bg-appmenu-hover-bg flex h-full flex-col gap-2 overflow-y-auto *:flex *:cursor-pointer *:items-center *:gap-2 *:rounded-full *:px-3 *:py-2 *:transition *:active:scale-90">
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
            <Wrench />
            {t("tabs.control")}
          </NavLinkButton>
          <NavLinkButton to="/settings/keybinds">
            {isMac ? <Command /> : <Keyboard />}
            {t("tabs.keybinds")}
          </NavLinkButton>
          <NavLinkButton to="/settings/themes">
            <Palette />
            {t("tabs.themes")}
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
          <NavLinkButton to="/settings/scripts">
            <CodeXml />
            {t("tabs.scripts")}
          </NavLinkButton>
        </div>
        <div className="mx-auto max-w-[900px] flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
