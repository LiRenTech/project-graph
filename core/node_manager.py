from time import perf_counter_ns

from PyQt5.QtGui import QColor, QPainter

from core.camera import Camera
from core.data_struct.circle import Circle
from core.data_struct.curve import ConnectCurve
from core.data_struct.line import Line
from core.data_struct.number_vector import NumberVector
from core.data_struct.rectangle import Rectangle
from core.entity.entity_node import EntityNode
from core.paint.paint_utils import PainterUtils
from core.paint.paintables import PaintContext


class NodeManager:
    """
    存储并管理所有节点和连接
    节点的增删改、连接断开、移动、渲染等操作都在这里进行
    """

    def __init__(self):
        self.nodes: list[EntityNode] = []

        self._lines: list[Line] = []
        """lines只用于绘制的时候给一个缓存，不参与逻辑运算，只在改变的时候重新计算"""

        self.cursor_node: EntityNode | None = None
        """有一个游标在节点群上移动，这个游标通过上下左右或者点击更改附着的节点"""

        self.grow_node_location: NumberVector | None = None
        """相对于cursor_node的位置，看成一个相对位置矢量，世界坐标格式，用于生长节点"""
        self.grow_node_inner_text: str = ""
        """生长节点的内置文本"""
        pass

    def move_cursor(self, direction: str):
        """
        移动游标，方向为上下左右键
        """
        if self.cursor_node is None:
            # 随机选一个节点作为游标
            if self.nodes:
                self.cursor_node = self.nodes[0]
            return
        # 当前一定 有游标
        if direction == "up":
            # 搜一个距离自己上边缘最近的节点
            min_dist = float("inf")
            min_node = None
            for node in self.nodes:
                if node == self.cursor_node:
                    continue
                if node.body_shape.center.y < self.cursor_node.body_shape.center.y:
                    dist = node.body_shape.bottom_center.distance_to(
                        self.cursor_node.body_shape.top_center
                    )
                    if dist < min_dist:
                        min_dist = dist
                        min_node = node
            if min_node is not None:
                self.cursor_node = min_node
        elif direction == "down":
            # 搜一个距离自己下边缘最近的节点
            min_dist = float("inf")
            min_node = None
            for node in self.nodes:
                if node == self.cursor_node:
                    continue
                if node.body_shape.center.y > self.cursor_node.body_shape.center.y:
                    dist = node.body_shape.top_center.distance_to(
                        self.cursor_node.body_shape.bottom_center
                    )
                    if dist < min_dist:
                        min_dist = dist
                        min_node = node
            if min_node is not None:
                self.cursor_node = min_node
        elif direction == "left":
            # 搜一个距离自己左边缘最近的节点
            min_dist = float("inf")
            min_node = None
            for node in self.nodes:
                if node == self.cursor_node:
                    continue
                if node.body_shape.center.x < self.cursor_node.body_shape.center.x:
                    dist = node.body_shape.right_center.distance_to(
                        self.cursor_node.body_shape.left_center
                    )
                    if dist < min_dist:
                        min_dist = dist
                        min_node = node
            if min_node is not None:
                self.cursor_node = min_node
        elif direction == "right":
            # 搜一个距离自己右边缘最近的节点
            min_dist = float("inf")
            min_node = None
            for node in self.nodes:
                if node == self.cursor_node:
                    continue
                if node.body_shape.center.x > self.cursor_node.body_shape.center.x:
                    dist = node.body_shape.left_center.distance_to(
                        self.cursor_node.body_shape.right_center
                    )
                    if dist < min_dist:
                        min_dist = dist
                        min_node = node
            if min_node is not None:
                self.cursor_node = min_node
        else:
            pass

    def is_grow_node_prepared(self) -> bool:
        """
        是否已经准备好生长节点
        """
        return self.grow_node_location is not None

    def grow_node(self):
        """
        生长节点，按下Tab的时候使用
        """
        if self.cursor_node is None:
            return
        self.grow_node_location = NumberVector(400, 0)
        self.grow_node_inner_text = "New Node"
        pass

    def grow_node_cancel(self):
        """
        生长节点取消
        """
        self.grow_node_location = None
        self.grow_node_inner_text = ""
        pass

    def grow_node_confirm(self):
        """
        生长节点确认，再次按下tab的时候使用
        """
        if self.cursor_node is None:
            return
        if self.grow_node_location is None:
            return
        new_node = self.add_node_by_click(
            self.cursor_node.body_shape.center + self.grow_node_location
        )
        self.connect_node(self.cursor_node, new_node)
        self.grow_node_cancel()

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

    def add_node_by_click(self, location_world: NumberVector) -> EntityNode:
        res = EntityNode(Rectangle(location_world - NumberVector(50, 50), 100, 100))
        self.nodes.append(res)
        return res

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
        self._lines = self._get_all_lines()

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
        for line in self._lines:
            context.painter.paint_curve(ConnectCurve(line.start, line.end))

        context.painter.q_painter().resetTransform()
        # 画游标
        if self.cursor_node is not None:
            PainterUtils.paint_circle(
                context.painter.q_painter(),
                Circle(
                    context.camera.location_world2view(
                        self.cursor_node.body_shape.location_left_top
                    ),
                    15 * context.camera.current_scale,
                ),
                QColor(78, 201, 176),
                QColor(45, 128, 106, 128),
                4 * context.camera.current_scale,
            )
        # 画虚拟的待生长的节点
        if self.grow_node_location is not None and self.cursor_node is not None:
            PainterUtils.paint_circle(
                context.painter.q_painter(),
                Circle(
                    context.camera.location_world2view(
                        self.cursor_node.body_shape.location_left_top
                        + self.grow_node_location
                    ),
                    50 * context.camera.current_scale,
                ),
                QColor(255, 255, 255, 128),
                QColor(255, 255, 255, 128),
                4 * context.camera.current_scale,
            )
            PainterUtils.paint_arrow(
                context.painter.q_painter(),
                context.camera.location_world2view(self.cursor_node.body_shape.center),
                context.camera.location_world2view(
                    self.grow_node_location + self.cursor_node.body_shape.center
                ),
                QColor(23, 159, 255),
                4 * context.camera.current_scale,
                30 * context.camera.current_scale,
            )
