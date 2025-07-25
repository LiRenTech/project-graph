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
  Plug,
  Sparkles,
  Speaker,
  Wrench,
  Zap,
} from "lucide-react";
import { startTransition, useState } from "react";
import { useTranslation } from "react-i18next";
import Github from "../../../assets/github.svg?react";
import Button from "../../../components/Button";
import { SubWindow } from "../../../core/service/SubWindow";
import { cn } from "../../../utils/cn";
import { isMac } from "../../../utils/platform";
import About from "./about";
import AISettings from "./ai";
import Automation from "./automation";
import Control from "./control";
import Effects from "./effects";
import GithubPage from "./github";
import Keybinds from "./keybinds";
import Performance from "./performance";
import Plugins from "./plugins";
import Scripts from "./scripts";
import Sounds from "./sounds";
import Themes from "./themes";
import Visual from "./visual";

const pages = [
  {
    id: "about",
    icon: <Info />,
    children: <About />,
  },
  {
    id: "visual",
    icon: <Eye />,
    children: <Visual />,
  },
  {
    id: "control",
    icon: <Wrench />,
    children: <Control />,
  },
  {
    id: "keybinds",
    icon: isMac ? <Command /> : <Keyboard />,
    children: <Keybinds />,
  },
  {
    id: "themes",
    icon: <Palette />,
    children: <Themes />,
  },
  {
    id: "performance",
    icon: <Zap />,
    children: <Performance />,
  },
  {
    id: "effects",
    icon: <Sparkles />,
    children: <Effects />,
  },
  {
    id: "automation",
    icon: <Bot />,
    children: <Automation />,
  },
  {
    id: "ai",
    icon: <Brain />,
    children: <AISettings />,
  },
  {
    id: "github",
    icon: <Github />,
    children: <GithubPage />,
  },
  {
    id: "sounds",
    icon: <Speaker />,
    children: <Sounds />,
  },
  {
    id: "plugins",
    icon: <Plug />,
    children: <Plugins />,
  },
  {
    id: "scripts",
    icon: <CodeXml />,
    children: <Scripts />,
  },
] as const;
type Page = (typeof pages)[number]["id"];

export default function SettingsWindow({ defaultPage = "visual" }: { defaultPage?: Page }) {
  const { t } = useTranslation("settings");
  const [currentPage, setCurrentPage] = useState(defaultPage);

  return (
    <div className="flex h-full w-full flex-col p-8">
      <div className="flex flex-1 gap-8 overflow-hidden">
        <div className="text-appmenu-item-text flex h-full flex-col gap-2 overflow-y-auto overflow-x-hidden *:flex *:cursor-pointer *:items-center *:gap-2 *:rounded-full *:px-3 *:py-2 *:transition *:active:scale-90">
          {pages.map((page) => (
            <Button
              key={page.id}
              onClick={() => {
                startTransition(() => {
                  setCurrentPage(page.id);
                });
              }}
              className={cn(
                page.id !== currentPage && "text-sub-window-text border-none bg-transparent hover:scale-125",
              )}
            >
              {page.icon}
              {t(`tabs.${page.id}`)}
            </Button>
          ))}
        </div>
        <div className="mx-auto max-w-[900px] flex-1 overflow-auto rounded-xl">
          {pages.find((page) => page.id === currentPage)?.children}
        </div>
      </div>
    </div>
  );
}

SettingsWindow.open = (page: Page) => {
  SubWindow.create({
    title: "设置",
    children: <SettingsWindow defaultPage={page} />,
    rect: Rectangle.inCenter(new Vector(window.innerWidth * 0.87, window.innerHeight * 0.88)),
  });
};
