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
        pass

    def add_node_by_click(self, location_world: NumberVector):
        self.nodes.append(
            EntityNode(Rectangle(location_world - NumberVector(50, 50), 100, 100))
        )

    def delete_node(self, node: EntityNode):
        if node in self.nodes:
            self.nodes.remove(node)
        # 不仅要删除节点本身，其他节点的child中也要删除该节点
        for father_node in self.nodes:
            if node in father_node.children:
                father_node.children.remove(node)

    def connect_node(self, from_node: EntityNode, to_node: EntityNode) -> bool:
        if from_node in self.nodes and to_node in self.nodes:
            return from_node.add_child(to_node)
        return False

    def disconnect_node(self, from_node: EntityNode, to_node: EntityNode) -> bool:
        if from_node in self.nodes and to_node in self.nodes:
            return from_node.remove_child(to_node)
        return False

    def get_all_lines(self) -> list[Line]:
        lines = []
        for node in self.nodes:
            for child in node.children:
                connect_line = Line(node.body_shape.center, child.body_shape.center)
                from_point = node.body_shape.get_line_intersection_point(connect_line)
                to_point = child.body_shape.get_line_intersection_point(connect_line)

                lines.append(Line(from_point, to_point))
        return lines

    def get_all_lines_and_node(self) -> list[tuple[Line, EntityNode, EntityNode]]:
        lines = []
        for node in self.nodes:
            for child in node.children:
                connect_line = Line(node.body_shape.center, child.body_shape.center)
                from_point = node.body_shape.get_line_intersection_point(connect_line)
                to_point = child.body_shape.get_line_intersection_point(connect_line)

                lines.append((Line(from_point, to_point), node, child))
        return lines

    def paint(self, painter: QPainter, camera: Camera):
        # 画节点本身
        for node in self.nodes:
            node.paint(painter, camera)

            for line in self.get_all_lines():
                PainterUtils.paint_arrow(
                    painter,
                    camera.location_world2view(line.start),
                    camera.location_world2view(line.end),
                    QColor(255, 255, 255),
                    2 * camera.current_scale,
                    30 * camera.current_scale,
                )
