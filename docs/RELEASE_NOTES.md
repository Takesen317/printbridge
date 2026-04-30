# PrintBridge v1.0.0 发布说明

## 📦 下载文件

| 文件 | 大小 | SHA-256 校验和 |
|------|------|---------------|
| `PrintBridge-portable.zip` | 131 MB | 请在发布页面查看 |

## 🚀 安装说明

1. 下载 `PrintBridge-portable.zip`
2. 解压到任意文件夹
3. 双击 `PrintBridge.exe` 运行

## ✅ 系统要求

- Windows 10/11 x64
- 内存：最低 4GB，推荐 8GB
- WebView2（Windows 10 自带）

## 🎯 核心功能

- 🎨 **色彩实验室**：ICC配置选择、RGB/CMYK转换、软打样
- 👁️ **跨媒介预览**：多光源模拟（D50/D65/F）
- 🖨️ **智能印刷适配**：分辨率/色彩模式/出血/色域检测
- 📚 **学习资源库**：案例库、交互演示、自测题
- 🤖 **AI色彩顾问**：DeepSeek LLM 智能分析

## 📄 文档

- `docs/开发文档.pdf` - 开发文档
- `docs/应用说明书.docx` - 应用说明书

## 🛠️ 从源码构建

```bash
git clone https://github.com/Takesen317/printbridge.git
cd printbridge
npm install
npm run build:win
# 输出: release/PrintBridge-portable.zip
```

## 🔧 技术栈

- Electron 28.3.3
- React 18.2.0
- TypeScript 5.3.3
- Ant Design 5
- LittleCMS WASM

## 📝 许可证

MIT License