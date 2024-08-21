from data_struct.number_vector import NumberVector
from data_struct.rectangle import Rectangle
from entity.entity_node import EntityNode


class NodeManager:
    """管理所有节点"""

    def __init__(self):
        self.nodes: list[EntityNode] = []
        pass

    def add_node_by_click(self, location_world: NumberVector):
        self.nodes.append(
            EntityNode(Rectangle(location_world - NumberVector(50, 50), 100, 100))
        )
