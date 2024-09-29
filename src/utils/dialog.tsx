import React from "react";

type DialogButton = { text: string; onClick?: () => void };

const DialogContext = React.createContext<{
  show: (title: string, content: string, buttons?: DialogButton[]) => void;
  showDialog: boolean;
  title: string;
  content: string;
  buttons: DialogButton[];
}>({
  show: () => {},
  showDialog: false,
  title: "",
  content: "",
  buttons: [],
});

export const DialogProvider = ({ children }: React.PropsWithChildren) => {
  const [showDialog, setShowDialog] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [buttons, setButtons] = React.useState<DialogButton[]>([]);

  const show = (
    title: string,
    content: string,
    buttons: DialogButton[] = [{ text: "确定" }],
  ) => {
    setShowDialog(true);
    setTitle(title);
    setContent(content);
    setButtons(
      buttons.map((button) => ({
        ...button,
        onClick: () => {
          setShowDialog(false);
          button.onClick?.();
        },
      })),
    );
  };

  return (
    <DialogContext.Provider
      value={{ show, showDialog, title, content, buttons }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  return React.useContext(DialogContext);
};
