import { createRoot } from "react-dom/client";
import DialogComponent from "../components/ui/DialogComponent";

export namespace Dialog {
  export type DialogButton = {
    text: string;
    onClick?: (value?: string) => void;
  };
  export type DialogType = "info" | "success" | "warning" | "error";
  export type DialogOptions = {
    title: string;
    content: string;
    type: DialogType;
    buttons: DialogButton[];
    code: string;
    input: boolean;
  };
  export type DialogProps = DialogOptions & {
    onClose: (button: string, value?: string) => void;
  };
  export type DialogComponentProps = DialogOptions & {
    onClose: (button: string, value?: string) => void;
  };
  export type DialogShowFunc = (options: Partial<DialogOptions>) => Promise<{
    button: string;
    value?: string;
  }>;

  export function show(options: Partial<DialogOptions>): Promise<{
    button: string;
    value?: string;
  }> {
    return new Promise((resolve) => {
      // 启动一个新的React实例
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(
        <DialogComponent
          {...options}
          onClose={(button, value) => {
            resolve({ button, value });
            setTimeout(() => {
              root.unmount();
              document.body.removeChild(container);
            }, 300);
          }}
        />,
      );
    });
  }
}
