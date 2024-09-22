import os

import openai

from project_graph.ai.ai_provider import AIProvider
from project_graph.node_manager.node_manager import NodeManager
from project_graph.settings.setting_service import SETTING_SERVICE

_SYSTEM_PROMPT = """\
在这个对话中，你需要根我的内容来进行归纳总结
"""

_QUESTION_TEMPLATE = """\

{{content}}

---

以上是我写的大纲和一些文本内容

请你帮我总结一下，只给总结内容，不要有其他多余内容
"""


class OpenAIProviderSummarizeAll(AIProvider):
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
