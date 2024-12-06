import { TestTube2 } from "lucide-react";
import React from "react";
import Button from "../components/ui/Button";
import FileChooser from "../components/ui/FileChooser";
import IconButton from "../components/ui/IconButton";
import Input from "../components/ui/Input";
import Switch from "../components/ui/Switch";
import { usePopupDialog } from "../utils/popupDialog";

export default function TestPage() {
  const [switchValue, setSwitchValue] = React.useState(false);
  const [file, setFile] = React.useState("");
  const popupDialog = usePopupDialog();

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
      <FileChooser kind="file" value={file} onChange={(e) => setFile(e)} />
    </div>
  );
}
