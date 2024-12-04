import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";

export default function SettingsLayout() {
  const { t } = useTranslation("settingsTabs");

  return (
    <div className="fixed bottom-20 left-20 right-20 top-24">
      <h1 className="text-3xl font-bold">设置</h1>
      <div className="mt-4 flex h-full gap-8">
        <div className="flex flex-col gap-2 *:cursor-pointer *:rounded-full *:px-3 *:py-2 *:transition hover:*:bg-neutral-800 active:*:scale-90 page:*:bg-white/10">
          <NavLink to="/settings/about">{t("about")}</NavLink>
          <NavLink to="/settings/visual">{t("visual")}</NavLink>
          {/* <NavLink to="/settings/physical">{t("physical")}</NavLink> */}
          <NavLink to="/settings/performance">{t("performance")}</NavLink>
          <NavLink to="/settings/automation">{t("automation")}</NavLink>
          <NavLink to="/settings/control">{t("control")}</NavLink>
          <NavLink to="/settings/ai">{t("ai")}</NavLink>
          <NavLink to="/settings/github">{t("github")}</NavLink>
          <NavLink to="/settings/sounds">sounds</NavLink>
        </div>
        <div className="container mx-auto flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
