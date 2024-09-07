"""
给节点自动命名的小引擎
"""

import time
import typing

from project_graph.settings.setting_service import SETTING_SERVICE

if typing.TYPE_CHECKING:
    from .node_manager import NodeManager


class NodeAutoNamer:
    def __init__(self, node_manager: "NodeManager"):
        self.node_manager = node_manager

    def _is_repeated_name(self, name: str) -> bool:
        return any(node.inner_text == name for node in self.node_manager.nodes)

    def get_new_name(self) -> str:
        new_name = SETTING_SERVICE.node_auto_name_template
        print("new_name:", new_name)
        if "{{time}}" in new_name:
            # 添加了时间，替换成 "时:分:秒" 格式
            time_str = time.strftime("%H:%M:%S", time.localtime())
            new_name = new_name.replace("{{time}}", time_str)

        if "{{date}}" in new_name:
            # 添加了日期，替换成 "年-月-日" 格式
            new_name = new_name.replace(
                "{{date}}", time.strftime("%Y-%m-%d", time.localtime())
            )

        if "{{i}}" in new_name:
            # 添加了自动序号
            i = 0
            while True:
                # 无限累加，直到找到一个没有被占用的名字
                new_name_with_i = new_name.replace("{{i}}", str(i))
                if self._is_repeated_name(new_name_with_i):
                    i += 1
                    continue
                break
            new_name = new_name_with_i

        return new_name
