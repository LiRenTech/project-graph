"""
这个里面绘制的元素都是直接基于渲染坐标来绘制的，不是世界坐标
"""

import traceback

from PyQt5.QtCore import QPoint, QPointF, QRectF, QSizeF, Qt
from PyQt5.QtGui import (
    QColor,
    QFont,
    QFontMetrics,
    QImage,
    QPainter,
    QPainterPath,
    QPen,
    QTextDocument,
)

from project_graph.data_struct.circle import Circle
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.logging import log
from project_graph.tools.safe_int import safe_int


class PainterUtils:
    @staticmethod
    def paint_solid_path(
        painter: QPainter,
        points: list[NumberVector],
        color: QColor,
        width: float,
    ):
        """这个多余了，其实当时是怀疑qt渲染直线有性能问题所以换了个方法，但并不是"""
        pen = QPen(color, width)  # 创建QPen并设置颜色和宽度
        painter.setPen(pen)
        painter.setBrush(color)
        path = QPainterPath()
        if len(points) == 1:
            return
        for i, location in enumerate(points):
            if i == 0:
                path.moveTo(safe_int(location.x), safe_int(location.y))
            else:
                path.lineTo(safe_int(location.x), safe_int(location.y))
        painter.drawPath(path)
        pass

    @staticmethod
    def paint_location_sign(painter: QPainter, location: NumberVector):
        """
        一个点标记 调试用，是一个“X”的形状
        """
        PainterUtils.paint_solid_line(
            painter,
            location - NumberVector(10, 10),
            location + NumberVector(10, 10),
            QColor(255, 0, 0),
            1,
        )
        PainterUtils.paint_solid_line(
            painter,
            location - NumberVector(10, -10),
            location + NumberVector(10, -10),
            QColor(255, 0, 0),
            1,
        )

    @staticmethod
    def paint_solid_line(
        painter: QPainter,
        point1: NumberVector,
        point2: NumberVector,
        color: QColor,
        width: float,
    ):
        """
        绘制一条实线
        :param painter:
        :param point1:
        :param point2:
        :param color:
        :param width:
        :return:
        """
        pen = QPen(color, width)  # 创建QPen并设置颜色和宽度
        painter.setPen(pen)
        painter.setBrush(color)

        # painter.setRenderHint(QPainter.Antialiasing)
        painter.drawLine(
            int(point1.x), safe_int(point1.y), safe_int(point2.x), safe_int(point2.y)
        )
        # painter.setPen(QColor(0, 0, 0, 0))
        # painter.setBrush(QColor(0, 0, 0, 0))
        # painter.setRenderHint(QPainter.Antialiasing, False)
        pass

    @staticmethod
    def paint_dashed_line(
        painter: QPainter,
        point1: NumberVector,
        point2: NumberVector,
        color: QColor,
        width: float,
        dash_length: float,
    ):
        """
        绘制一条虚线
        :param painter:
        :param point1:
        :param point2:
        :param color:
        :param width:
        :param dash_length:
        :return:
        """
        pen = QPen(color, width)  # 创建QPen并设置颜色和宽度
        pen.setStyle(Qt.PenStyle.DashLine)  # 设置线型为虚线
        pen.setDashPattern([dash_length, dash_length])  # 设置虚线长度
        painter.setPen(pen)
        painter.setBrush(color)
        painter.setRenderHint(QPainter.Antialiasing)
        dx = point2.x - point1.x
        dy = point2.y - point1.y
        length = (dx**2 + dy**2) ** 0.5
        num_dashes = safe_int(length / dash_length)
        if num_dashes == 0:
            num_dashes = 1
        dash_pattern = [dash_length] * num_dashes
        dash_pattern.append(length - (num_dashes - 1) * dash_length)
        painter.setPen(QColor(0, 0, 0, 0))
        painter.setBrush(QColor(0, 0, 0, 0))
        painter.setRenderHint(QPainter.Antialiasing, False)
        painter.drawLine(
            safe_int(point1.x),
            safe_int(point1.y),
            safe_int(point2.x),
            safe_int(point2.y),
        )
        pass

    @staticmethod
    def paint_circle(
        painter: QPainter,
        circle: Circle,
        color: QColor,
        stroke_color: QColor,
        stroke_width: float,
    ):
        """
        绘制一个圆
        :param painter:
        :param circle:
        :param color:
        :param stroke_color:
        :param stroke_width:
        :return:
        """
        pen = QPen(stroke_color, stroke_width)  # 创建QPen并设置颜色和宽度
        painter.setPen(pen)
        painter.setBrush(color)
        # painter.setRenderHint(QPainter.Antialiasing)
        painter.drawEllipse(
            safe_int(circle.center.x - circle.radius),
            safe_int(circle.center.y - circle.radius),
            safe_int(circle.radius * 2),
            safe_int(circle.radius * 2),
        )
        painter.setPen(QColor(0, 0, 0, 0))
        painter.setBrush(QColor(0, 0, 0, 0))
        # painter.setRenderHint(QPainter.Antialiasing, False)
        pass

    # 画一个箭头
    @staticmethod
    def paint_arrow(
        painter: QPainter,
        point1: NumberVector,
        point2: NumberVector,
        color: QColor,
        width: float,
        arrow_size: float,
    ):
        """
        绘制一个箭头
        :param arrow_size: 箭头长度
        :param painter:
        :param point1: 视野坐标
        :param point2: 视野坐标
        :param color:
        :param width:
        :return:
        """
        # 画线
        PainterUtils.paint_solid_line(painter, point1, point2, color, width)
        lien_body_vector = NumberVector.from_two_points(point1, point2)
        PainterUtils.paint_solid_line(
            painter,
            point2,
            point2 - lien_body_vector.normalize().rotate(20) * arrow_size,
            color,
            width,
        )
        PainterUtils.paint_solid_line(
            painter,
            point2,
            point2 - lien_body_vector.normalize().rotate(-20) * arrow_size,
            color,
            width,
        )
        pass

    @staticmethod
    def paint_rect(
        painter: QPainter,
        left_top: NumberVector,
        width: float,
        height: float,
        fill_color: QColor,
        stroke_color: QColor = QColor(0, 0, 0, 0),
        stroke_width: float = 0,
        radius: float = 0.0,
    ):
        """
        绘制一个矩形，左上角坐标为left_top，宽为width，高为height，填充色为fill_color，边框色为stroke_color
        :param painter:
        :param left_top:
        :param width:
        :param height:
        :param fill_color:
        :param stroke_color:
        :return:
        """
        # 设置边框宽度
        pen = QPen(stroke_color, stroke_width)
        painter.setPen(pen)
        # painter.setPen(stroke_color)
        painter.setBrush(fill_color)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.drawRoundedRect(
            safe_int(left_top.x),
            safe_int(left_top.y),
            safe_int(width),
            safe_int(height),
            safe_int(radius),
            safe_int(radius),
        )
        painter.setPen(QColor(0, 0, 0, 0))
        painter.setBrush(QColor(0, 0, 0, 0))
        painter.setRenderHint(QPainter.Antialiasing, False)
        pass

    @staticmethod
    def paint_text_from_top_left(
        painter: QPainter,
        left_top: NumberVector,
        text: str,
        font_size: float,
        color: QColor,
    ):
        """
        绘制一个文本，左上角坐标为left_top，文本为text，字体大小为font_size，颜色为color
        :param painter:
        :param left_top:
        :param text:
        :param font_size:
        :param color:
        :return:
        """
        # 创建QFont对象并设置字体大小
        try:
            font = QFont("Times New Roman")
            font.setPointSizeF(font_size)
            # 获取字体度量信息
            font_metrics = QFontMetrics(font)
            # 设置QPainter的字体和颜色
            painter.setFont(font)
            painter.setPen(color)

            # 计算字体的ascent值，即基线到顶的距离

            # transform = QTransform()
            # factor = font_size / 20
            factor = 1
            ascent = font_metrics.ascent() * factor
            # transform.translate(left_top.x, left_top.y + ascent).scale(
            #     factor, factor
            # )
            # painter.setTransform(transform)

            # painter.drawText(QPoint(0, 0), text)

            # painter.resetTransform()
            # 转换left_top为整数坐标
            left_top = left_top.integer()
            left_top = QPointF(left_top.x, left_top.y)

            # 调整y坐标，使文本的左上角对齐
            adjusted_y = left_top.y() + ascent
            left_top.setY(adjusted_y)
            # 绘制文本
            painter.drawText(left_top, text)
        except Exception as e:
            log(f"Exception type: {type(e)}")
            log(f"Error message: {str(e)}")
            traceback.print_exc()
        pass

    @staticmethod
    def paint_text_from_center(
        painter: QPainter,
        center: NumberVector,
        text: str,
        font_size: float,
        color: QColor,
    ) -> tuple[int, int]:
        """
        绘制一个文本，其中心坐标为中心point，文本为text，字体大小为font_size，颜色为color
        :param painter: QPainter对象
        :param center: 文本的中心点 (NumberVector类型)
        :param text: 要绘制的文本
        :param font_size: 字体大小
        :param color: 文本颜色
        :return: None
        """
        try:
            font = QFont("Times New Roman")
            font.setPointSize(int(font_size))
            font_metrics = QFontMetrics(font)

            # 设置QPainter的字体和颜色
            painter.setFont(font)
            painter.setPen(color)

            # 转换center为整数坐标
            center = center.integer()
            center = QPoint(int(center.x), safe_int(center.y))

            # 获取文本的宽度和高度
            text_width = font_metrics.width(text)
            text_height = font_metrics.height()
            ascent = font_metrics.ascent()

            # 计算文本中心点相对于左上角的位置
            left_top_x = center.x() - text_width // 2
            left_top_y = center.y() - (text_height // 2) + ascent

            # 创建新的左上角坐标
            left_top = QPoint(left_top_x, left_top_y)

            # 绘制文本
            painter.drawText(left_top, text)
            return text_width, text_height
        except Exception as e:
            log(f"Exception type: {type(e)}")
            log(f"Error message: {str(e)}")
            import traceback

            traceback.print_exc()
            return 0, 0

    @staticmethod
    def paint_document_from_left_top(
        painter: QPainter,
        location: NumberVector,
        text: str,
        text_width: float,
        font_size: float,
        text_color: QColor,
        background_color: QColor,
    ) -> Rectangle:
        """
        document 是可以换行的多行文本
        text 传入的是html字符串
        最终返回的Rectangle是文本的矩形大小，视野坐标
        """
        # 创建新的坐标

        # 设置字体和颜色
        font = QFont("Times New Roman", safe_int(font_size))
        # 使用QTextDocument绘制文本
        document = QTextDocument()
        text = text.replace("\n", "<br>")
        document.setHtml(f'<body style="color: {text_color.name()};">{text}</body>')
        document.setTextWidth(text_width)
        h = document.size().height()
        # 大小
        css = f"body {{ color: {text_color.name()}; }}"
        document.setDefaultStyleSheet(css)
        document.setDefaultFont(font)

        # 画背景  # 太奇怪了，高度不确定
        # PainterUtils.paint_rect(
        #     painter,
        #     location,
        #     text_width,
        #     h,
        #     background_color,
        # )
        location = QPointF(int(location.x), safe_int(location.y))
        # 调整坐标
        painter.translate(location)
        # 这个可能只是一个矩形遮罩
        document.drawContents(painter, QRectF(QPointF(0, 0), QSizeF(5000, 5000)))
        painter.translate(-location)

        return Rectangle(
            NumberVector(location.x(), location.y()), width=text_width, height=h
        )

    @staticmethod
    def paint_image(
        painter: QPainter,
        left_top: NumberVector,
        image_path: str,
        width: float,
        height: float,
    ):
        """
        绘制一个图片，左上角坐标为left_top，图片路径为image_path，宽为width，高为height
        :param painter:
        :param left_top:
        :param image_path:
        :param width:
        :param height:
        :return:
        """
        # 加载图片
        image = QImage(image_path)
        # 缩放图片
        image = image.scaled(int(width), safe_int(height))
        # 绘制图片
        painter.drawImage(int(left_top.x), safe_int(left_top.y), image)
        pass
