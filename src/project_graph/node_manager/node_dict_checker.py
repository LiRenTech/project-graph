"""
数据格式校验器
不但会检验格式，发现格式不匹配还会尝试转换修正（版本不同导致的兼容性问题）

这个文件里全是工具函数，建议直接导入模块，不要拆碎导入函数
"""

from project_graph.types import SFile


def validate_dict(data: dict) -> bool:
    """
    校验节点字典是否符合要求
    校验的是：最终舞台序列化的信息
    """
    try:
        assert isinstance(data, dict)
        # 节点
        assert isinstance(data.get("nodes"), list)
        for i in data["nodes"]:
            validate_node_dict(i)
        # 连接线
        assert isinstance(data.get("links"), list)
        for i in data["links"]:
            validate_links_dict(i)
        return True
    except AssertionError:
        return False


def validate_node_dict(data: dict) -> bool:
    """
    校验节点字典是否符合要求
    校验的是：单个节点序列化的信息
    """
    try:
        assert isinstance(data, dict)
        assert isinstance(data.get("body_shape"), dict)
        assert isinstance(data["body_shape"].get("type"), str)
        assert isinstance(data["body_shape"].get("location_left_top"), list)
        assert len(data["body_shape"]["location_left_top"]) == 2
        assert isinstance(data["body_shape"].get("width"), (int, float))
        assert isinstance(data["body_shape"].get("height"), (int, float))
        assert isinstance(data.get("inner_text"), str)
        assert isinstance(data.get("details"), str)
        assert isinstance(data.get("uuid"), str)
        assert isinstance(data.get("children"), list)
        for child_uuid in data.get("children", []):
            assert isinstance(child_uuid, str)
        return True
    except AssertionError:
        return False


def validate_links_dict(data: dict) -> bool:
    """
    校验连接线字典是否符合要求
    校验的是：单条连接线序列化的信息
    """
    try:
        assert isinstance(data, dict)
        assert isinstance(data.get("source_node"), str)
        assert isinstance(data.get("target_node"), str)
        assert isinstance(data.get("inner_text"), str)
        return True
    except AssertionError:
        return False


def transform_dict_to_2(data: dict) -> SFile:
    """
    1 -> 2 版本兼容性转换
    2024-09-07
    """
    if "version" in data:
        # 如果有version字段，说明版本>=2，不需要转换
        return SFile(**data)
    data["version"] = 2
    if "nodes" not in data:
        data["nodes"] = []
    if "links" not in data:
        data["links"] = []

    for node in data.get("nodes", []):
        if "details" not in node:
            node["details"] = ""
        if "inner_text" not in node:
            node["inner_text"] = ""
        if "children" not in node:
            node["children"] = []
        # uuid没了那就真废了
        if "uuid" not in node:
            raise TypeError("节点缺少uuid字段")
    for link in data.get("links", []):
        if "inner_text" not in link:
            link["inner_text"] = ""
    return SFile(**data)
