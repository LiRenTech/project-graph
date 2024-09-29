import { TestTube2 } from "lucide-react";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import { useDialog } from "../utils/dialog";

export default function TestPage() {
  const dialog = useDialog();

  return (
    <div className="pt-20">
      <Button
        onClick={() => {
          dialog.show("test dialog", "This is a test dialog".repeat(100));
        }}
      >
        dialog
      </Button>
      <IconButton>
        <TestTube2 />
      </IconButton>
    </div>
  );
}
