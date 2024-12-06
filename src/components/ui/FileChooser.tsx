import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen } from "lucide-react";
import Button from "./Button";
import Input from "./Input";

export default function FileChooser({
  kind,
  value = "",
  onChange = () => {},
}: {
  kind: "file" | "directory";
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input type="text" value={value} onChange={onChange} />
      <Button
        onClick={() => {
          open({
            directory: kind === "directory",
            multiple: false,
          }).then((result) => {
            onChange(result ?? "");
          });
        }}
      >
        {<FolderOpen />}
      </Button>
    </div>
  );
}
