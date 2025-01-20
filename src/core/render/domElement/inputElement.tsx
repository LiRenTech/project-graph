import { getMultiLineTextSize } from "../../../utils/font";
import { Vector } from "../../dataStruct/Vector";
import { Camera } from "../../stage/Camera";
import { Renderer } from "../canvas2d/renderer";

/**
 * 主要用于解决canvas上无法输入的问题，用临时生成的jsdom元素透明地贴在上面
 */
export namespace InputElement {
  /**
   * 在指定位置创建一个输入框
   * @param location 输入框的左上角位置（相对于窗口左上角的位置）
   * @param defaultValue 一开始的默认文本
   * @param onChange 输入框文本改变函数
   * @param style 输入框样式
   * @returns
   */
  export function input(
    location: Vector,
    defaultValue: string,
    onChange: (value: string) => void = () => {},
    style: Partial<CSSStyleDeclaration> = {},
  ): Promise<string> {
    return new Promise((resolve) => {
      const inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.value = defaultValue;
      inputElement.style.position = "fixed";
      inputElement.style.top = `${location.y}px`;
      inputElement.style.left = `${location.x}px`;
      inputElement.id = "input-element";
      inputElement.autocomplete = "off";
      Object.assign(inputElement.style, style);
      document.body.appendChild(inputElement);
      inputElement.focus();
      inputElement.select();
      const removeElement = () => {
        if (document.body.contains(inputElement)) {
          try {
            // 暂时关闭频繁弹窗报错。
            document.body.removeChild(inputElement);
          } catch (error) {
            console.error(error);
          }
        }
      };

      const onOutsideClick = (event: Event) => {
        if (!inputElement.contains(event.target as Node)) {
          resolve(inputElement.value);
          onChange(inputElement.value);
          document.body.removeEventListener("click", onOutsideClick);
          removeElement();
        }
      };
      const onOutsideWheel = () => {
        resolve(inputElement.value);
        onChange(inputElement.value);
        document.body.removeEventListener("click", onOutsideClick);
        removeElement();
      };
      setTimeout(() => {
        document.body.addEventListener("click", onOutsideClick);
        document.body.addEventListener("touchstart", onOutsideClick);
        document.body.addEventListener("wheel", onOutsideWheel);
      }, 10);
      inputElement.addEventListener("input", () => {
        onChange(inputElement.value);
      });
      inputElement.addEventListener("blur", () => {
        resolve(inputElement.value);
        onChange(inputElement.value);
        document.body.removeEventListener("click", onOutsideClick);
        removeElement();
      });
      inputElement.addEventListener("keydown", (event) => {
        event.stopPropagation();
        if (event.key === "Enter") {
          resolve(inputElement.value);
          onChange(inputElement.value);
          document.body.removeEventListener("click", onOutsideClick);
          removeElement();
        }
        if (event.key === "Tab") {
          // 防止tab切换到其他按钮
          event.preventDefault();
        }
      });
    });
  }
  /**
   * 在指定位置创建一个多行输入框
   * @param location 输入框的左上角位置（相对于窗口左上角的位置）
   * @param defaultValue 一开始的默认文本
   * @param onChange 输入框文本改变函数
   * @param style 输入框样式
   * @returns
   */
  export function textarea(
    location: Vector,
    defaultValue: string,
    onChange: (value: string) => void = () => {},
    style: Partial<CSSStyleDeclaration> = {},
  ): Promise<string> {
    return new Promise((resolve) => {
      const textareaElement = document.createElement("textarea");
      textareaElement.value = defaultValue;
      textareaElement.style.position = "fixed";
      textareaElement.style.top = `${location.y}px`;
      textareaElement.style.left = `${location.x}px`;
      textareaElement.id = "textarea-element";
      textareaElement.autocomplete = "off";
      textareaElement.style.resize = "none"; // 禁止用户手动调整大小
      textareaElement.style.overflow = "hidden"; // 隐藏滚动条
      textareaElement.style.height = "auto"; // 初始化高度为auto
      textareaElement.style.width = "auto"; // 初始化宽度为auto
      const initSize = getMultiLineTextSize(
        defaultValue,
        Renderer.FONT_SIZE,
        1.5,
      );
      const minWidth = initSize.x * Camera.currentScale;
      console.log(minWidth, "minWidth");
      textareaElement.style.minHeight = `${initSize.y * Camera.currentScale}px`; // 设置最小高度
      textareaElement.style.minWidth = `${initSize.x * Camera.currentScale}px`; // 设置最小宽度
      textareaElement.style.whiteSpace = "pre"; // 保持空白符不变
      textareaElement.style.wordWrap = "break-word"; // 自动换行
      Object.assign(textareaElement.style, style);
      document.body.appendChild(textareaElement);

      textareaElement.focus();
      textareaElement.select();
      // 以上这两部必须在appendChild之后执行
      const removeElement = () => {
        if (document.body.contains(textareaElement)) {
          try {
            // 暂时关闭频繁弹窗报错。
            document.body.removeChild(textareaElement);
          } catch (error) {
            console.error(error);
          }
        }
      };

      const onOutsideClick = (event: Event) => {
        if (!textareaElement.contains(event.target as Node)) {
          resolve(textareaElement.value);
          onChange(textareaElement.value);
          document.body.removeEventListener("click", onOutsideClick);
          removeElement();
        }
      };
      const onOutsideWheel = () => {
        resolve(textareaElement.value);
        onChange(textareaElement.value);
        document.body.removeEventListener("click", onOutsideClick);
        removeElement();
      };
      setTimeout(() => {
        document.body.addEventListener("click", onOutsideClick);
        document.body.addEventListener("touchstart", onOutsideClick);
        document.body.addEventListener("wheel", onOutsideWheel);
      }, 10);

      // 自动调整textarea的高度和宽度
      const adjustSize = () => {
        // 重置高度和宽度以获取正确的scrollHeight和scrollWidth
        textareaElement.style.height = "auto";
        textareaElement.style.width = "auto";

        // 设置新的高度和宽度
        textareaElement.style.height = `${textareaElement.scrollHeight}px`;
        textareaElement.style.width = `${textareaElement.scrollWidth}px`;
        console.log("adjustSize");
      };
      // setInterval(() => {
      //   adjustSize();
      // }, 1000);
      setTimeout(() => {
        adjustSize(); // 初始化时调整大小
        console.log("初始化时调整大小");
      }, 10);
      textareaElement.addEventListener("input", () => {
        onChange(textareaElement.value);
        adjustSize();
      });
      textareaElement.addEventListener("blur", () => {
        resolve(textareaElement.value);
        onChange(textareaElement.value);
        document.body.removeEventListener("click", onOutsideClick);
        removeElement();
      });
      textareaElement.addEventListener("keydown", (event) => {
        event.stopPropagation();
        if (event.key === "Tab") {
          // 防止tab切换到其他按钮
          event.preventDefault();
          // 改成插入一个制表符
          const start = textareaElement.selectionStart;
          const end = textareaElement.selectionEnd;
          textareaElement.value =
            textareaElement.value.substring(0, start) +
            "\t" +
            textareaElement.value.substring(end);
          textareaElement.selectionStart = start + 1;
          textareaElement.selectionEnd = start + 1;
        } else if (event.key === "Escape") {
          resolve(textareaElement.value);
          onChange(textareaElement.value);
          document.body.removeEventListener("click", onOutsideClick);
          removeElement();
        } else if (event.key === "Enter") {
          // 如果按下了ctrl键
          if (event.ctrlKey) {
            resolve(textareaElement.value);
            onChange(textareaElement.value);
            document.body.removeEventListener("click", onOutsideClick);
            removeElement();
          }
        }
      });
    });
  }
}
