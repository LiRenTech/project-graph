"""
过程记录器，用于实现撤销和取消撤销的功能
这得是一个双向链表

链表结构
a -> b -> c -> d -> e -> f -> g
                              ^
                              |
                            指针：默认状态下是指向链表最后一个节点
撤销操作：
a -> b -> c -> d -> e -> f -> g
               ^
               |
               相当于指针往前拨

取消撤销操作：
a -> b -> c -> d -> e -> f -> g
                    ^
                    |
                    相当于指针往后拨
                    此时一旦执行操作，后面的f和g就丢掉了，生成一个新的操作节点保存在e后面。

清空历史记录，相当于前面所有节点都丢掉，指针指向链表最后一个节点。
"""

import typing

from project_graph.entity.entity_node import EntityNode
from project_graph.entity.node_link import NodeLink


class StageSnapshot:
    """
    画面快照
    """

    def __init__(self, nodes: list[EntityNode], links: list[NodeLink]):
        self.nodes = nodes
        self.links = links


class ProgressRecordNode:
    """
    双向节点类，用于记录操作过程
    """

    def __init__(self, current_data, next: "ProgressRecordNode | None"):
        """初始化一个头节点"""
        self.current_data = current_data
        self.next = next
        self.prev = None


if typing.TYPE_CHECKING:
    from .node_manager import NodeManager


class NodeProgressRecorder:
    def __init__(self, node_manager: "NodeManager"):
        self.node_manager = node_manager

        self.undo_stack_link = ProgressRecordNode(None, None)
        "链表"

        self.current = self.undo_stack_link
        "当前节点"

    def update_node_manager(
        self,
    ):
        self.node_manager

    def ctrl_z(self):
        """
        撤销操作
        """
        if self.current.prev is not None:
            self.current = self.current.prev
            # self.node_manager.update_node_data(self.current.current_data)
