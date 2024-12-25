# JSON 文档格式

## 规定

JSON 文档中，颜色以数组 `[r, g, b, a]` 的形式存储。

## v1

此版本为最初版本（即发布第一个视频时的版本），不包含 `version` 字段，支持存储节点和边的基本信息。

## v2

此版本增加了 `version` 字段，支持存储节点详细信息以及线段上的文字。

## v3

此版本重命名了很多字段，使其更加简短易懂。

- `node.body_shape` -> `node.shape`
- `node.shape.location_left_top` -> `node.shape.location`
- `node.shape.width` `node.shape.height` -> `node.shape.size`
- `node.inner_text` -> `node.text`
- `links` -> `edges`
- `edge.source_node` -> `edge.source`
- `edge.target_node` -> `edge.target`
- `edge.inner_text` -> `edge.text`

> [!TIP]
> 由于 littlefean 修改了 v2-v3 的转换函数，让转换时会重命名一个不存在的字段，v3 文档中的自定义颜色节点全部报废，此问题已经修复，提醒开发者不要修改已经写好的转换函数！

## v4

支持节点颜色，并且重命名了字段。

- `node.shape.location` -> `node.location`
- `node.shape.size` -> `node.size`
