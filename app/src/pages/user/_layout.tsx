import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import NavLinkButton from "../../components/NavLinkButton";
import { FeatureFlags } from "../../core/service/FeatureFlags";

export default function SettingsLayout() {
  const { t } = useTranslation("user");
  return FeatureFlags.USER ? (
    <div className="flex h-full w-full flex-col p-8">
      <div className="flex flex-1 gap-8 overflow-hidden">
        <div className="text-appmenu-item-text *:hover:bg-appmenu-hover-bg flex h-full flex-col gap-2 overflow-y-auto *:flex *:cursor-pointer *:items-center *:gap-2 *:rounded-full *:px-3 *:py-2 *:transition *:active:scale-90">
          <NavLinkButton to="/user/login">
            <Info />
            {t("tabs.login")}
          </NavLinkButton>
          <NavLinkButton to="/user/register">
            <Info />
            {t("tabs.register")}
          </NavLinkButton>
        </div>
        <div className="mx-auto max-w-[900px] flex-1 overflow-auto rounded-xl">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div>此功能在当前版本中不可用</div>
  );
}
