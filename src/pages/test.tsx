import { useState } from "react";
import KeyBind, { KeyModifiers } from "../components/ui/KeyBind";

export default function TestPage() {
  const [key, setKey] = useState("");
  const [modifiers, setModifiers] = useState<KeyModifiers>({
    control: false,
    alt: false,
    shift: false,
  });

  return (
    <div className="pt-20">
      <KeyBind
        value={key}
        modifiers={modifiers}
        onChangeKey={setKey}
        onChangeModifiers={setModifiers}
      />
      {key}
      {JSON.stringify(modifiers)}
    </div>
  );
}
