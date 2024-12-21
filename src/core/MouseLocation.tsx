export namespace MouseLocation {
  export let x: number = 0;
  export let y: number = 0;

  export function init() {
    window.addEventListener("mousemove", (event) => {
      x = event.clientX;
      y = event.clientY;
    });
  }
}
