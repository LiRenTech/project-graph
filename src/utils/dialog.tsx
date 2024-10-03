import React from "react";

type DialogButton = { text: string; onClick?: (value?: string) => void };
type DialogType = "info" | "success" | "warning" | "error";
type DialogOptions = {
  title: string;
  content: string;
  type: DialogType;
  buttons: DialogButton[];
  code: string;
  input: boolean;
};
type DialogShowFunc = (options: Partial<DialogOptions>) => Promise<{
  button: string;
  value?: string;
}>;

/**
 * 对话框上下文
 * @param show 对话框显示函数
 * @param showDialog 对话框是否显示
 * @param title 对话框标题
 * @param type 对话框类型 info | success | warning | error
 * @param content 对话框内容
 * @param buttons 对话框按钮列表 [{ text: "确定", onClick: () => void }]
 * @param code 代码
 */
const DialogContext = React.createContext<
  DialogOptions & {
    show: DialogShowFunc;
    showDialog: boolean;
  }
>({
  show: async () => ({ button: "" }),
  showDialog: false,
  title: "",
  content: "",
  type: "info",
  buttons: [],
  code: "",
  input: false,
});

export const DialogProvider = ({ children }: React.PropsWithChildren) => {
  const [showDialog, setShowDialog] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [type, setType] = React.useState<DialogType>("info");
  const [buttons, setButtons] = React.useState<DialogButton[]>([]);
  const [code, setCode] = React.useState("");
  const [input, setInput] = React.useState(false);

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
    code = "",
    input = false,
  }) =>
    new Promise((resolve) => {
      setShowDialog(true);
      setTitle(title);
      setContent(content || "");
      setType(type);
      setInput(input);
      setButtons(
        buttons.map((button) => ({
          ...button,
          onClick: (value) => {
            setShowDialog(false);
            setTimeout(() => {
              resolve({ button: button.text, value });
            }, 301);
          },
        })),
      );
      setCode(code);
    });

  return (
    <DialogContext.Provider
      value={{ show, showDialog, title, content, type, buttons, code, input }}
    >
      {children}
    </DialogContext.Provider>
  );
};

/**
 * 获取对话框上下文，dialog = useDialog()
 * @returns DialogContext
 */
export const useDialog = () => {
  return React.useContext(DialogContext);
};
