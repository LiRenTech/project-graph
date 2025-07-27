import { Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import { MouseLocation } from "../../core/service/controlService/MouseLocation";
import { GlobalMenu } from "../../core/service/GlobalMenu";
import { SubWindow } from "../../core/service/SubWindow";

export default function MenuWindow({ menu, winId = "" }: { menu: GlobalMenu.Menu; winId?: string }) {
  return (
    <div className="flex flex-col p-2">
      {menu.items.map((item, index) =>
        item instanceof GlobalMenu.MenuItem ? (
          <div
            key={index}
            className="el-menu-item flex cursor-pointer items-center gap-1 rounded-lg p-2 transition-all active:scale-90 active:rounded-2xl [&_svg]:size-5"
            onMouseUp={() => {
              item.fn();
              SubWindow.close(winId);
            }}
          >
            {item.icon}
            {item.name}
          </div>
        ) : item instanceof GlobalMenu.Separator ? (
          <div key={index} className="el-menu-separator h-[1px] rounded-full" />
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
    rect: new Rectangle(new Vector(MouseLocation.x - 8, MouseLocation.y < 42 ? 42 : MouseLocation.y), Vector.same(-1)),
    titleBarOverlay: true,
    closable: false,
    closeWhenClickOutside: true,
  });
};
