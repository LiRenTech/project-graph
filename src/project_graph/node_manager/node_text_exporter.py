"""
此模块专注于将画面中的节点数据导出为可供AI阅读的文本
以便进行一些提问，分析信息

此类可以看成NodeManager的桥接拓展
"""

import typing

from project_graph.entity.entity_node import EntityNode

if typing.TYPE_CHECKING:
    from .node_manager import NodeManager


class NodeTextExporter:
    def __init__(self, node_manager: "NodeManager"):
        self.node_manager = node_manager

    def export_all_node_text(self) -> str:
        # 找到所有没有父节点的根节点
        return "\n".join(
            [
                self._dfs_1(root_node, 0)
                for root_node in self.node_manager.get_all_root_nodes()
            ]
        )

    @staticmethod
    def _dfs_1(current_node: EntityNode, deep: int) -> str:
        current_line = "\t" * deep + current_node.inner_text
        for child in current_node.children:
            current_line += "\n" + NodeTextExporter._dfs_1(child, deep + 1)
        return current_line

    def export_all_node_markdown(self) -> str:
        """返回所有节点组成的markdown文档"""
        return "\n\n".join(
            [
                self._dfs_2(root_node, 0, root_node.inner_text)
                for root_node in self.node_manager.get_all_root_nodes()
            ]
        )

    def _dfs_2(self, current_node: EntityNode, deep: int, title: str) -> str:
        title_line = NodeTextExporter._get_md_deep_prefix(deep) + title
        content = current_node.details
        markdown_content = f"{title_line}\n\n{content}"

        for child in current_node.children:
            self_to_child_link = self.node_manager.get_link_by_uuid(
                current_node.uuid, child.uuid
            )
            child_title = child.inner_text
            if self_to_child_link and self_to_child_link.inner_text:
                child_title += f" ({self_to_child_link.inner_text})"

            markdown_content += "\n\n" + NodeTextExporter._dfs_2(
                self, child, deep + 1, child_title
            )
        return markdown_content

    @staticmethod
    def _get_md_deep_prefix(deep: int) -> str:
        if deep <= 5:
            return "#" * (deep + 1) + " "
        else:
            # 先摆烂
            return "\t" * (deep - 6)
