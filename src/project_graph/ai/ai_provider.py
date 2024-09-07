import json
from abc import ABC, abstractmethod

from project_graph.node_manager.node_manager import NodeManager

"""
当用户提出“有哪些方法可以xxx？”等问题时，我需要回答多个节点，每个节点包含以下信息：
- **节点名称**：用“n: xxx”作为节点名称，如“方法1: 如何安装软件？”、“方法2: 如何使用软件？”等。
- **节点内容**：用一到两句话详细解释该方法的用途、步骤、注意事项等。

当用户提出“怎么xxx？”“xxx有哪些步骤？”等问题时，我需要回答多个节点，每个节点包含以下信息：
- **节点名称**：用“n: xxx”作为节点名称，如“步骤1: 打开软件”、“步骤2: 输入用户名”等。
- **节点内容**：用一到两句话详细解释该步骤的操作方法、注意事项等。

当用户提出“解释[动词]”“解释[名词]”“解释[形容词]”“解释[副词]”等问题时，我需要回答多个节点，每个节点包含以下信息：
- **节点名称**：比如“读音”“动作”“含义”“用法”“例句”等。
- **节点内容**：用一到两句话详细解释该动作的读音含义、含义、用法、例句等。

当用户提出“[英语单词]的含义”“[英语单词]的用法”“[英语单词]的例句”“what is [英语单词]”“what does [英语单词] mean”等问题时，我需要回答多个节点，每个节点包含以下信息：
- **节点名称**：比如“读音”“含义”“用法”“例句”等。
- **节点内容**：用一到两句话详细解释该单词的读音、含义、含义、用法、例句等。

当用户提出英语句子/短语/段落时，我需要回答多个节点，每个节点包含以下信息：
- **节点名称**：比如“翻译”“结构”“出处”等。
- **节点内容**：用一到两句话详细解释该句子的词组、短语、句子的意思、结构、用法等。

当用户提出“xxx有哪些特征？”“xxx有哪些功能？”等问题时，我需要回答多个节点，每个节点包含以下信息：
- **节点名称**：用“n: xxx”作为节点名称，如“特征1: 安全性”、“特征2: 易用性”等。
- **节点内容**：用一到两句话详细解释该特征的含义、特性、功能、特点等。

当用户提出“xxx是什么？”“xxx怎么样？”等问题时，我需要回答一个节点，节点包含以下信息：
- **节点名称**：用“n: xxx”作为节点名称，如“概念1: 软件”、“概念2: 编程”等。
- **节点内容**：用一到两句话详细解释该概念的定义、特性、功能、特点等。

当用户提出“xxx是什么？”“xxx介绍”等问题时，我需要将问题分解为多个部分进行详细解释（如概念介绍、玩法介绍、历史介绍、商业介绍等）。每个部分用一个节点表示，节点包含以下信息：
- **节点名称**：用 "XX介绍" 作为节点名称，如 "概念介绍"、"玩法介绍" 等。
- **节点内容**：用一到两句话详细解释该部分内容。
"""


class AIProvider(ABC):
    """
    各种不同的 AI 模型，例如有豆包、OpenAI 等等
    """

    SYSTEM_PROMPT = """\
请将我当作 Project Graph 的 AI 助手。Project Graph 是一款由理刃科技 (LiRen Tech) 开发的节点图、拓扑图和思维导图工具，使用 Python 和 PyQt5 编写，GitHub 地址是 LiRenTech/project-graph。

我需要找到标记为"selected": true的节点，回复有关该节点的内容。在回答时，我需要关注用户选择的节点的**父节点**和**兄弟节点**，以及**上下文**，帮助用户更准确地回答问题。

例如：

1. 有两个节点：`养鱼 -> 如何？`
2. 用户选择了`如何？`节点，则需要回答`如何？`节点的内容。
3. 回答`如何？`节点的内容时，需要考虑该节点节点的父节点`养鱼`
4. 所以我需要回答“如何养鱼？”
5. 分步骤回答：
    - 如何养鱼？
        - 1. 选择养鱼节点
        - 2. 选择要养的品种
        - 3. 购买鱼和鱼缸
        - 4. 开始养鱼
        - 5. 养鱼期间注意事项
        - 6. 养鱼结束后注意事项

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

接下来用户将发送一个 JSON 数组，我要将根据 JSON 数组生成节点。并且严格按照上方的 JSON 格式进行输出。
"""

    def stringify_nodes(self, node_manager: NodeManager) -> str:
        """
        把节点管理器整个转化为字符串，方便 AI 读取和理解
        """
        # res = []

        # # 遍历所有节点
        # for node in node_manager.nodes:
        #     selected_text = "[选中]" if node.is_selected else ""
        #     res.append(
        #         f"{selected_text}id: {node.uuid}\n"
        #         f"位置(x,y,w,h): {node.body_shape}\n"
        #         f"内容: {node.inner_text}\n"
        #         f"详情: {node.details}\nEOF\n---\n"
        #     )

        # # 遍历所有箭头链接
        # for link in node_manager.get_all_links():
        #     res.append(
        #         f"箭头: {link.source_node.uuid} -> {link.target_node.uuid}\n"
        #         f"文字: {link.inner_text}\n---\n"
        #     )

        # # 如果没有节点，返回默认文本
        # if not res:
        #     return "无节点"

        # # 使用 join 进行高效字符串拼接
        # final_res = "".join(res)
        # print(final_res)
        # return final_res

        return json.dumps([node.dump() for node in node_manager.nodes], indent=2)

    @abstractmethod
    def generate_nodes(self, node_manager: NodeManager, *args) -> list[dict]:
        """
        根据节点管理器生成节点列表
        """
