import { Color } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { StageStyleManager } from "../../../stageStyle/StageStyleManager";
import { CurveRenderer } from "../basicRenderer/curveRenderer";
import { ShapeRenderer } from "../basicRenderer/shapeRenderer";
import { TextRenderer } from "../basicRenderer/textRenderer";
import { Renderer } from "../renderer";

/**
 * 画洞洞板式的背景
 * @param ctx
 * @param width
 * @param height
 */
export function renderDotBackground(viewRect: Rectangle) {
  const currentGap = getCurrentGap();
  const gridColor = StageStyleManager.currentStyle.GridNormalColor;
  const mainColor = StageStyleManager.currentStyle.GridHeavyColor;

  for (const y of getLocationYIterator(viewRect, currentGap)) {
    for (const x of getLocationXIterator(viewRect, currentGap)) {
      ShapeRenderer.renderCircle(
        Renderer.transformWorld2View(new Vector(x, y)),
        1,
        x === 0 || y === 0 ? mainColor : gridColor,
        Color.Transparent,
        0,
      );
    }
  }
}

/**
 * 水平线条式的背景
 */
export function renderHorizonBackground(viewRect: Rectangle) {
  const currentGap = getCurrentGap();
  const gridColor = StageStyleManager.currentStyle.GridNormalColor;
  const mainColor = StageStyleManager.currentStyle.GridHeavyColor;

  // 画横线
  for (const y of getLocationYIterator(viewRect, currentGap)) {
    const lineStartLocation = new Vector(viewRect.left, y);
    const lineEndLocation = new Vector(viewRect.right, y);

    CurveRenderer.renderSolidLine(
      Renderer.transformWorld2View(lineStartLocation),
      Renderer.transformWorld2View(lineEndLocation),
      y === 0 ? mainColor : gridColor,
      0.2,
    );
  }
}

/**
 * 垂直线条式的背景
 */
export function renderVerticalBackground(viewRect: Rectangle) {
  const currentGap = getCurrentGap();
  const gridColor = StageStyleManager.currentStyle.GridNormalColor;
  const mainColor = StageStyleManager.currentStyle.GridHeavyColor;

  // 画竖线
  for (const x of getLocationXIterator(viewRect, currentGap)) {
    const lineStartLocation = new Vector(x, viewRect.top);
    const lineEndLocation = new Vector(x, viewRect.bottom);
    CurveRenderer.renderSolidLine(
      Renderer.transformWorld2View(lineStartLocation),
      Renderer.transformWorld2View(lineEndLocation),
      x === 0 ? mainColor : gridColor,
      0.2,
    );
  }
}

/**
 * 平面直角坐标系背景
 * 只画一个十字坐标
 */
export function renderCartesianBackground(viewRect: Rectangle) {
  // x轴
  CurveRenderer.renderSolidLine(
    Renderer.transformWorld2View(new Vector(viewRect.left, 0)),
    Renderer.transformWorld2View(new Vector(viewRect.right, 0)),
    StageStyleManager.currentStyle.GridNormalColor,
    1,
  );
  // y轴
  CurveRenderer.renderSolidLine(
    Renderer.transformWorld2View(new Vector(0, viewRect.top)),
    Renderer.transformWorld2View(new Vector(0, viewRect.bottom)),
    StageStyleManager.currentStyle.GridNormalColor,
    1,
  );
  const currentGap = getCurrentGap();
  // 画x轴上的刻度
  for (const x of getLocationXIterator(viewRect, currentGap)) {
    TextRenderer.renderText(
      `${x}`,
      Renderer.transformWorld2View(new Vector(x, 0)),
      10,
      StageStyleManager.currentStyle.GridNormalColor,
    );
  }
  // 画y轴上的刻度
  for (const y of getLocationYIterator(viewRect, currentGap)) {
    TextRenderer.renderText(
      `${y}`,
      Renderer.transformWorld2View(new Vector(0, y)),
      10,
      StageStyleManager.currentStyle.GridNormalColor,
    );
  }
}

function getCurrentGap(): number {
  const gap = 50;
  let currentGap = gap;
  if (Camera.currentScale < 1) {
    while (currentGap * Camera.currentScale < gap - 1) {
      currentGap *= 2;
    }
  }
  return currentGap;
}

function* getLocationXIterator(
  viewRect: Rectangle,
  currentGap: number,
): IterableIterator<number> {
  let xStart = viewRect.location.x - (viewRect.location.x % currentGap);
  while (xStart < viewRect.right) {
    yield xStart;
    xStart += currentGap;
  }
}

function* getLocationYIterator(
  viewRect: Rectangle,
  currentGap: number,
): IterableIterator<number> {
  let yStart = viewRect.location.y - (viewRect.location.y % currentGap);
  while (yStart < viewRect.bottom) {
    yield yStart;
    yStart += currentGap;
  }
}
