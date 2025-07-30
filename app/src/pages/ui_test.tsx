import { Search } from "lucide-react";
import Box from "@/components/Box";
import Button from "@/components/Button";
import FileChooser from "@/components/FileChooser";
import IconButton from "@/components/IconButton";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Slider from "@/components/Slider";
import Switch from "@/components/Switch";
import { Dialog } from "@/components/dialog";
import { Panel } from "@/components/panel";

export default function UITestPage() {
  return (
    <div className="bg-panel-bg text-panel-text p-32">
      <Box tooltip="tooltip">Box</Box>
      <Button>Button</Button>
      <Input placeholder="Input" />
      <IconButton>
        <Search />
      </IconButton>
      <FileChooser kind="file" />
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
        打开面板
      </Button>
      <Button
        onClick={async () => {
          await Dialog.show({
            title: "提示",
            content: "提示内容",
            type: "info",
            input: true,
          });
        }}
      >
        Dialog
      </Button>
      <textarea>123456</textarea>
    </div>
  );
}
