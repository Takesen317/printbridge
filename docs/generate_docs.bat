# PrintBridge 文档生成脚本
# 使用方法：双击运行此脚本，或在命令行执行 `generate_docs.bat`

@echo off
chcp 65001 >nul
echo 开始生成文档...
node generate_requirements.js
node generate_design.js
echo 文档生成完成！
pause
