import React from "react";

type DialogButton = { text: string; onClick?: () => void };
type DialogType = "info" | "success" | "warning" | "error";
type DialogOptions = {
  title: string;
  content: string;
  type: DialogType;
  buttons: DialogButton[];
};
type DialogShowFunc = (options: Partial<DialogOptions>) => Promise<string>;

const DialogContext = React.createContext<
  {
    show: DialogShowFunc;
    showDialog: boolean;
  } & DialogOptions
>({
  show: async () => "",
  showDialog: false,
  title: "",
  content: "",
  type: "info",
  buttons: [],
});

export const DialogProvider = ({ children }: React.PropsWithChildren) => {
  const [showDialog, setShowDialog] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [type, setType] = React.useState<DialogType>("info");
  const [buttons, setButtons] = React.useState<DialogButton[]>([]);

  /**
   * 显示对话框
   * @param title 对话框标题
   * @param content 对话框内容
   * @param buttons 按钮列表 [{ text: "确定", onClick: () => void }]
   * @returns Promise<string> 点击按钮的文本
   */
  const show: DialogShowFunc = ({
    title = "",
    content = "",
    type = "info",
    buttons = [{ text: "确定" }],
  }) =>
    new Promise((resolve) => {
      setShowDialog(true);
      setTitle(title);
      setContent(content || "");
      setType(type);
      setButtons(
        buttons.map((button) => ({
          ...button,
          onClick: () => {
            setShowDialog(false);
            button.onClick?.();
            setTimeout(() => {
              resolve(button.text);
            }, 301);
          },
        })),
      );
    });

  return (
    <DialogContext.Provider
      value={{ show, showDialog, title, content, type, buttons }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  return React.useContext(DialogContext);
};
