from abc import ABC
from typing import Callable, List

from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.paint.paintables import Paintable


class Entity(Paintable, ABC):
    """
    实体类
    场景里参与碰撞检测的都算实体
    """

    def __init__(self, body_shape: Rectangle):
        self.body_shape = body_shape

        self.dragging_offset: NumberVector = NumberVector(0, 0)
        """拖拽点相对于原点的偏移，从左上角点指向拖拽点"""

    def move(self, d_location: NumberVector):
        """
        移动实体
        :param d_location:
        :return:
        """
        self.body_shape.location_left_top += d_location

    def move_to(self, location: NumberVector):
        """
        移动实体到指定位置，让实体的左上角顶点对齐到指定位置
        :param location:
        :return:
        """
        self.body_shape.location_left_top = location

    def get_components(self) -> List[Paintable]:
        return []

    def collide_with(self, other: "Entity"):
        # 如果发生了碰撞，则计算两个矩形的几何中心，被撞的矩形按照几何中心连线，根据这个连线继续判断
        self_center_location = self.body_shape.center
        entity_center_location = other.body_shape.center
        # 让它放在及其贴近自己的边缘的位置上。

        # self_center_location -> entity_center_location
        d_distance = entity_center_location - self_center_location
        # fmt: off
        choice_func: list[list[Callable]] = [
            # x < 0  ,         x == 0 ,                x > 0
            [self._move_left_up, self._move_up, self._move_right_up],        # y < 0
            [self._move_left, self._move_down, self._move_right],            # y == 0
            [self._move_left_down, self._move_down, self._move_right_down],    # y > 0
        ]
        # fmt: on

        def number_to_index(x):
            if x < 0:
                return 0
            elif x == 0:
                return 1
            else:
                return 2

        move_strategy = choice_func[number_to_index(d_distance.y)][
            number_to_index(d_distance.x)
        ]
        move_strategy(other)

    # 以下是一些操作
    # _move_xxx 表示被自己挤压的矩形是自己什么方向的矩形
    # 例如 _move_left 表示被挤压的矩形是自己左边的矩形 other表示挤压的矩形

    def _move_right(self, other: "Entity"):
        d_x = self.body_shape.right() - other.body_shape.left()
        other.move(NumberVector(d_x, 0))

    def _move_left(self, other: "Entity"):
        d_x = self.body_shape.left() - other.body_shape.right()
        other.move(NumberVector(d_x, 0))

    def _move_up(self, other: "Entity"):
        d_y = self.body_shape.top() - other.body_shape.bottom()
        other.move(NumberVector(0, d_y))

    def _move_down(self, other: "Entity"):
        d_y = self.body_shape.bottom() - other.body_shape.top()
        other.move(NumberVector(0, d_y))

    # 上面四种非常难做到，因为人手动拖拽很难完全对准，并且又是float类型
    # 所以基本上是矩形的斜向挤压问题
    # 这个时候就要看矩形产生挤压时的重叠部分的 子矩形形状 ，是宽大于高还是高大于宽
    # 怎么看重叠部分的矩形形状？就看两个矩形互相进去的两个角的位置就可以了

    def _move_left_up(self, other: "Entity"):
        w = abs(self.body_shape.left() - other.body_shape.right())
        h = abs(self.body_shape.top() - other.body_shape.bottom())
        if w > h:
            self._move_up(other)
        else:
            self._move_left(other)

    def _move_right_up(self, other: "Entity"):
        w = abs(self.body_shape.right() - other.body_shape.left())
        h = abs(self.body_shape.top() - other.body_shape.bottom())
        if w > h:
            self._move_up(other)
        else:
            self._move_right(other)

    def _move_left_down(self, other: "Entity"):
        w = abs(self.body_shape.left() - other.body_shape.right())
        h = abs(self.body_shape.bottom() - other.body_shape.top())
        if w > h:
            self._move_down(other)
        else:
            self._move_left(other)

    def _move_right_down(self, other: "Entity"):
        w = abs(self.body_shape.right() - other.body_shape.left())
        h = abs(self.body_shape.bottom() - other.body_shape.top())
        if w > h:
            self._move_down(other)
        else:
            self._move_right(other)

    pass
