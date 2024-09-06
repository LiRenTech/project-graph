import typing

from project_graph.entity.entity_node import EntityNode
from project_graph.entity.node_link import NodeLink

if typing.TYPE_CHECKING:
    from .node_manager import NodeManager


class ProgressSnapshot:
    """
    过程画面快照
    """

    def __init__(self, nodes: list[EntityNode], links: set[NodeLink]):
        """
        传入的Node和Link必须单独再拷贝一份
        以防在链表上后面的节点画面中引用的是同一个
        """
        self.nodes = [node.clone() for node in nodes]
        # self.links = set()
        # 建立 children
        for i, father in enumerate(nodes):
            for j, child in enumerate(father.children):
                if child in father.children:
                    # father -> child
                    # self.links.add(NodeLink(self.nodes[i], self.nodes[j]))

                    self.nodes[i].children.append(self.nodes[j])

        self.links = {link.clone() for link in links}

        # link 的uuid算是复制了一份，但引用的两个node还是原来的，需重新比对
        for link in self.links:
            for i, node in enumerate(self.nodes):
                if link.source_node.uuid == node.uuid:
                    link.source_node = node
                if link.target_node.uuid == node.uuid:
                    link.target_node = node

    @staticmethod
    def get_empty_snapshot():
        return ProgressSnapshot([], set())

    @staticmethod
    def get_snapshot(node_manager: "NodeManager"):
        """
        将节点管理器中的东西，深度拷贝一份，返回快照
        """
        return ProgressSnapshot(node_manager.nodes, node_manager._links)
