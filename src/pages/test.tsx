import { TestTube2 } from "lucide-react";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";

export default function TestPage() {
  return (
    <div className="pt-20">
      <Button>Hello World</Button>
      <IconButton>
        <TestTube2 />
      </IconButton>
    </div>
  );
}
