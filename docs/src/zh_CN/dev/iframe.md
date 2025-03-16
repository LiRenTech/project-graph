# iframe 框架

此功能用于在网站中嵌入 Project Graph 文件，而不需要导出 SVG 文件。

## 示例

<Frame :data='{"version":14,"entities":[{"location":[-42.39999961853027,-41],"size":[83.5999984741211,76],"text":"test","uuid":"31f7d34d-b516-4808-ab82-396e8b987526","details":"","color":[0,0,0,0],"type":"core:text_node"}],"associations":[],"tags":[]}' />

::: details 查看代码

```html
<iframe
  src="https://web.project-graph.top/?frame=true&file=eyJ2ZXJzaW9uIjoxNCwiZW50aXRpZXMiOlt7ImxvY2F0aW9uIjpbLTYwLjM5OTk5OTYxODUzMDI3LC02M10sInNpemUiOls4My41OTk5OTg0NzQxMjExLDc2XSwidGV4dCI6InRlc3QiLCJ1dWlkIjoiMGY0N2U4OTMtODc0Ny00ZTA4LTk0NTEtYjQzMWQ4ZGNiMmViIiwiZGV0YWlscyI6IiIsImNvbG9yIjpbMCwwLDAsMF0sInR5cGUiOiJjb3JlOnRleHRfbm9kZSJ9XSwiYXNzb2NpYXRpb25zIjpbXSwidGFncyI6W119"
  frameborder="0"
  width="100%"
  height="400px"
></iframe>
```

:::

## 使用方法

1. 在页面中添加一个 iframe。
2. 将 `src` 设置为 `https://web.project-graph.top/?frame=true&file=[base64]`，其中 `[base64]` 是工程文件的 base64 编码。
