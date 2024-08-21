import traceback

from PyQt5.QtGui import QTransform

from data_struct.number_vector import NumberVector
from data_struct.rectangle import Rectangle


class Camera:
    # 每个方向上的动力矢量大小
    moveAmplitude = 2
    # 摩擦系数，越大摩擦力越大，摩擦力会使速度减慢
    frictionCoefficient = 0.1

    frictionExponent = 1.5

    scaleExponent = 1.1  # 缩放指数，越大缩放速度越快

    SCALE_MAX = 5000
    SCALE_MIN = 0.0000001

    """
    空气摩擦力速度指数
    指数=2，表示 f = -k * v^2
    指数=1，表示 f = -k * v
    指数越大，速度衰减越快
    """

    def __init__(self, location: NumberVector, view_width: float, view_height: float):
        # 相机位置，（世界位置）
        self.location = location

        # 最终地渲染框大小，这两个是在屏幕上的渲染宽度
        self.view_width = view_width
        self.view_height = view_height

        # 大于1表示放大，小于1表示缩小
        self.current_scale = 1.0

        self.target_scale = 1.0

        self.speed = NumberVector(0, 0)
        self.accelerate = NumberVector(0, 0)
        # 可以看成一个九宫格，主要用于处理 w s a d 按键移动，
        self.accelerateCommander = NumberVector(0, 0)
        self.is_scale_animation_open = True

    def reset(self):
        """外界调用，重置相机状态"""
        self.target_scale = 1.0
        self.location = NumberVector(0, 0)

    def set_fast_mode(self):
        self.scaleExponent = 1.5

    def set_slow_mode(self):
        self.scaleExponent = 1.1

    def set_scale_animation(self, is_open: bool):
        self.is_scale_animation_open = is_open

    def reset_view_size(self, view_width: float, view_height: float):
        """
        由于外层渲染区域大小发生变化，需要重新设置相机视野大小
        :param view_width:
        :param view_height:
        :return:
        """
        self.view_width = view_width
        self.view_height = view_height

    def press_move(self, move_vector: NumberVector):
        """

        :param move_vector: 四个方向的 上下左右 单位向量
        :return:
        """
        self.accelerateCommander += move_vector
        self.accelerateCommander = self.accelerateCommander.limit_x(-1, 1)
        self.accelerateCommander = self.accelerateCommander.limit_y(-1, 1)

    def release_move(self, move_vector: NumberVector):
        self.accelerateCommander -= move_vector
        self.accelerateCommander = self.accelerateCommander.limit_x(-1, 1)
        self.accelerateCommander = self.accelerateCommander.limit_y(-1, 1)

    def zoom_in(self):
        if self.is_scale_animation_open:
            self.target_scale *= self.scaleExponent
        else:
            self.current_scale *= self.scaleExponent

    def zoom_out(self):
        if self.is_scale_animation_open:
            self.target_scale /= self.scaleExponent
        else:
            self.current_scale /= self.scaleExponent

    def tick(self):
        try:
            # 计算摩擦力
            friction = NumberVector.zero()
            if not self.speed.is_zero():
                speed_size = self.speed.magnitude()
                friction = (
                        self.speed.normalize()
                        * -1
                        * (self.frictionCoefficient * speed_size ** self.frictionExponent)
                )
            self.speed += self.accelerateCommander * (
                    self.moveAmplitude * (1 / self.current_scale)
            )
            self.speed += friction

            self.location += self.speed

            # 让 current_scale 逐渐靠近 target_scale
            if self.is_scale_animation_open:
                self.current_scale += (self.target_scale - self.current_scale) / 10

            # 彩蛋，《微观尽头》——刘慈欣

            if self.current_scale > self.SCALE_MAX:
                self.current_scale = self.SCALE_MIN * 2
                self.target_scale = self.SCALE_MIN * 2
            elif self.current_scale < self.SCALE_MIN:
                self.current_scale = self.SCALE_MAX - 1
                self.target_scale = self.SCALE_MAX - 1
        except Exception as e:
            traceback.print_exc()
            print(e)

    @property
    def cover_world_rectangle(self) -> Rectangle:
        """
        获取摄像机视野范围内所覆盖住的世界范围矩形
        :return: 返回的矩形是世界坐标下的矩形
        """
        width = self.view_width / self.current_scale
        height = self.view_height / self.current_scale

        return Rectangle(
            NumberVector(self.location.x - width / 2, self.location.y - height / 2),
            width,
            height,
        )

    def location_world2view(self, world_location: NumberVector) -> NumberVector:
        """
        将世界坐标转换成视野渲染坐标
        :param world_location:
        :return:
        """
        diff: NumberVector = NumberVector(self.view_width / 2, self.view_height / 2)
        v: NumberVector = (world_location - self.location) * self.current_scale
        return v + diff

    def location_view2world(self, view_location: NumberVector) -> NumberVector:
        """
        将视野渲染坐标转换成世界坐标
        :param view_location:
        :return:
        """
        v: NumberVector = (
                                  view_location - NumberVector(self.view_width / 2, self.view_height / 2)
                          ) / self.current_scale
        return v + self.location

    def get_world2view_transform(self) -> QTransform:
        q_translate_center = QTransform().translate(-self.location.x, -self.location.y)
        q_sacle = QTransform().scale(self.current_scale, self.current_scale)
        q_translate_offset = QTransform().translate(
            self.view_width / 2, self.view_height / 2
        )
        return q_translate_center * q_sacle * q_translate_offset
