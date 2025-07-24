import { useEffect, useState } from "react";
import { getDeviceId } from "../utils/otherApi";
// import { open } from "@tauri-apps/plugin-shell";
// import Button from "../components/Button";

/**
 * 彩蛋界面
 * @returns
 */
export default function InfoPage() {
  const [dataList, setDataList] = useState<string[]>([]);
  const [deviceId, setDeviceId] = useState("");

  const onMouseWheel = (e: WheelEvent) => {
    e.preventDefault();
    // 经过mac测试，发现deltaMode永远是0，0代表像素级别滚动
    // 1代表行滚动，2代表页面滚动
    // const newData = `${e.deltaX}, ${e.deltaY}, ${e.deltaMode}`;
    const newData = `${e.deltaX}, ${e.deltaY}`;
    setDataList((prev) => {
      const newList = [...prev, newData];
      // 将长度限制为15
      if (newList.length > 15) {
        newList.shift();
      }
      return newList;
    });
  };
  // pointermove 无法区分鼠标和触摸板（windows）
  // const onPointerMove = (e: PointerEvent) => {
  //   // };

  useEffect(() => {
    window.addEventListener("wheel", onMouseWheel);
    // window.addEventListener("pointermove", onPointerMove);

    getDeviceId().then((d) => {
      setDeviceId(d);
    });

    return () => {
      window.removeEventListener("wheel", onMouseWheel);
      // window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <>
      <div className="h-full overflow-x-auto px-4 py-24">
        <h1 className="text-center text-2xl font-bold">测试界面</h1>
        {/* <h2 className="text-center text-3xl font-bold">我的统计信息</h2>
        <p>敬请期待</p>
        <h2 className="text-center text-3xl font-bold">我的解锁成就</h2>
        <p>敬请期待</p> */}
        <div className="text-panel-details-text text-xs">
          <p>{navigator.userAgent}</p>
          <p>神秘字符串：{deviceId}</p>
        </div>

        <input type="text" />
        {/* <Button onClick={() => open("https://project-graph.top")}>open函数打开官网</Button> */}
        <br />
        <h2>滑动鼠标滚动事件：用于检测不同系统鼠标滚轮差异</h2>
        <div className="h-96 overflow-y-auto bg-black text-xs text-white">
          {dataList.map((data, i) => {
            return <p key={i}>{data}</p>;
          })}
        </div>
      </div>
    </>
  );
}
