import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SubWindow } from "@/core/service/SubWindow";
import { router } from "@/main";
import { DateChecker } from "@/utils/dateChecker";
import { isDesktop, isLinux, isMac, isMobile, isWeb, isWindows } from "@/utils/platform";

/**
 * 类似info界面，用于故障排查
 * @returns
 */
export default function TestPage() {
  return (
    <>
      <div className="px-4 pt-20">
        <p>
          isWeb: {isWeb.toString()}, isMobile: {isMobile.toString()}, isDesktop: {isDesktop.toString()}
        </p>
        <p>
          isMac: {isMac.toString()}, isWindows: {isWindows.toString()}, isLinux: {isLinux.toString()}
        </p>
        <p>当前是 {DateChecker.isCurrentEqualDate(3, 15) ? "3月15日!" : "其他日期"}</p>
        <textarea defaultValue={"输入框1: 正常输入框"} className="text-xs ring" />
        <div className="relative h-32 w-96 overflow-hidden p-2 text-xs outline outline-amber-200">
          <textarea defaultValue={"输入框2：relative里的正常"} className="ring" />
          <textarea defaultValue={"输入框3：relative里的绝对定位"} className="absolute right-2 top-2 h-12 w-24 ring" />
          <textarea
            defaultValue={"输入框3：relative里的绝对定位+z-index"}
            className="absolute bottom-2 right-2 z-50 h-12 w-24 resize-none ring"
          />
        </div>
        <textarea defaultValue={"输入框4: 直接绝对定位"} className="absolute bottom-2 right-2 h-12 text-xs ring" />
        <textarea
          defaultValue={"输入框5: 直接绝对定位+zindex50"}
          className="absolute bottom-20 right-2 z-50 h-12 text-xs ring"
        />
        <textarea
          defaultValue={"输入框6: 直接绝对定位+zindex999"}
          style={{ zIndex: 999 }}
          className="bottom-50 absolute right-2 h-12 text-xs ring"
        />
        <textarea
          defaultValue={"输入框7: fixed定位"}
          className="fixed bottom-64 right-2 h-12 resize-none text-xs ring"
        />
        <textarea
          defaultValue={"输入框8: fixed定位+zindex999"}
          style={{ zIndex: 999 }}
          className="fixed bottom-96 right-2 h-12 resize-none text-xs ring"
        />
        <Button onClick={() => router.navigate("/")}>不在context里面的跳转页面</Button>
        <Button
          onClick={() =>
            SubWindow.create({
              title: "子窗口",
              children: <>content</>,
            })
          }
        >
          创建子窗口
        </Button>
        <Button
          onClick={async () => {
            await AIEngine.chat([
              {
                role: "user",
                content:
                  (
                    await Dialog.show({
                      title: "输入内容",
                      content: "请输入内容",
                      input: true,
                    })
                  ).value ?? "",
              },
            ]);
          }}
        >
          ai
        </Button>
      </div>
    </>
  );
}
