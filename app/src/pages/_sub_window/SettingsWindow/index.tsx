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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Github from "../../../assets/github.svg?react";
import Button from "../../../components/Button";
import { Rectangle } from "../../../core/dataStruct/shape/Rectangle";
import { Vector } from "../../../core/dataStruct/Vector";
import { SubWindow } from "../../../core/service/SubWindow";
import { cn } from "../../../utils/cn";
import { isMac } from "../../../utils/platform";
import About from "./about";
import AI from "./ai";
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
    component: <About />,
  },
  {
    id: "visual",
    icon: <Eye />,
    component: <Visual />,
  },
  {
    id: "control",
    icon: <Wrench />,
    component: <Control />,
  },
  {
    id: "keybinds",
    icon: isMac ? <Command /> : <Keyboard />,
    component: <Keybinds />,
  },
  {
    id: "themes",
    icon: <Palette />,
    component: <Themes />,
  },
  {
    id: "performance",
    icon: <Zap />,
    component: <Performance />,
  },
  {
    id: "effects",
    icon: <Sparkles />,
    component: <Effects />,
  },
  {
    id: "automation",
    icon: <Bot />,
    component: <Automation />,
  },
  {
    id: "ai",
    icon: <Brain />,
    component: <AI />,
  },
  {
    id: "github",
    icon: <Github />,
    component: <GithubPage />,
  },
  {
    id: "sounds",
    icon: <Speaker />,
    component: <Sounds />,
  },
  {
    id: "plugins",
    icon: <Plug />,
    component: <Plugins />,
  },
  {
    id: "scripts",
    icon: <CodeXml />,
    component: <Scripts />,
  },
];

export default function SettingsWindow() {
  const { t } = useTranslation("settings");
  const [currentPage, setCurrentPage] = useState("visual");

  return (
    <div className="flex h-full w-full flex-col p-8">
      <div className="flex flex-1 gap-8 overflow-hidden">
        <div className="text-appmenu-item-text flex h-full flex-col gap-2 overflow-y-auto *:flex *:cursor-pointer *:items-center *:gap-2 *:rounded-full *:px-3 *:py-2 *:transition *:active:scale-90">
          {pages.map((page) => (
            <Button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
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
          {pages.find((page) => page.id === currentPage)?.component}
        </div>
      </div>
    </div>
  );
}

SettingsWindow.open = () => {
  SubWindow.create({
    title: "设置",

    children: <SettingsWindow />,
    rect: Rectangle.inCenter(new Vector(window.innerWidth * 0.87, window.innerHeight * 0.88)),
  });
};
