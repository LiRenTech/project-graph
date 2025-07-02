import { Rectangle } from "../../core/dataStruct/shape/Rectangle";
import { Vector } from "../../core/dataStruct/Vector";
import { MouseLocation } from "../../core/service/controlService/MouseLocation";
import { GlobalMenu } from "../../core/service/GlobalMenu";
import { SubWindow } from "../../core/service/SubWindow";

export default function MenuWindow({ menu }: { menu: GlobalMenu.Menu }) {
  return (
    <div className="flex flex-col p-2">
      {menu.items.map((item, index) =>
        item instanceof GlobalMenu.MenuItem ? (
          <div
            key={index}
            className="hover:bg-menu-item-hover-bg flex cursor-pointer items-center gap-1 rounded-lg p-2 transition-all active:scale-90 active:rounded-2xl"
            // onMouseUp={() => {
            //   console.log("click");
            // }}
          >
            {item.icon}
            {item.name}
          </div>
        ) : item instanceof GlobalMenu.Separator ? (
          <div key={index} className="bg-menu-separator h-[1px] rounded-full" />
        ) : (
          <></>
        ),
      )}
    </div>
  );
}

MenuWindow.open = (menu: GlobalMenu.Menu) => {
  SubWindow.create({
    children: <MenuWindow menu={menu} />,
    rect: new Rectangle(MouseLocation.vector(), Vector.same(-1)),
    titleBarOverlay: true,
    closable: false,
    closeWhenClickOutside: true,
  });
};
