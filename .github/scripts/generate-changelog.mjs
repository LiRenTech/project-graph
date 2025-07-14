/* eslint-disable */
import { execSync } from "child_process";

// 获取最近一次发布的标签
const lastRelease = execSync(
  "git for-each-ref --sort=-creatordate --format='%(refname:short)' \"refs/tags/v*\" | head -n 1",
)
  .toString()
  .trim();

// 获取 Git 提交记录
const commits = execSync(`git log ${lastRelease}.. --pretty=format:"%s" --reverse`).toString().trim();

// 定义提示信息
const prompt = `**请根据以下规则处理提交历史：**
1. 输入：多行git提交消息（每行一个commit）
2. 处理要求：
   - 移除所有技术前缀（"feat:", "fix:", "perf:"等）
   - 严格过滤与用户体验无关的内容：
     ▸ 开发体验优化（如构建工具、CI配置、测试用例）
     ▸ 内部重构/代码风格调整
     ▸ 依赖库更新（除非影响功能）
     ▸ 赞助/版权信息
     ▸ 文档更新（除非是用户可见的文案）
   - 只保留用户可感知的变更：
     ✅ 新功能/功能改进
     ✅ 界面交互优化
     ✅ 崩溃/关键问题修复
     ✅ 性能优化（影响使用流畅度）
     ✅ 用户可见的文案调整
3. 输出要求：
   - 生成**单段流畅中文描述**（无分类标题）
   - 以“本次更新”开头，用自然过渡词连接（如“新增了”、“优化了”、“同时修复了”）
   - 突出核心价值，技术细节转口语化（如"优化渲染逻辑"→"提升页面加载速度"）
   - 结尾不加句号

**过滤示例：**
× 移除内容 → "chore: 更新webpack配置"  
                  "docs: 修改API注释"  
                  "添加赞助二维码"  
                  "perf: 减少测试用例运行时间"  
√ 保留内容 → "feat: 新增深色模式"  
                  "fix: 解决图片上传失败问题"  
                  "perf: 降低内存占用30%"

**输入示例：**
feat: 支持PNG格式导出
fix: 修复导出时崩溃问题
perf: 优化渲染性能
chore: 更新测试框架
docs: 添加开发者指南

**输出示例：**
本次更新新增了PNG格式导出功能，优化了渲染性能使操作更流畅，同时修复了导出时可能发生的崩溃问题

**您的提交历史：**
[粘贴git提交消息]`;

// 发送请求到 API
const response = fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=" +
    process.env.GEMINI_API_KEY,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
        {
          role: "model",
          parts: [{ text: "好的！请提供 Git 提交历史记录，我会帮你整理成 Changelog。" }],
        },
        {
          role: "user",
          parts: [{ text: commits }],
        },
      ],
      generationConfig: {
        temperature: 1.1,
        maxOutputTokens: 1000,
        topP: 1.0,
        topK: 1,
      },
    }),
  },
);

response
  .then((res) => res.json())
  .then((data) => {
    const changelog = data.candidates[0].content.parts[0].text;
    const finalChangelog = `${changelog}
`;
    console.log(finalChangelog);
  })
  .catch((err) => {
    console.error(err);
  });
