import { useEffect, useMemo, useState } from "react";

/**
 * 元素弹出动画
 * 正确用法：
 * <Popin show={show}>
 *   <div>...</div>
 * </Popin>
 * 错误用法：
 * <Popin show={show}>
 *   <div>...</div>
 *   <div>...</div>
 * </Popin>
 * <Popin show={show}>
 *   <Xxx />
 * </Popin>
 */
export default function Popin({ show, children }: { show: boolean; children: React.ReactElement<any> }) {
  const [realShow, setRealShow] = useState(false);
  const [render, setRender] = useState(false);
  const realChildren = useMemo(() => {
    if (!render) return null;
    const className = realShow ? " scale-100 opacity-100" : " scale-75 opacity-0";
    const c = {
      ...children,
      props: {
        ...children.props,
        className: (children.props.className ? children.props.className : "") + className,
      },
    };
    return c;
  }, [realShow, render, children]);

  useEffect(() => {
    if (show) {
      setRender(true);
      setTimeout(() => {
        setRealShow(true);
      }, 50);
    } else {
      setRealShow(false);
      setTimeout(() => {
        setRender(false);
      }, 500);
    }
  }, [show]);

  return realChildren;
}
