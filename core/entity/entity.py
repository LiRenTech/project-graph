from abc import ABC
from typing import List

from core.data_struct.number_vector import NumberVector
from core.data_struct.rectangle import Rectangle
from core.paint.paintables import Paintable


class Entity(Paintable, ABC):
    """
    实体类
    场景里参与碰撞检测的都算实体
    """

    def __init__(self, body_shape: Rectangle):
        self.body_shape = body_shape

        # 拖拽点相对于原点的偏移，从左上角点指向拖拽点
        self.dragging_offset: NumberVector = NumberVector(0, 0)

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
