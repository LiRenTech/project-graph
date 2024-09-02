from project_graph.data_struct.line import Line
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

    def __repr__(self) -> str:
        return f"NodeLink({self.source_node}, {self.target_node})"

    @property
    def body_shape(self) -> Line:
        """临时生成，返回一个身体形状线段"""
        return Line(
            self.source_node.body_shape.center, self.target_node.body_shape.center
        )

    def dump(self) -> dict:
        return {
            "source_node": self.source_node.uuid,
            "target_node": self.target_node.uuid,
            "inner_text": self.inner_text,
        }
