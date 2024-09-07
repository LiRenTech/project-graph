from project_graph.node_manager.node_manager import NodeManager


class AIProvider:
    def stringify_nodes(self, node_manager: NodeManager) -> str:
        res = []

        # 遍历所有节点
        for node in node_manager.nodes:
            selected_text = "[选中]" if node.is_selected else ""
            res.append(
                f"{selected_text}id: {node.uuid}\n"
                f"位置(x,y,w,h): {node.body_shape}\n"
                f"内容: {node.inner_text}\n"
                f"详情: {node.details}\nEOF\n---\n"
            )

        # 遍历所有箭头链接
        for link in node_manager.get_all_links():
            res.append(
                f"箭头: {link.source_node.uuid} -> {link.target_node.uuid}\n"
                f"文字: {link.inner_text}\n---\n"
            )

        # 如果没有节点，返回默认文本
        if not res:
            return "无节点"

        # 使用 join 进行高效字符串拼接
        final_res = "".join(res)
        print(final_res)
        return final_res

    def generate_nodes(self, node_manager: NodeManager, *args) -> list[dict]: ...
