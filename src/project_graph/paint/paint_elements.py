from PyQt5.QtGui import QColor, QPainter

from project_graph.camera import Camera
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import PaintContext
from project_graph.settings.style_service import STYLE_SERVICE


def paint_grid(paint_context: PaintContext):
    """
    绘制网格
    最大精细到 每隔 100px 绘制一条线
    """
    paint = paint_context.painter.q_painter()
    camera = paint_context.camera

    gap = 100  # 网格世界间隔
    if camera.current_scale < 1:
        # gap会增大，不断 * 2倍。
        # 检测依据就是gap实际在view上的像素间隔，不能太密集，否则太卡
        while gap * camera.current_scale < 99:
            gap *= 2

    grid_color = STYLE_SERVICE.style.grid_line_color
    "网格线颜色"

    grid_color_main = STYLE_SERVICE.style.grid_bold_line_color
    "坐标轴颜色"

    view_rect = camera.cover_world_rectangle

    y_start = int(view_rect.location_left_top.y - (view_rect.location_left_top.y % gap))
    while y_start < view_rect.bottom():
        PainterUtils.paint_solid_line(
            paint,
            camera.location_world2view(NumberVector(view_rect.left(), y_start)),
            camera.location_world2view(NumberVector(view_rect.right(), y_start)),
            grid_color_main if y_start == 0 else grid_color,
            1,
        )
        y_start += gap

    x_start = int(view_rect.location_left_top.x - (view_rect.location_left_top.x % gap))
    while x_start < view_rect.right():
        PainterUtils.paint_solid_line(
            paint,
            camera.location_world2view(NumberVector(x_start, view_rect.top())),
            camera.location_world2view(NumberVector(x_start, view_rect.bottom())),
            grid_color_main if x_start == 0 else grid_color,
            1,
        )
        x_start += gap


def paint_details_data(paint: QPainter, camera: Camera, datas: list[str]):
    """
    左上角绘制细节信息
    :param paint:
    :param camera:
    :param datas:
    :return:
    """
    start_y = 100  # 顶部留白一些，因为菜单栏挡住了很大一块
    for i, data in enumerate(datas):
        PainterUtils.paint_text_from_top_left(
            paint,
            NumberVector(20, start_y + (i - 1) * 50),
            data,
            12,
            STYLE_SERVICE.style.details_debug_text_color,
        )
    pass


def paint_alert_message(paint: QPainter, camera: Camera, message: str):
    """
    屏幕中心绘制警告信息
    :param paint:
    :param camera:
    :param message:
    :return:
    """

    PainterUtils.paint_text_from_center(
        paint,
        NumberVector(camera.view_width / 2, camera.view_height / 2),
        message,
        24,
        QColor(255, 255, 0, 255),
    )


def paint_rect_in_world(
    paint: QPainter,
    camera: Camera,
    rect: Rectangle,
    fill_color: QColor,
    stroke_color: QColor,
):
    PainterUtils.paint_rect(
        paint,
        camera.location_world2view(rect.location_left_top),
        rect.width * camera.current_scale,
        rect.height * camera.current_scale,
        fill_color,
        stroke_color,
        1,
    )
