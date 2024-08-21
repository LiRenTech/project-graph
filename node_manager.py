from PyQt5.QtGui import QPainter, QColor

from camera import Camera
from data_struct.line import Line
from data_struct.number_vector import NumberVector
from data_struct.rectangle import Rectangle
from entity.entity_node import EntityNode
from paint.paint_utils import PainterUtils


class NodeManager:
    """管理所有节点"""

    def __init__(self):
        self.nodes: list[EntityNode] = []
        self.lines = {}
        pass

    def add_node_by_click(self, location_world: NumberVector):
        self.nodes.append(
            EntityNode(Rectangle(location_world - NumberVector(50, 50), 100, 100))
        )

    def connect_node(self, from_node: EntityNode, to_node: EntityNode) -> bool:
        if from_node in self.nodes and to_node in self.nodes:
            return from_node.add_child(to_node)
        return False

    def disconnect_node(self, from_node: EntityNode, to_node: EntityNode) -> bool:
        if from_node in self.nodes and to_node in self.nodes:
            return from_node.remove_child(to_node)
        return False

    def paint(self, painter: QPainter, camera: Camera):
        # 画节点本身
        for node in self.nodes:
            node.paint(painter, camera)

            for child in node.children:
                connect_line = Line(node.body_shape.center, child.body_shape.center)
                from_point = node.body_shape.get_line_intersection_point(connect_line)
                to_point = child.body_shape.get_line_intersection_point(connect_line)

                PainterUtils.paint_arrow(
                    painter,
                    camera.location_world2view(from_point),
                    camera.location_world2view(to_point),
                    QColor(255, 255, 255),
                    2 * camera.current_scale,
                    30 * camera.current_scale,
                )
