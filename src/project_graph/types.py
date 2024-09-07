from typing import Literal, TypedDict

type number = int | float
type SLocation = list[number]


class SBodyShape(TypedDict):
    type: Literal["Rectangle"]
    location_left_top: SLocation
    width: number
    height: number


class SNode(TypedDict):
    body_shape: SBodyShape
    inner_text: str
    details: str
    uuid: str
    children: list[str]


class SLink(TypedDict):
    source_node: str
    target_node: str
    inner_text: str


class SFile(TypedDict):
    version: Literal[2]
    nodes: list[SNode]
    links: list[SLink]
