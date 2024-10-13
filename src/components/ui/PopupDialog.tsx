import React from "react";
import { usePopupDialog } from "../../utils/popupDialog";
import { cn } from "../../utils/cn";
import Box from "./Box";

export default function PopupDialog() {
  const popupDialog = usePopupDialog();
  const ref = React.useRef<HTMLDivElement>(null);
  const [location, setLocation] = React.useState<[number, number]>([0, 0]);

  React.useEffect(() => {
    if (popupDialog.showPopup) {
      console.log(ref.current);
      const [mouseX, mouseY] = popupDialog.location;
      const { width: popupWidth, height: popupHeight } =
        ref.current?.getBoundingClientRect()!;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let adjustedX = mouseX;
      let adjustedY = mouseY;

      // 检查弹窗右侧是否超出窗口
      if (mouseX + popupWidth > windowWidth) {
        adjustedX = windowWidth - popupWidth;
      }
      // 检查弹窗底部是否超出窗口
      if (mouseY + popupHeight > windowHeight) {
        adjustedY = windowHeight - popupHeight;
      }
      // 检查弹窗左侧是否超出窗口
      if (mouseX < 0) {
        adjustedX = 0;
      }
      // 检查弹窗顶部是否超出窗口
      if (mouseY < 0) {
        adjustedY = 0;
      }

      setLocation([adjustedX, adjustedY]);
    }
  }, [popupDialog.showPopup]);

  return (
    <Box
      ref={ref}
      style={{ position: "fixed", top: location[1], left: location[0] }}
      className={cn(
        "pointer-events-none z-50 scale-90 p-2 opacity-0 transition",
        {
          "pointer-events-auto scale-100 opacity-100": popupDialog.showPopup,
        },
      )}
      onPointerDown={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {popupDialog.children}
    </Box>
  );
}
