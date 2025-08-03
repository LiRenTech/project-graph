import Github from "@/assets/github.svg?react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SubWindow } from "@/core/service/SubWindow";
import About from "@/pages/_sub_window/SettingsWindow/about";
import AISettings from "@/pages/_sub_window/SettingsWindow/ai";
import Automation from "@/pages/_sub_window/SettingsWindow/automation";
import Control from "@/pages/_sub_window/SettingsWindow/control";
import Effects from "@/pages/_sub_window/SettingsWindow/effects";
import GithubPage from "@/pages/_sub_window/SettingsWindow/github";
import Keybinds from "@/pages/_sub_window/SettingsWindow/keybinds";
import Performance from "@/pages/_sub_window/SettingsWindow/performance";
import Scripts from "@/pages/_sub_window/SettingsWindow/scripts";
import Sounds from "@/pages/_sub_window/SettingsWindow/sounds";
import Themes from "@/pages/_sub_window/SettingsWindow/themes";
import Visual from "@/pages/_sub_window/SettingsWindow/visual";
import { activeProjectAtom, store } from "@/state";
import { isMac } from "@/utils/platform";
import { Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import {
  Bot,
  Brain,
  CodeXml,
  Command,
  Eye,
  Info,
  Keyboard,
  Palette,
  Sparkles,
  Speaker,
  Wrench,
  Zap,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const pages = [
  {
    id: "about",
    icon: Info,
    Component: About,
  },
  {
    id: "visual",
    icon: Eye,
    Component: Visual,
  },
  {
    id: "control",
    icon: Wrench,
    Component: Control,
  },
  {
    id: "keybinds",
    icon: isMac ? Command : Keyboard,
    Component: Keybinds,
  },
  {
    id: "themes",
    icon: Palette,
    Component: Themes,
  },
  {
    id: "performance",
    icon: Zap,
    Component: Performance,
  },
  {
    id: "effects",
    icon: Sparkles,
    Component: Effects,
  },
  {
    id: "automation",
    icon: Bot,
    Component: Automation,
  },
  {
    id: "ai",
    icon: Brain,
    Component: AISettings,
  },
  {
    id: "github",
    icon: Github,
    Component: GithubPage,
  },
  {
    id: "sounds",
    icon: Speaker,
    Component: Sounds,
  },
  // {
  //   id: "plugins",
  //   icon: <Plug />,
  //   Component: <Plugins />,
  // },
  {
    id: "scripts",
    icon: CodeXml,
    Component: Scripts,
  },
] as const;
type Page = (typeof pages)[number]["id"];

export default function SettingsWindow({ defaultPage = "visual" }: { defaultPage?: Page }) {
  const { t } = useTranslation("settings");
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const Component = useMemo(() => pages.find((item) => item.id === currentPage)?.Component ?? Fragment, [currentPage]);

  return (
    <SidebarProvider className="h-full w-full overflow-hidden">
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {pages.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <div onClick={() => setCurrentPage(item.id)}>
                        <item.icon />
                        <span>{t(`tabs.${item.id}`)}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex w-full flex-col overflow-auto">
        <Component />
      </div>
    </SidebarProvider>
  );
}

SettingsWindow.open = (page: Page) => {
  store.get(activeProjectAtom)?.pause();
  SubWindow.create({
    title: "设置",
    children: <SettingsWindow defaultPage={page} />,
    rect: Rectangle.inCenter(new Vector(innerWidth > 1653 ? 1240 : innerWidth * 0.75, innerHeight * 0.875)),
  });
};
