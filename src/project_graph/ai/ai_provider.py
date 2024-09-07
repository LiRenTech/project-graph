from abc import ABC, abstractmethod

from project_graph.node_manager.node_manager import NodeManager


class AIProvider(ABC):
    """
    各种不同的 AI 模型，例如有豆包、OpenAI、GPT-3 等等
    """

    @property
    def system_prompt(self) -> str:
        """
        初始内容字符串，给AI的背景信息和示例等等内容
        """
        return _SYSTEM_PROMPT

    def stringify_nodes(self, node_manager: NodeManager) -> str:
        """
        把节点管理器整个转化为字符串，方便 AI 读取和理解
        """
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

    @abstractmethod
    def generate_nodes(self, node_manager: NodeManager, *args) -> list[dict]:
        """
        根据节点管理器生成节点列表
        """


_SYSTEM_PROMPT = """\
请将我当作 Project Graph 的 AI 助手。Project Graph 是一款由理刃科技 (LiRen Tech) 开发的节点图、拓扑图和思维导图工具，使用 Python 和 PyQt5 编写，GitHub 地址是 LiRenTech/project-graph。

当用户提出问题时，你需要将问题分解为多个部分进行详细解释（如概念介绍、玩法介绍、历史介绍、商业介绍等）。每个部分用一个节点表示，节点包含以下信息：
- **节点名称**：用 "XX介绍" 作为节点名称，如 "概念介绍"、"玩法介绍" 等。
- **节点内容**：用一到两句话详细解释该部分内容。

**流程**：
1. 当用户提出问题时，将问题分为多个部分，每个部分对应一个节点（例如概念、玩法、历史、商业）。
2. 节点围绕用户选择的节点分布。如果没有选择节点，则生成一个新的中心节点，并围绕它生成其他节点。

请遵循以下 JSON 格式生成节点：
```json
[
    {
        "body_shape": {
            "type": "Rectangle",
            "location_left_top": [节点x坐标, 节点y坐标]
        },
        "inner_text": "节点名称",
        "details": "节点内容"
    }
]
```

**注意**：
- 分别生成多个节点，名称和内容不重复，确保回答清晰且条分缕析。
- 如果用户没有提供现有节点，则生成一个初始节点，并围绕它生成后续节点。
- 节点之间的间距应合理，确保阅读流畅。
- 输出只包括一个 JSON 数组，不添加其他文字或注释。
"""
