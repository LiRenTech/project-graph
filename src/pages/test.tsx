import { TestTube2 } from "lucide-react";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import Input from "../components/ui/Input";
import Switch from "../components/ui/Switch";
import React from "react";

export default function TestPage() {
  const [switchValue, setSwitchValue] = React.useState(false);

  return (
    <div className="pt-20">
      <Button>dialog</Button>
      <IconButton>
        <TestTube2 />
      </IconButton>
      <Input placeholder="placeholder" />
      <Switch value={switchValue} onChange={(e) => setSwitchValue(e)} />
    </div>
  );
}
