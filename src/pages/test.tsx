import { TestTube2 } from "lucide-react";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import Input from "../components/ui/Input";
import Switch from "../components/ui/Switch";
import React from "react";
import { usePopupDialog } from "../utils/popupDialog";
import { useTranslation } from "react-i18next";
import { XML } from "../utils/xml";
import { StageDumper } from "../core/stage/StageDumper";

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
      <p>test xml:</p>
      {new XML("ompl")
        .attr("version", "2.0")
        .add("head")
        .add("title")
        .text("test")
        .up()
        .up()
        .add("body")
        .toString()}
      <br />
      <div className="h-64 overflow-auto p-2">
        <h2>序列化信息</h2>
        <pre className="text-xs">{JSON.stringify(StageDumper.dump(), null, 2)}</pre>
      </div>
    </div>
  );
}
