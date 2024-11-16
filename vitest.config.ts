import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 配置测试环境
    environment: 'jsdom',  // 环境, node 或 jsdom
    // 全局设置
    globals: true,
    include: ["src/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // 设置覆盖率报告
    // coverage: {
    //   provider: 'c8',
    //   reporter: ['text', 'json', 'html']
    // },
    // 其他配置选项
  }
});