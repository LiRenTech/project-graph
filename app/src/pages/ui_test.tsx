import { Search } from "lucide-react";
import Box from "../components/Box";
import Button from "../components/Button";
import FileChooser from "../components/FileChooser";
import IconButton from "../components/IconButton";
import Input from "../components/Input";
import KeyBind from "../components/KeyBind";
import Select from "../components/Select";
import Slider from "../components/Slider";
import Switch from "../components/Switch";
import { Panel } from "../components/panel";

export default function UITestPage() {
  return (
    <div className="w-min bg-slate-400 p-32">
      <Box tooltip="tooltip">Box</Box>
      <Button>Button</Button>
      <Input placeholder="Input" />
      <IconButton>
        <Search />
      </IconButton>
      <FileChooser kind="file" />
      <KeyBind />
      <Select
        value="1"
        options={[
          { label: "Option 1", value: "1" },
          { label: "Option 2", value: "2" },
          { label: "Option 3", value: "3" },
        ]}
      />
      <Slider />
      <Switch />
      <Switch value />
      <Button
        onClick={() => {
          Panel.show(
            {
              title: "Panel",
              buttons: [
                {
                  label: "button",
                  onClick: () => {},
                },
              ],
            },
            <>content</>,
          );
        }}
      >
        open panel
      </Button>
    </div>
  );
}
