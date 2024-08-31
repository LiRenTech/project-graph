from project_graph.entity.entity_node import EntityNode


class NodeLink:
    """
    连接两个节点的连线
    """

    def __init__(self, source_node: EntityNode, target_node: EntityNode):
        self.source_node = source_node
        self.target_node = target_node

        self.inner_text = ""  # 连线上标注的文本
