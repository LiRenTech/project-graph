from pathlib import Path

from PyQt5.QtGui import QColor

from project_graph.app_dir import DATA_DIR
from project_graph.data_struct.circle import Circle
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.entity.entity_node import EntityNode
from project_graph.entity.node_link import NodeLink
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import PaintContext
from project_graph.settings.setting_service import SETTING_SERVICE
from project_graph.settings.style_service import STYLE_SERVICE

from . import node_dict_checker
from .node_progress_recorder import NodeProgressRecorder
from .node_text_exporter import NodeTextExporter
from .node_text_importer import NodeTextImporter


def record_step(method):
    """
    步骤装饰器
    给NodeManager里面涉及到操作的函数加上步骤记录
    """

    def new_method(self: "NodeManager", *args, **kwargs):
        result = method(self, *args, **kwargs)
        self.progress_recorder.record()
        return result

    return new_method


class NodeManager:
    """
    存储并管理所有节点和连接
    节点的增删改、连接断开、移动、渲染等操作都在这里进行

    连线信息目前同时存储两种格式：
    1. node.child表结构【递归、图算法方便】
    2. links集合【连线处理方便】

    能用任意一种结构覆盖更新另一种结构
    """

    def __init__(self):
        self.nodes: list[EntityNode] = []

        self._links: set[NodeLink] = set()
        """连接"""

        self.cursor_node: EntityNode | None = None
        """有一个游标在节点群上移动，这个游标通过上下左右或者点击更改附着的节点"""

        self.grow_node_location: NumberVector | None = None
        """相对于cursor_node的位置，看成一个相对位置矢量，世界坐标格式，用于生长节点"""
        self.grow_node_inner_text: str = ""
        """生长节点的内置文本"""

        self.text_exporter = NodeTextExporter(self)
        """导出纯文本，为AI使用"""

        self.text_importer = NodeTextImporter(self)
        """导入生成图用，方便手机用户"""

        self.progress_recorder = NodeProgressRecorder(self)
        """步骤记录器"""

        self.clone_series: dict = {"nodes": [], "links": []}
        """正在复制，准备粘贴的东西"""
        self.clone_diff_location = NumberVector(0, 0)
        """即将要粘贴的东西"""
        self.press_ctrl_c_location = NumberVector(0, 0)
        """上次按下Ctrl+C的鼠标世界位置"""

        self.file_path = Path(DATA_DIR) / "welcome.json"
        """当前打开的文件路径"""

        # == 初始化 ==
        # 如果没有文件就先保存一个文件
        if not self.file_path.exists():
            self.save_file()
        # 加载默认
        # 在上层 main window调用

        pass

    def save_file(self):
        import json

        with open(self.file_path, "w") as f:
            f.write(json.dumps(self.dump_all(), indent=4))

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

    def rotate_grow_direction(self, is_clockwise: bool):
        """
        旋转生长方向
        是否是顺时针
        """
        if self.grow_node_location is None:
            return
        if is_clockwise:
            self.grow_node_location = self.grow_node_location.rotate(30)
        else:
            self.grow_node_location = self.grow_node_location.rotate(-30)

    def dump_all(self) -> dict:
        """
        将舞台上的东西全部序列化

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
                    details: "",
                    uuid: "(uuid str)",
                    children: [ "(uuid str)" ]
                },
            ],
            "links": [
                {
                    "source_node": "(uuid str)",
                    "target_node": "(uuid str)",
                    "inner_text": "...",
                }
            ]
        }
        """
        res = {
            "nodes": [node.dump() for node in self.nodes],
            "links": [link.dump() for link in self._links],
        }

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
            # 更新连线中的uuid
            for link_dict in new_data.get("links", []):
                if link_dict["source_node"] == old_uuid:
                    link_dict["source_node"] = new_uuid
                if link_dict["target_node"] == old_uuid:
                    link_dict["target_node"] = new_uuid
        return new_data

    def add_from_dict(
        self, data: dict, location_world: NumberVector, refresh_uuid=True
    ):
        """
        从字典等可序列化的格式中添加节点信息
        """
        if refresh_uuid:
            data = self._refresh_all_uuid(data)
        # 先转换
        if not node_dict_checker.validate_dict(data):
            file = node_dict_checker.transform_dict_to_2(data)
            # 以后还可能有其他版本的转换
            # data = ...
        else:
            file = data

        # 开始构建节点本身
        for new_node_dict in file["nodes"]:
            assert isinstance(new_node_dict, dict)

            body_shape_data = new_node_dict["body_shape"]
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
            node.inner_text = new_node_dict.get("inner_text", "")
            node.details = new_node_dict.get("details", "")

            node.uuid = new_node_dict["uuid"]
            self.nodes.append(node)

        # 构建节点之间的连接关系 (根据的是children)
        for new_node_dict in file["nodes"]:
            node = self.get_node_by_uuid(new_node_dict["uuid"])
            if node is None:
                continue
            for child_uuid in new_node_dict.get("children", []):
                child = self.get_node_by_uuid(child_uuid)
                if child is None:
                    continue
                node.add_child(child)
                # 同时也把set里的连接关系也更新一下
                self._links.add(NodeLink(node, child))

        # 补充每个连线上的信息（文字）
        for link_dict in file.get("links", []):
            link = self.get_link_by_uuid(
                link_dict["source_node"], link_dict["target_node"]
            )
            if link is None:
                continue
            link.inner_text = link_dict.get("inner_text", "")

    def load_from_dict(self, data: dict):
        """
        反序列化：从字典等可序列化的格式中恢复节点信息
        会先清空界面内信息
        """
        # 先清空原有节点
        self.nodes.clear()
        self._links.clear()

        self.add_from_dict(data, NumberVector(0, 0), refresh_uuid=False)
        # self.update_links_by_child_map()

    def get_node_by_uuid(self, uuid: str) -> EntityNode | None:
        for node in self.nodes:
            if node.uuid == uuid:
                return node
        return None

    def move_nodes(self, d_location: NumberVector):
        # 不要加步骤记录，因为是每帧实时移动，记录会爆炸
        for node in self.nodes:
            if node.is_selected:
                self._move_node(node, d_location)

    def move_nodes_with_children(self, d_location: NumberVector):
        # 不要加步骤记录，因为是每帧实时移动，记录会爆炸
        for node in self.nodes:
            if node.is_selected:
                self._move_node_with_children(node, d_location)

    @record_step
    def move_finished(self):
        """移动完成，触发一次历史操作存档"""
        # 这里似乎真的什么都不用写
        pass

    @record_step
    def save_a_step(self):
        """一个通用的保存一步的方法，供外部调用"""
        pass

    @record_step
    def pase_cloned_nodes(self):  # todo 可能要加个相对位置参数
        """粘贴复制的节点"""
        self.add_from_dict(
            self.clone_series, self.clone_diff_location, refresh_uuid=True
        )
        self.clone_diff_location = NumberVector.zero()
        # 粘贴之后还要清除掉当前正在选择的东西
        self.clone_series = {"nodes": [], "links": []}

    def copy_part(self, nodes: list[EntityNode]):
        """
        拷贝一部分选中的节点，更新自己的粘贴板属性值 </br>
        注意只能通过选中节点来连带选中一些线条，不能单独拷贝线条
        nodes，传入的时候可以是当前节点的引用，函数内部处理好拷贝
        但拷贝后uuid信息还是相同的，后面注意处理
        """
        # 先清空原有节点
        self.clone_series = {"nodes": [], "links": []}
        for node in nodes:
            if node not in self.nodes:
                continue
            self.clone_series["nodes"].append(node.dump())
            for child in node.children:
                link = self.get_link_by_uuid(node.uuid, child.uuid)
                link_text = link.inner_text if link is not None else ""
                self.clone_series["links"].append(
                    {
                        "source_node": node.uuid,
                        "target_node": child.uuid,
                        "inner_text": link_text,
                    }
                )
        pass

    def _move_node(self, node: EntityNode, d_location: NumberVector):
        """
        移动一个节点（不带动子节点的单独移动）
        """
        node.move(d_location)
        self.collide_dfs(node)

    def _move_node_with_children(self, node: EntityNode, d_location: NumberVector):
        """
        移动一个节点（带动子节点的整体移动）
        """
        self._move_node_with_children_dfs(node, d_location, [node.uuid])

    def _move_node_with_children_dfs(
        self, node: EntityNode, d_location: NumberVector, visited_uuids: list[str]
    ):
        node.move(d_location)
        self.collide_dfs(node)
        for child in node.children:
            if child.uuid in visited_uuids:
                # 防止出现环形连接，导致无限递归
                continue
            self._move_node_with_children_dfs(
                child, d_location, visited_uuids + [node.uuid]
            )

    def collide_dfs(self, self_node: EntityNode):
        """
        self_node 是主体
        这个dfs指的不是子节点递归，是和周围其他节点的碰撞传递
        """
        if not SETTING_SERVICE.is_enable_node_collision:
            return

        for node in self.nodes:
            if node == self_node:
                continue
            if node.body_shape.is_collision(self_node.body_shape):
                self_node.collide_with(node)
                self.collide_dfs(node)

    @record_step
    def edit_links_inner_text(self, links: list[NodeLink], new_text: str):
        for link in links:
            link.inner_text = new_text

    @record_step
    def edit_node_inner_text(self, node: EntityNode, new_text: str):
        node.inner_text = new_text

    @record_step
    def edit_node_details(self, node: EntityNode, new_details: str):
        node.details = new_details

    @record_step
    def add_node_by_click(self, location_world: NumberVector) -> EntityNode:
        res = EntityNode(Rectangle(location_world - NumberVector(50, 50), 100, 100))
        self.nodes.append(res)
        return res

    @record_step
    def delete_node(self, node: EntityNode):
        if node in self.nodes:
            self.nodes.remove(node)
        # 不仅要删除节点本身，其他节点的child中也要删除该节点
        for father_node in self.nodes:
            if node in father_node.children:
                father_node.children.remove(node)
        # 删除所有相关link
        prepare_delete_links = []
        for link in self._links:
            if link.target_node == node or link.source_node == node:
                prepare_delete_links.append(link)
        for link in prepare_delete_links:
            self._links.remove(link)

    @record_step
    def delete_nodes(self, nodes: list[EntityNode]):
        for node in nodes:
            if node in self.nodes:
                self.nodes.remove(node)
            # 不仅要删除节点本身，其他节点的child中也要删除该节点
            for father_node in self.nodes:
                if node in father_node.children:
                    father_node.children.remove(node)

            # 删除所有相关link
            prepare_delete_links = []
            for link in self._links:
                if link.target_node == node or link.source_node == node:
                    prepare_delete_links.append(link)
            for link in prepare_delete_links:
                self._links.remove(link)

        # self.update_links()

    @record_step
    def connect_node(self, from_node: EntityNode, to_node: EntityNode) -> bool:
        if from_node in self.nodes and to_node in self.nodes:
            res = from_node.add_child(to_node)

            new_link = NodeLink(from_node, to_node)
            self._links.add(new_link)

            return res
        return False

    @record_step
    def disconnect_node(self, from_node: EntityNode, to_node: EntityNode) -> bool:
        if from_node in self.nodes and to_node in self.nodes:
            res = from_node.remove_child(to_node)

            link = NodeLink(from_node, to_node)
            if link in self._links:
                self._links.remove(link)
            return res
        return False

    def get_all_links(self) -> list[NodeLink]:
        return [link for link in self._links]

    def get_link_by_uuid(
        self, source_node_uuid: str, target_node_uuid: str
    ) -> NodeLink | None:
        """根据两个节点的uuid获取对应的link"""
        # 其实可以优化成O(1) 但懒了
        for link in self._links:
            if (
                link.source_node.uuid == source_node_uuid
                and link.target_node.uuid == target_node_uuid
            ):
                return link
        return None

    @record_step
    def reverse_links(self, links: list[NodeLink]):
        for link in links:
            from_node, to_node = link.source_node, link.target_node

            self._links.remove(link)
            self._links.add(link.reverse())

            from_node.children.remove(to_node)
            to_node.children.append(from_node)
        pass

    def update_links_by_child_map(self):
        """
        根据nodes的孩子关系表结构重新生成links
        这个会丢失之前的link文字信息
        """
        s = set()
        for node in self.nodes:
            for child in node.children:
                s.add(NodeLink(node, child))
        self._links = s

    def update_child_map_by_links(self):
        """
        根据links重新生成nodes的孩子关系表结构
        """
        # 先清空原有关系
        for node in self.nodes:
            node.children.clear()

        # 再建立新的关系
        for link in self._links:
            link.source_node.children.append(link.target_node)

    @record_step
    def rotate_node(self, node: EntityNode, degrees: float):
        """
        按照一定角度旋转节点，旋转的是连接这个节点的所有子节点
        也就是如果这个节点没有子节点，那么看上去没有效果
        """
        self._rotate_node_dfs(node, node, degrees, [])

    def _rotate_node_dfs(
        self,
        rotate_center_node: EntityNode,
        current_node: EntityNode,
        degrees: float,
        visited_uuids: list[str],
    ):
        rotate_center_location = rotate_center_node.body_shape.center
        # 先旋转自己
        radius = current_node.body_shape.center.distance_to(rotate_center_location)
        center_to_child_vector = (
            current_node.body_shape.center - rotate_center_location
        ).normalize()
        center_to_child_vector = center_to_child_vector.rotate(degrees) * radius
        new_location = rotate_center_location + center_to_child_vector
        current_node.move_to(
            new_location
            - NumberVector(
                current_node.body_shape.width / 2, current_node.body_shape.height / 2
            )
        )
        # 再旋转子节点
        for child in current_node.children:
            if child.uuid in visited_uuids:
                # 防止出现环形连接，导致无限递归
                continue
            self._rotate_node_dfs(
                rotate_center_node, child, degrees, visited_uuids + [current_node.uuid]
            )

    # region 对齐相关

    @record_step
    def align_nodes_row_center(self):
        nodes = [node for node in self.nodes if node.is_selected]
        if not nodes:
            return
        # 计算平均y值

        y_sum = sum(node.body_shape.location_left_top.y for node in nodes)
        y_avg = y_sum / len(nodes)
        # 移动所有节点到平均y值
        for node in nodes:
            node.move_to(NumberVector(node.body_shape.location_left_top.x, y_avg))

    @record_step
    def align_nodes_col_left(self):
        nodes = [node for node in self.nodes if node.is_selected]
        if not nodes:
            return
        # 计算最小x值
        x_min = min(node.body_shape.location_left_top.x for node in nodes)
        # 移动所有节点到最小x值
        for node in nodes:
            node.move_to(NumberVector(x_min, node.body_shape.location_left_top.y))

    @record_step
    def align_nodes_col_right(self):
        nodes = [node for node in self.nodes if node.is_selected]
        if not nodes:
            return
        # 计算最大x值 right()
        x_max = max(node.body_shape.right() for node in nodes)
        # 移动所有节点到最大x值
        for node in nodes:
            node.move_to(
                NumberVector(
                    x_max - node.body_shape.width, node.body_shape.location_left_top.y
                )
            )

    @record_step
    def align_nodes_col_center(self):
        # 竖着中心串串
        nodes = [node for node in self.nodes if node.is_selected]
        if not nodes:
            return
        # 计算平均x值 center.x
        x_sum = sum(node.body_shape.center.x for node in nodes)
        x_avg = x_sum / len(nodes)
        # 移动所有节点到平均x值
        for node in nodes:
            node.move_to(
                NumberVector(
                    x_avg - node.body_shape.width / 2,
                    node.body_shape.location_left_top.y,
                )
            )

    def clear_all(self):
        """重做，历史记录也清空"""
        self.nodes = []
        self._links = set()
        self.progress_recorder.reset()

    # region 画布相关

    def paint(self, context: PaintContext):
        # 画节点本身
        for node in self.nodes:
            node.paint(context)
        for link in self._links:
            link.paint(context)
        # 画游标
        if self.cursor_node is not None:
            margin = 10
            PainterUtils.paint_rect(
                context.painter.q_painter(),
                context.camera.location_world2view(
                    self.cursor_node.body_shape.location_left_top
                    - NumberVector(margin, margin)
                ),
                context.camera.current_scale
                * (self.cursor_node.body_shape.width + margin * 2),
                context.camera.current_scale
                * (self.cursor_node.body_shape.height + margin * 2),
                QColor(255, 255, 255, 0),
                QColor(255, 255, 255, 200),
                int(8 * context.camera.current_scale),
            )
        # 画虚拟的待生长的节点
        if self.grow_node_location is not None and self.cursor_node is not None:
            PainterUtils.paint_circle(
                context.painter.q_painter(),
                Circle(
                    context.camera.location_world2view(
                        self.cursor_node.body_shape.center + self.grow_node_location
                    ),
                    50 * context.camera.current_scale,
                ),
                QColor(255, 255, 255, 0),
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
        # 画正在复制的节点
        if len(self.clone_series["nodes"]) > 0:
            clone_nodes: list[dict] = self.clone_series["nodes"]
            bounding_rect = Rectangle.get_bounding_rectangle(
                [
                    Rectangle(
                        NumberVector(*node["body_shape"]["location_left_top"]),
                        node["body_shape"]["width"],
                        node["body_shape"]["height"],
                    )
                    for node in clone_nodes
                ]
            )
            bounding_rect.location_left_top += self.clone_diff_location

            PainterUtils.paint_rect(
                context.painter.q_painter(),
                context.camera.location_world2view(bounding_rect.location_left_top),
                context.camera.current_scale * bounding_rect.width,
                context.camera.current_scale * bounding_rect.height,
                QColor(0, 0, 0, 0),
                STYLE_SERVICE.style.node_selected_border_color,
                2 * context.camera.current_scale,
            )

    # region 纯和图算法相关

    def get_all_root_nodes(self) -> list[EntityNode]:
        # {node: 当前这个节点是否是根节点}
        node_dict = {node: True for node in self.nodes}
        for node in self.nodes:
            for child in node.children:
                node_dict[child] = False
        return [node for node, is_root in node_dict.items() if is_root]
