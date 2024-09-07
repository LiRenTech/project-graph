import json
import os
import re

import openai

from project_graph.ai.ai_provider import AIProvider
from project_graph.node_manager.node_manager import NodeManager
from project_graph.settings.setting_service import SETTING_SERVICE


class OpenAIProvider(AIProvider):
    def __init__(self) -> None:
        self.client = openai.OpenAI(
            api_key=SETTING_SERVICE.openai_api_key or os.getenv("OPENAI_API_KEY"),
            base_url=SETTING_SERVICE.openai_api_base or os.getenv("OPENAI_API_BASE"),
        )

    def generate_nodes(
        self, node_manager: NodeManager, model: str = "gpt-4o-mini", *args
    ) -> list[dict]:
        res = self.client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": """\
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
""",
                },
                {"role": "user", "content": self.stringify_nodes(node_manager)},
            ],
        )
        assert res
        print(res)
        content = res.choices[0].message.content
        assert content
        # 移除可能存在的^```json$和^```$
        content = re.sub(r"^```json\n", "", content)
        content = re.sub(r"\n```$", "", content)
        print(content)
        assert content.startswith("[") and content.endswith("]")
        return json.loads(content)
