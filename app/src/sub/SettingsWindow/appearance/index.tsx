import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Palette } from "lucide-react";
import { Fragment, useState } from "react";
import ThemePage from "./theme";

export default function AppearanceTab() {
  const [currentCategory, setCurrentCategory] = useState("");

  // @ts-expect-error fuck ts
  const Component = currentCategory && currentCategory in categories ? categories[currentCategory].component : Fragment;
  return (
    <div className="flex h-full">
      <Sidebar className="h-full overflow-auto">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Object.entries(categories).map(([k, v]) => (
                  <SidebarMenuItem key={k}>
                    <SidebarMenuButton asChild onClick={() => setCurrentCategory(k)} isActive={currentCategory === k}>
                      <div>
                        <v.icon />
                        <span>{v.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="mx-auto flex w-2/3 flex-col overflow-auto">
        <Component />
      </div>
    </div>
  );
}

const categories = {
  theme: {
    name: "主题",
    icon: Palette,
    component: ThemePage,
  },
};
