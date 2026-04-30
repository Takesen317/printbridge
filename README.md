# PrintBridge

> 连接数字媒体与印刷工程的桥梁 | Bridging Digital Media and Print Engineering

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-v28.3.3-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6.svg)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/AI-DeepSeek-FF6B6B.svg)](https://www.deepseek.com/)

PrintBridge 是一款基于 AI 技术的跨平台桌面应用，专注于解决数字媒体设计与印刷工程之间的色彩管理难题。

## 核心功能

| 模块 | 功能 | AI 增强 |
|------|------|---------|
| 🎨 **色彩实验室** | ICC配置、RGB/CMYK转换、软打样 | AI 智能推荐配置文件 |
| 👁️ **跨媒介预览** | 多光源模拟、纸张材质预览 | AI 观看条件优化 |
| 🖨️ **智能印刷适配** | 分辨率/色彩模式/出血检测 | AI 问题诊断修复 |
| 📚 **学习资源库** | 案例库、交互演示、自测 | AI 个性化学习路径 |
| 🤖 **AI色彩顾问** | DeepSeek LLM 智能分析 | 深度学习驱动 |

## 技术栈

- **框架**: Electron 28.3.3 + React 18.2.0 + TypeScript 5.3.3
- **构建**: Vite 5 + electron-builder
- **UI**: Ant Design 5 + Zustand 状态管理
- **色彩引擎**: LittleCMS WASM
- **AI**: DeepSeek LLM API

## 快速开始

### 安装使用（便携版）

1. 下载 `PrintBridge-portable.zip`
2. 解压到任意目录
3. 双击 `PrintBridge.exe` 启动

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/your-username/PrintBridge.git
cd PrintBridge

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# Windows 便携版
npm run build:win

# 输出目录: release/win-unpacked/PrintBridge.exe
```

## 项目结构

```
PrintBridge/
├── src/
│   ├── main/           # Electron 主进程
│   ├── preload/       # 预加载脚本
│   ├── renderer/      # React 渲染进程
│   │   ├── modules/   # 功能模块
│   │   ├── services/  # 服务层
│   │   ├── hooks/     # React Hooks
│   │   └── store/     # 状态管理
│   └── shared/        # 共享类型定义
├── docs/              # 文档
│   └── diagrams/     # PlantUML 图表
├── release/           # 构建输出
└── build/             # 应用图标等资源
```

## 比赛材料

| 材料 | 路径 |
|------|------|
| 开发文档（PDF） | `docs/开发文档.pdf` |
| 应用说明书（Word） | `docs/应用说明书.docx` |
| 可执行程序 | `release/PrintBridge-portable.zip` |

## 评分亮点

### 技术技能 (40分)
- ✅ AI 技术应用：DeepSeek LLM 色彩分析
- ✅ 模型/代码质量：TypeScript + 清晰架构
- ✅ 工具使用能力：Electron + React 完整技术栈

### 创新创意 (25分)
- ✅ 方案新颖性：AI + 色彩管理融合
- ✅ 专业融合度：数字媒体 × AI
- ✅ 差异化亮点：智能印刷预检

### 应用价值 (20分)
- ✅ 产业需求：印刷行业色彩管理痛点
- ✅ 落地可行性：桌面应用易于部署
- ✅ 实用效果：降印刷失败率

### 展示与规范 (15分)
- ✅ 路演逻辑清晰：文档完整
- ✅ 材料完整性：代码+文档+演示
- ✅ 团队协作：Git 管理

## 截图预览

| 色彩实验室 | 跨媒介预览 |
|-----------|-----------|
| 智能 ICC 配置选择 | 多光源模拟预览 |
| 智能印刷适配 | 学习资源库 |
| 问题自动检测 | AI 色彩顾问 |

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - UI 库
- [Ant Design](https://ant.design/) - UI 组件库
- [LittleCMS](https://www.littlecms.com/) - 开源色彩管理引擎
- [DeepSeek](https://www.deepseek.com/) - AI 大模型支持

---

**Made with ❤️ for Digital Media & Print Engineering**