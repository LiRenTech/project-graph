import { SettingField } from "@/components/field";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SubWindow } from "@/core/service/SubWindow";
import { activeProjectAtom, store } from "@/state";
import { Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { settingsCategories } from "./_categories";
import { settingsCategoriesIcons } from "./_icons";

export default function SettingsWindow() {
  const { t } = useTranslation("settings");
  const [currentCategory, setCurrentCategory] = useState<keyof typeof settingsCategories>("visual");
  const [currentGroup, setCurrentGroup] = useState("");

  return (
    <SidebarProvider className="h-full w-full overflow-hidden">
      <Sidebar className="h-full overflow-auto">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Object.entries(settingsCategories).map(([category, value]) => {
                  // @ts-expect-error fuck ts
                  const CategoryIcon = settingsCategoriesIcons[category].icon;
                  return (
                    <Collapsible key={category} defaultOpen className="group/collapsible">
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <CollapsibleTrigger>
                            <CategoryIcon />
                            <span>{t(`categories.${category}.title`)}</span>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </CollapsibleTrigger>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          <CollapsibleContent>
                            {Object.entries(value).map(([group]) => {
                              // @ts-expect-error fuck ts
                              const GroupIcon = settingsCategoriesIcons[category][group];
                              return (
                                <SidebarMenuSubItem key={group}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={category === currentCategory && group === currentGroup}
                                    onClick={() => {
                                      // @ts-expect-error fuck ts
                                      setCurrentCategory(category);
                                      setCurrentGroup(group);
                                    }}
                                  >
                                    <a href="#">
                                      <GroupIcon />
                                      <span>{t(`categories.${category}.${group}`)}</span>
                                    </a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </CollapsibleContent>
                        </SidebarMenuSub>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex w-full flex-col overflow-auto">
        {currentCategory &&
          currentGroup &&
          // @ts-expect-error fuck ts
          settingsCategories[currentCategory][currentGroup].map((key) => <SettingField key={key} settingKey={key} />)}
      </div>
    </SidebarProvider>
  );
}

// TODO: page参数
// eslint-disable-next-line @typescript-eslint/no-unused-vars
SettingsWindow.open = (_page: string) => {
  store.get(activeProjectAtom)?.pause();
  SubWindow.create({
    title: "设置",
    children: <SettingsWindow />,
    rect: Rectangle.inCenter(new Vector(innerWidth > 1653 ? 1240 : innerWidth * 0.75, innerHeight * 0.875)),
  });
};
