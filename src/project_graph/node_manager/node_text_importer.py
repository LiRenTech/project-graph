"""
此类专门负责将缩进的文本转成节点图
"""

import typing

from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.entity.entity_node import EntityNode

if typing.TYPE_CHECKING:
    from .node_manager import NodeManager


class NodeTextImporter:
    """
    大致原理
    1 先解析文本缩进
    2 生成节点和连接他们本身
    3 排列节点位置
    """

    def __init__(self, node_manager: "NodeManager"):
        self.node_manager = node_manager

    def update_node_by_text(self, text: str):
        """
        通过文本
        """
        prepare_nodes = []

        root_node = EntityNode(Rectangle(NumberVector.zero(), 100, 100))
        root_node.inner_text = "Root"

        prepare_nodes.append(root_node)

        stack = [(-1, root_node)]

        print(len(text.split("\n")))
        for i, line in enumerate(text.split("\n")):
            # 空白行跳过
            if line.strip() == "":
                continue

            indent_level, entity_name = self.parse_line(line)
            print(
                f"line {i}: {line}, indent_level: {indent_level}, entity_name: {entity_name}"
            )
            # 新建节点
            node = EntityNode(
                Rectangle(NumberVector(indent_level * 50, (i + 1) * 150), 100, 100)
            )
            node.inner_text = entity_name
            # 放入整体数组
            prepare_nodes.append(node)

            # 准备入栈
            last_node_level, last_node = stack[-1]

            if indent_level > last_node_level:
                # 直接入栈
                stack.append((indent_level, node))
            else:
                # 不停的弹出，直到自己的级别比上一个节点的级别小
                while indent_level <= last_node_level:
                    stack.pop()
                    last_node_level, last_node = stack[-1]

                # 入栈
                stack.append((indent_level, node))
            # 连接节点
            last_node.add_child(node)

        # 循环执行完毕
        self.node_manager.nodes = prepare_nodes
        self.node_manager.update_links()
        pass

    def parse_line(self, line: str) -> tuple[int, str]:
        """
        `ABC`   -> (0, "ABC")
        `    ABC` -> (1, "ABC")
        四个空格是一个缩进
        """
        space_count = 0
        for char in line:
            if char == " ":
                space_count += 1
            if char == "\t":
                space_count += 4
        return space_count // 4, line[space_count:].strip()


"""
A
    B
        C
        D
    E
        F
            G
        H
I
    J
        K
        L
    M
        N
            O
"""
