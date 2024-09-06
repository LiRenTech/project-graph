from volcenginesdkarkruntime import Ark

from project_graph.node_manager import NodeManager


class Doubao:
    """调用豆包API"""

    def __init__(self) -> None:
        self.ark = Ark(
            base_url="https://ark.cn-beijing.volces.com/api/v3",
        )

    def stringify_nodes(self, node_manager: NodeManager) -> str:
        res = ""
        for node in node_manager.nodes:
            res += (
                f"{'[用户选择了这个节点！]' if node.is_selected else ''}节点id: {node.uuid}\n"
                f"节点位置和大小(x,y,w,h): {node.body_shape}\n"
                f"节点内容: {node.inner_text}\n"
                f"节点详细内容(多行文字，从冒号后开始，到EOF结束): {node.details}\nEOF\n"
                "---\n"
            )
        for link in node_manager.get_all_links():
            res += f"这个对象是一条箭头，从节点id {link.source_node.uuid} 连接到 {link.target_node.uuid}\n箭头上面的文字是 {link.inner_text}\n---\n"
        if res == "":
            res = "没有节点"
        print(res)
        return res

    def generate_node(
        self,
        node_manager: NodeManager,
    ) -> str:
        return (
            self.ark.chat.completions.create(
                model="ep-20240826150107-wkr2r",
                messages=[
                    {
                        "role": "system",
                        "content": """\
请先忘记以前的对话！

---

我想让你充当project-graph应用的AI助手，project-graph是一款绘制节点图、拓扑图和思维导图的工具。

project-graph是由理刃科技团队(LiRen Tech)开发，使用Python和PyQt5编写。github仓库：LiRenTech/project-graph

用户将提供节点和箭头连接信息。你需要**为用户选择的节点**生成后续节点。如果未选择节点，请生成一个新节点。请遵循以下json格式：

```json
[
    {
        "body_shape": {
            "type": "Rectangle",
            "location_left_top": [节点x坐标, 节点y坐标]
        },
        "inner_text": "节点名称",
        "details": "节点内容，多行用$$$分隔，如不需要内容，留空"
    }
]
```

请注意：
- 返回json列表，而非json对象。
- 不添加注释，确保格式正确，无多余空格或换行。
- **只回复json列表，不要添加任何其他内容，包括markdown格式，文字等**。
- 如果用户提问，请回答完整，**不要重复提问内容**。比如用户问“你是谁”，应该回答“我是 Project Graph 的 AI 助手，很高兴为你服务！”
- 节点之间不要间隔太远，避免影响用户阅读。
- 不要重复生成相同的节点，避免影响用户理解。
- 不要重复用户已经创建好的节点。
- **不要重复节点的名称或内容，避免影响用户理解。**
""",
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
