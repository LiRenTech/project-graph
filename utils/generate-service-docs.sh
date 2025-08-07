#!/bin/bash
set -e

model="gemini-2.5-flash"
out="./docs/content/docs/core/services"
mkdir -p "$out"

for file in $(grep -rl "^@service" app/src/core); do
  relative=${file#app/src/core/}
  relative="app/src/core/$relative"
  service=$(grep -oP '@service\("\K[^"]+(?="\))' "$file")
  service=$(echo "$service" | sed -E 's/([a-z0-9])([A-Z])/\1-\L\2/g' | tr '[:upper:]' '[:lower:]')

  doc="$out/$service.zh-CN.mdx"
  [[ -e $doc ]] && { echo "$(tput setaf 3)文件 $doc 已存在，跳过"; continue; }

  prompt=$(cat <<EOF
下面是一段 TypeScript 源码。请完成三件事，用三行“---”作为分隔符输出：

1. 用中文概述这个服务的用途，要求同以前（不要称“类”，分段，善用标题，不要一级标题，API 方法也要标题）。
2. 给这个服务起一个 lucide 的大驼峰图标名。
3. 把服务原始大驼峰名翻译成中文，格式：“[原文的大驼峰形式][空格][译文]”。

不要输出多余的解释或空白。

example:
用于管理用户会话，跟踪登录状态与权限……

## API

### \`login(userId: string): Promise<void>\`

……

### \`logout(): Promise<void>\`

……
---
UserCog
---
UserService 用户服务
end example.

---
$(cat "$file")
EOF
  )

  tput setaf 4
  echo "正在生成 $service.zh-CN.mdx, $relative"
  tput setaf 8

  # 一次请求拿到三段
  raw=$(gemini -p "$prompt" -m "$model")

  # 用 awk 按 "---" 拆分
  doc_body=$(echo "$raw" | awk -v RS='---' 'NR==1{print; exit}')
  icon=$(echo      "$raw" | awk -v RS='---' 'NR==2{gsub(/[[:space:]]/, ""); print}')
  title=$(echo     "$raw" | awk -v RS='---' 'NR==3{gsub(/^[[:space:]]+|[[:space:]]+$/, ""); print}')

  tput setaf 2
  echo "标题: $title"
  echo "图标: $icon"

  cat > "$doc" <<EOF
---
title: $title
icon: $icon
relatedFile: $relative
---

$doc_body
EOF
done