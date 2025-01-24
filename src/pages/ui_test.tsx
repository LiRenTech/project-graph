import { Search } from "lucide-react";
import Box from "../components/ui/Box";
import Button from "../components/ui/Button";
import FileChooser from "../components/ui/FileChooser";
import IconButton from "../components/ui/IconButton";
import Input from "../components/ui/Input";
import KeyBind from "../components/ui/KeyBind";
import Select from "../components/ui/Select";
import Slider from "../components/ui/Slider";
import Switch from "../components/ui/Switch";

export default function UITestPage() {
  return (
    <div className="w-min p-32">
      <div className="pointer-events-none absolute left-48 top-48 h-96 w-96 rounded-full bg-green-100 blur-[300px]"></div>
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
    </div>
  );
}
