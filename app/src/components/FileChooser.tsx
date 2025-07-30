import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen } from "lucide-react";
import { isWeb } from "@/utils/platform";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function FileChooser({
  kind,
  value = "",
  onChange = () => {},
}: {
  kind: "file" | "directory";
  value?: string;
  onChange?: (value: string) => void;
}) {
  return isWeb ? (
    <div>网页版暂不支持文件选择</div>
  ) : (
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
