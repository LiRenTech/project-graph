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
                    "content": self.SYSTEM_PROMPT,
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
