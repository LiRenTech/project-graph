import os

import openai

from project_graph.ai.ai_provider import AIProvider
from project_graph.node_manager.node_manager import NodeManager
from project_graph.settings.setting_service import SETTING_SERVICE

_SYSTEM_PROMPT = """\
在这个对话中，你需要根据输入、以及当前的标题节点，生成若干个多子标题内容节点，每行一个标题内容

例如你收到标题："项目介绍"

你的回复为
```
项目历史介绍
项目背景介绍
项目目标介绍
项目方案介绍
项目实施计划
项目实施进度
项目实施结果
```

"""

_QUESTION_TEMPLATE = """\

{{content}}

---

以上是我写的大纲和一些文本内容

我现在正在打算扩展标题：“{{title}}”
请帮我扩展一些子标题内容，每行一个，回答中不要有多余的其他内容。
"""


class OpenAIProviderFast(AIProvider):
    """
    简单快速扩展节点
    """

    SYSTEM_PROMPT = _SYSTEM_PROMPT

    def __init__(self) -> None:
        self.client = openai.OpenAI(
            api_key=SETTING_SERVICE.openai_api_key or os.getenv("OPENAI_API_KEY"),
            base_url=SETTING_SERVICE.openai_api_base or os.getenv("OPENAI_API_BASE"),
        )

    def generate_question_content(self, node_manager: NodeManager) -> str:
        res = _QUESTION_TEMPLATE
        res = res.replace(
            "{{content}}", node_manager.text_exporter.export_all_node_markdown()
        )

        selected_nodes = [node for node in node_manager.nodes if node.is_selected]
        assert selected_nodes
        res = res.replace("{{title}}", selected_nodes[0].inner_text)

        return res

    def generate_nodes(
        self, node_manager: NodeManager, model: str = "gpt-4o-mini", *args
    ) -> list[str]:
        res = self.client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": self.SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": self.generate_question_content(node_manager),
                },
            ],
        )
        assert res
        print(res)
        content = res.choices[0].message.content
        assert content

        print(f"<{content}>")
        lines = content.split("\n")
        lines = [line.strip() for line in lines if line.strip()]
        
        # 如果有一行 是三个反引号，则去除
        if lines and lines[0].startswith("```") and lines[0].endswith("```"):
            lines = lines[1:]
        # 如果最后一行是三个反引号，则去除
        if lines and lines[-1].startswith("```") and lines[-1].endswith("```"):
            lines = lines[:-1]
        return lines
