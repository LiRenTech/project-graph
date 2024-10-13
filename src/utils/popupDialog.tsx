import React from "react";

const PopupDialogContext = React.createContext<{
  show: (children: React.ReactNode) => void;
  showPopup: boolean;
  children: React.ReactNode;
  location: [number, number];
}>({
  show: () => {},
  showPopup: false,
  children: <></>,
  location: [0, 0],
});

export const PopupDialogProvider = ({
  children: children_,
}: React.PropsWithChildren) => {
  const [showPopup, setShowPopup] = React.useState(false);
  const [children, setChildren] = React.useState<React.ReactNode>(<></>);
  const [location, setLocation] = React.useState<[number, number]>([0, 0]);

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setLocation([e.clientX, e.clientY]);
    };
    const onPointerDown = () => {
      setShowPopup(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const show = (children: React.ReactNode) => {
    setShowPopup(true);
    setChildren(children);
  };

  return (
    <PopupDialogContext.Provider
      value={{ showPopup, children, location, show }}
    >
      {children_}
    </PopupDialogContext.Provider>
  );
};

export const usePopupDialog = () => {
  return React.useContext(PopupDialogContext);
};
