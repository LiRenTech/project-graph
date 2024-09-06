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

长度限制：
每次增加节点都检测长度，如果长度过长，则去掉头节点

长度限制不能小于等于2
"""

import typing
from typing import Optional

from project_graph.settings.setting_service import SETTING_SERVICE


class ProgressRecordNode:
    """
    双向节点类，用于记录操作过程
    """

    def __init__(
        self,
        current_data: dict,
        next: "Optional[ProgressRecordNode]",
        index: int,
    ):
        """初始化一个头节点"""
        self.current_data = current_data
        self.next = next
        self.prev: "Optional[ProgressRecordNode]" = None

        self.index = index
        """方便知道当前是在第几个节点"""


if typing.TYPE_CHECKING:
    from .node_manager import NodeManager


class NodeProgressRecorder:
    def __init__(self, node_manager: "NodeManager"):
        self.node_manager = node_manager

        self.undo_stack_link = ProgressRecordNode({"nodes": [], "links": []}, None, 0)
        "链表"

        self.current = self.undo_stack_link
        "当前节点"

    def get_current_index(self) -> int:
        return self.current.index

    @property
    def node_count(self) -> int:
        res = 0
        count_current = self.undo_stack_link
        while count_current is not None:
            res += 1
            count_current = count_current.next
        return res

    def reset(self):
        """清空历史记录"""
        self.undo_stack_link = ProgressRecordNode({"nodes": [], "links": []}, None, 0)
        self.current = self.undo_stack_link

    def record(self):
        """
        用户操作一步
        """
        # 注意：如果是在链表中间操作，会截断后面的。todo
        new_node = ProgressRecordNode(
            self.node_manager.dump_all(),
            None,
            self.current.index + 1,
        )
        new_node.prev = self.current

        repeat_node = self.current.next  # 准备被替代的节点（current不是最后一个的情况）

        self.current.next = new_node
        self.current = new_node

        if repeat_node is not None:
            repeat_node.prev = None  # 断开链接，这些部分将被自动垃圾回收
        
        # 超长限制
        if self.node_count > SETTING_SERVICE.history_max_size:
            # 去掉开头一个
            first = self.undo_stack_link
            if first and first.next:
                self.undo_stack_link = first.next
                self.undo_stack_link.prev = None
            pass

    def ctrl_z(self):
        """
        撤销操作
        """
        if self.current.prev is not None:
            self.current = self.current.prev
            self.node_manager.load_from_dict(self.current.current_data)

    def ctrl_shift_z(self):
        """
        取消撤销
        """
        if self.current.next is not None:
            self.current = self.current.next
            self.node_manager.load_from_dict(self.current.current_data)

    def stringify(self):
        link_line = ""
        cur = self.undo_stack_link

        while cur is not None:
            if cur == self.current:
                link_line += f"[{cur.index}] > "
            else:
                link_line += f"{cur.index} > "
            cur = cur.next

        return link_line
