import { TestTube2 } from "lucide-react";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import Input from "../components/ui/Input";
import Switch from "../components/ui/Switch";
import React from "react";
import { usePopupDialog } from "../utils/popupDialog";
import { useTranslation } from "react-i18next";

export default function TestPage() {
  const [switchValue, setSwitchValue] = React.useState(false);
  const popupDialog = usePopupDialog();
  const { t } = useTranslation();

  const popup = () => {
    popupDialog.show(<>test</>);
  };

  return (
    <div className="pt-20">
      <Button onClick={popup}>button</Button>
      <IconButton>
        <TestTube2 />
      </IconButton>
      <Input placeholder="placeholder" />
      <Switch value={switchValue} onChange={(e) => setSwitchValue(e)} />
      {t("test")}
    </div>
  );
}
