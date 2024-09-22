import os

import openai

from project_graph.ai.ai_provider import AIProvider
from project_graph.node_manager.node_manager import NodeManager
from project_graph.settings.setting_service import SETTING_SERVICE

_SYSTEM_PROMPT = """\
在这个对话中，你需要根据输入、以及当前的标题节点，生成不超过50字的一小段内容

例如你收到标题："KMP算法"

你的回复为
```
KMP算法是一种字符串匹配算法，它利用了字符串的公共前缀来减少比较的工作量。
它的基本思想是：在主串和模式串中，找到最长的公共前缀，然后利用这个公共前缀对主串进行局部匹配，从而减少比较的工作量。
```

"""

_QUESTION_TEMPLATE = """\

{{content}}

---

以上是我写的大纲和一些文本内容

我现在正在打算补充标题为：“{{title}}” 的内容
请帮我补充内容，回答中不要有多余的其他内容。
"""


class OpenAIProviderEditNode(AIProvider):
    """
    简单快速编辑标题节点
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
    ) -> str:
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
        content = content.replace("```", "")
        return content
