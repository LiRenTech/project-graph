import json
import os

from volcenginesdkarkruntime import Ark

from project_graph.ai.ai_provider import AIProvider
from project_graph.node_manager import NodeManager
from project_graph.settings.setting_service import SETTING_SERVICE


class DoubaoProvider(AIProvider):
    """调用豆包API"""

    def __init__(self) -> None:
        self.ark = Ark(
            api_key=SETTING_SERVICE.ark_api_key or os.getenv("ARK_API_KEY"),
            base_url="https://ark.cn-beijing.volces.com/api/v3",
        )

    def generate_nodes(self, node_manager: NodeManager, *args) -> list[dict]:
        return json.loads(
            self.ark.chat.completions.create(
                model="ep-20240826150107-wkr2r",
                # https://medium.com/@1511425435311/understanding-openais-temperature-and-top-p-parameters-in-language-models-d2066504684f
                temperature=1,
                top_p=0.9,
                messages=[
                    {
                        "role": "system",
                        "content": self.SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": self.stringify_nodes(node_manager),
                    },
                ],
            )
            .choices[0]  # type: ignore
            .message.content
        )
