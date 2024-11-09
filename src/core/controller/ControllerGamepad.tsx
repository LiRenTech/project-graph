import { Disposable } from "../interfaces/Disposable";
import { Tickable } from "../interfaces/Tickable";
import { Settings } from "../Settings";

/**
 * @see https://w3c.github.io/gamepad/#remapping
 */
export interface EventMap {
  [key: `button${number}down`]: () => void;
  leftStick: (x: number, y: number) => void;
  rightStick: (x: number, y: number) => void;
}

export class ControllerGamepad implements Tickable, Disposable {
  private readonly listeners: Record<string, ((...args: any[]) => void)[]> = {};
  private readonly lastButtonState: Record<string, boolean> = {
    buttonA: false,
    buttonB: false,
    buttonX: false,
    buttonY: false,
    hatLeft: false,
    hatRight: false,
    hatUp: false,
    hatDown: false,
    buttonL1: false,
    buttonR1: false,
    buttonL2: false,
    buttonR2: false,
    buttonSelect: false,
    buttonStart: false,
    buttonL3: false,
    buttonR3: false,
  };
  private readonly lastStickState: Record<string, [number, number]> = {
    leftStick: [0, 0],
    rightStick: [0, 0],
  };
  /** 摇杆死区 */
  private deadzone = 0;

  constructor() {
    console.log("ControllerGamepad init");
    window.addEventListener("gamepadconnected", this.onGamepadConnected);
    Settings.watch("gamepadDeadzone", (value) => {
      this.deadzone = value;
    });
  }

  dispose() {
    window.removeEventListener("gamepadconnected", this.onGamepadConnected);
  }

  tick() {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (!gamepad) {
        continue;
      }
      // 触发按键事件
      for (const button in gamepad.buttons) {
        const value = gamepad.buttons[button].value;
        const pressed = value > 0.5;
        const lastPressed = this.lastButtonState[button];
        if (pressed && !lastPressed) {
          this.triggerEvent(
            `button${button.charAt(0).toUpperCase()}${button.slice(1)}down` as any,
          );
        } else if (!pressed && lastPressed) {
          this.triggerEvent(
            `button${button.charAt(0).toUpperCase()}${button.slice(1)}up` as any,
          );
        }
        this.lastButtonState[button] = pressed;
      }

      // 触发摇杆事件
      for (let i = 0; i < gamepad.axes.length; i += 2) {
        const stick = i === 0 ? "leftStick" : "rightStick";
        const x = gamepad.axes[i];
        const y = gamepad.axes[i + 1];
        const lastX = this.lastStickState[stick][0];
        const lastY = this.lastStickState[stick][1];
        if (x !== lastX || y !== lastY) {
          const absX = Math.abs(x);
          const absY = Math.abs(y);
          if (absX < this.deadzone && absY < this.deadzone) {
            continue;
          }
          this.triggerEvent(stick, x, y);
        }
        this.lastStickState[stick] = [x, y];
      }
    }
  }

  private onGamepadConnected = (event: GamepadEvent) => {
    const gamepad = event.gamepad;
    this.initGamepad(gamepad);
  };

  private initGamepad(gamepad: Gamepad) {
    console.log("Gamepad connected:", gamepad.id);
  }

  on<K extends keyof EventMap>(event: K, listener: EventMap[K]) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  private triggerEvent<K extends keyof EventMap>(
    event: K,
    ...args: Parameters<EventMap[K]>
  ) {
    console.log("Trigger event:", event, args);
    const listeners = this.listeners[event];
    if (listeners) {
      for (const listener of listeners) {
        listener(...args);
      }
    }
  }
}
