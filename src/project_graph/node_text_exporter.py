"""
此模块专注于将画面中的节点数据导出为可供AI阅读的文本
以便进行一些提问，分析信息

此类可以看成NodeManager的桥接拓展
"""

import typing

from project_graph.entity.entity_node import EntityNode

if typing.TYPE_CHECKING:
    from project_graph.node_manager import NodeManager


class NodeTextExporter:
    # TODO: 有待增加 带link标记信息的、node详细信息的
    def __init__(self, node_manager: "NodeManager"):
        self.node_manager = node_manager

    def export_all_node_text(self) -> str:
        # 找到所有没有父节点的根节点
        return "\n".join(
            [
                self.dfs_1(root_node, 0)
                for root_node in self.node_manager.get_all_root_nodes()
            ]
        )

    @staticmethod
    def dfs_1(current_node: EntityNode, deep: int) -> str:
        current_line = "\t" * deep + current_node.inner_text
        for child in current_node.children:
            current_line += "\n" + NodeTextExporter.dfs_1(child, deep + 1)
        return current_line
