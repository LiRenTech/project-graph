from project_graph.entity.entity_node import EntityNode


class NodeLink:
    """
    连接两个节点的连线
    """

    def __init__(self, source_node: EntityNode, target_node: EntityNode):
        self.source_node = source_node
        self.target_node = target_node

        self.inner_text = ""
        """连线上标注的文本"""

    def __hash__(self) -> int:
        combine_uuid = self.source_node.uuid + self.target_node.uuid
        return hash(combine_uuid)

    def __eq__(self, other: "NodeLink") -> bool:
        return (
            self.source_node == other.source_node
            and self.target_node == other.target_node
        )
