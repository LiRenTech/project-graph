from time import perf_counter_ns

from PyQt5.QtGui import QColor, QPainter

from core.camera import Camera
from core.data_struct.curve import ConnectCurve
from core.data_struct.line import Line
from core.data_struct.number_vector import NumberVector
from core.data_struct.rectangle import Rectangle
from core.entity.entity_node import EntityNode
from core.paint.paint_utils import PainterUtils
from core.paint.paintables import PaintContext


class NodeManager:
    """管理所有节点"""

    def __init__(self):
        self.nodes: list[EntityNode] = []

        self.lines: list[Line] = []
        """lines只用于绘制的时候给一个缓存，不参与逻辑运算，只在改变的时候重新计算"""

        pass

    def dump_all_nodes(self) -> dict:
        """
        将所有节点信息转成字典等可序列化的格式
        {
            "nodes": [
                {
                    body_shape: {
                        "type": "Rectangle",
                        "location_left_top": [x, y],
                        "width": w,
                        "height": h,
                    },
                    inner_text: "text",
                    uuid: "(uuid str)",
                    children: [ "(uuid str)" ]
                },
            ]
        }
        """
        res = {"nodes": [node.dump() for node in self.nodes]}

        return res

    @staticmethod
    def _refresh_all_uuid(data: dict) -> dict:
        """
        刷新所有节点的uuid, 并返回更新后的字典
        刷新的意义是用户可能会重复复制添加一大堆节点内容，防止出现uuid冲突
        """
        from copy import deepcopy
        from uuid import uuid4

        new_data = deepcopy(data)
        for node in new_data["nodes"]:
            # 把每个节点的uuid都改成新的uuid
            old_uuid = node["uuid"]
            new_uuid = str(uuid4())
            node["uuid"] = new_uuid

            for _, other_node in enumerate(new_data["nodes"]):
                if other_node == node:
                    continue
                for j, child_uuid in enumerate(other_node.get("children", [])):
                    if child_uuid == old_uuid:
                        other_node["children"][j] = new_uuid
        return new_data

    def add_from_dict(
        self, data: dict, location_world: NumberVector, refresh_uuid=True
    ):
        """
        从字典等可序列化的格式中添加节点信息
        """
        if refresh_uuid:
            data = self._refresh_all_uuid(data)
        # 开始构建节点本身
        for node_data in data["nodes"]:
            assert isinstance(node_data, dict)

            body_shape_data = node_data["body_shape"]
            if body_shape_data["type"] == "Rectangle":
                body_shape = Rectangle(
                    NumberVector(
                        body_shape_data["location_left_top"][0] + location_world.x,
                        body_shape_data["location_left_top"][1] + location_world.y,
                    ),
                    body_shape_data["width"],
                    body_shape_data["height"],
                )
            else:
                raise ValueError(
                    f"Unsupported body shape type: {body_shape_data['type']}"
                )

            node = EntityNode(body_shape)
            node.inner_text = node_data.get("inner_text", "")

            node.uuid = node_data["uuid"]
            self.nodes.append(node)

        # 构建节点之间的连接关系
        for node_data in data["nodes"]:
            node = self.get_node_by_uuid(node_data["uuid"])
            if node is None:
                continue
            for child_uuid in node_data.get("children", []):
                child = self.get_node_by_uuid(child_uuid)
                if child is None:
                    continue
                node.add_child(child)

        self._update_lines()
        pass

    def load_from_dict(self, data: dict):
        """
        从字典等可序列化的格式中恢复节点信息
        """
        # 先清空原有节点
        self.nodes.clear()
        self.add_from_dict(data, NumberVector(0, 0), refresh_uuid=False)
        self._update_lines()

    def get_node_by_uuid(self, uuid: str) -> EntityNode | None:
        for node in self.nodes:
            if node.uuid == uuid:
                return node
        return None

    def move_node(self, node: EntityNode, d_location: NumberVector):
        node.move(d_location)
        self._update_lines()

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
        self._update_lines()

    def connect_node(self, from_node: EntityNode, to_node: EntityNode) -> bool:
        if from_node in self.nodes and to_node in self.nodes:
            res = from_node.add_child(to_node)
            self._update_lines()
            return res
        return False

    def disconnect_node(self, from_node: EntityNode, to_node: EntityNode) -> bool:
        if from_node in self.nodes and to_node in self.nodes:
            res = from_node.remove_child(to_node)
            self._update_lines()
            return res
        return False

    def _get_all_lines(self) -> list[Line]:
        lines = []
        for node in self.nodes:
            for child in node.children:
                connect_line = Line(node.body_shape.center, child.body_shape.center)
                from_point = node.body_shape.get_line_intersection_point(connect_line)
                to_point = child.body_shape.get_line_intersection_point(connect_line)

                lines.append(Line(from_point, to_point))
        return lines

    def _update_lines(self):
        print("update lines")
        self.lines = self._get_all_lines()

    def get_all_lines_and_node(self) -> list[tuple[Line, EntityNode, EntityNode]]:
        lines = []
        for node in self.nodes:
            for child in node.children:
                connect_line = Line(node.body_shape.center, child.body_shape.center)
                from_point = node.body_shape.get_line_intersection_point(connect_line)
                to_point = child.body_shape.get_line_intersection_point(connect_line)

                lines.append((Line(from_point, to_point), node, child))
        return lines

    def paint(self, context: PaintContext):
        # 画节点本身
        for node in self.nodes:
            node.paint(context)
        # 连线
        context.painter.q_painter().setTransform(
            context.camera.get_world2view_transform()
        )
        for line in self.lines:
            context.painter.paint_curve(ConnectCurve(line.start, line.end))
            # PainterUtils.paint_arrow(
            #     context.painter.q_painter(),
            #     context.camera.location_world2view(line.start),
            #     context.camera.location_world2view(line.end),
            #     QColor(23, 159, 255),
            #     4 * context.camera.current_scale,
            #     30 * context.camera.current_scale,
            # )
        context.painter.q_painter().resetTransform()
