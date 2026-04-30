# PrintBridge PlantUML 图表代码

本文档包含 PrintBridge 开发文档中所有图表的 PlantUML 源代码。

---

## 目录

1. [系统架构图](#1-系统架构图)
2. [色彩实验室模块结构图](#2-色彩实验室模块结构图)
3. [跨媒介预览模块结构图](#3-跨媒介预览模块结构图)
4. [打印适配器模块结构图](#4-打印适配器模块结构图)
5. [知识中心模块结构图](#5-知识中心模块结构图)
6. [核心类图](#6-核心类图)
7. [系统总体流程图](#7-系统总体流程图)
8. [打印检测流程图](#8-打印检测流程图)
9. [色彩实验室用例图](#9-色彩实验室用例图)
10. [跨媒介预览用例图](#10-跨媒介预览用例图)
11. [IPC通信时序图](#11-ipc通信时序图)

---

## 1. 系统架构图

```plantuml
@startuml PrintBridge_系统架构图
!theme plain

package "Main Process" {
  [主进程\n窗口管理] as M1
  [菜单系统] as M2
  [IPC处理器] as M3
}

package "Preload" {
  [预加载脚本\ncontextBridge] as P1
}

package "Renderer" {
  [React应用] as R1
  [色彩实验室] as R2
  [跨媒介预览] as R3
  [打印适配器] as R4
  [知识中心] as R5
  [AI色彩顾问] as R6
}

M1 --> M2
M1 --> M3
M3 <--> P1
P1 --> R1
R1 --> R2
R1 --> R3
R1 --> R4
R1 --> R5
R3 --> R6

@enduml
```

---

## 2. 色彩实验室模块结构图

```plantuml
@startuml PrintBridge_色彩实验室模块结构图
!theme plain

title 色彩实验室模块结构图

class ColorLab {
  +imageData: ImageData
  +viewMode: ViewMode
  +activeProfile: string
  +handleOpenFile()
  +loadImageFromBuffer()
  +analyzeColor()
}

class ProfileSelector {
  +profiles: ICCProfile[]
  +onSelect(profile)
}

class ColorAnalyzer {
  +analysis: ColorAnalysis
  +runAnalysis()
}

class SoftProofPreview {
  +originalImage: ImageData
  +previewImage: ImageData
  +render()
}

ColorLab --> ProfileSelector
ColorLab --> ColorAnalyzer
ColorLab --> SoftProofPreview

@enduml
```

---

## 3. 跨媒介预览模块结构图

```plantuml
@startuml PrintBridge_跨媒介预览模块结构图
!theme plain

title 跨媒介预览模块结构图

class CrossPreview {
  +originalImage: ImageData
  +processedImage: ImageData
  +processingOptions: Options
  +processImage()
}

class SideBySideView {
  +render()
}

class OverlayView {
  +opacity: number
  +render()
}

class ViewingConditionsPanel {
  +lightSource: string
  +paperType: string
  +viewingDistance: number
  +resolution: number
  +updateOptions()
}

class AiAssistant {
  +analyze()
  +getRecommendation()
}

CrossPreview --> SideBySideView
CrossPreview --> OverlayView
CrossPreview --> ViewingConditionsPanel
CrossPreview --> AiAssistant
ViewingConditionsPanel ..> CrossPreview : updates options

@enduml
```

---

## 4. 打印适配器模块结构图

```plantuml
@startuml PrintBridge_打印适配器模块结构图
!theme plain

title 打印适配器模块结构图

class PrintAdapter {
  +problems: Problem[]
  +runCheck()
  +fixProblem()
}

class ProblemList {
  +problems: Problem[]
  +render()
}

class Wizard {
  +currentStep: number
  +totalSteps: number
  +next()
  +prev()
}

class fixActions {
  +fixResolution()
  +fixColorMode()
  +addBleed()
  +fixGamut()
}

PrintAdapter --> ProblemList
PrintAdapter --> Wizard
PrintAdapter --> fixActions

@enduml
```

---

## 5. 知识中心模块结构图

```plantuml
@startuml PrintBridge_知识中心模块
!theme plain

title 知识中心模块结构图

class KnowledgeHub {
  +activeTab: string
  +cases: Case[]
  +demos: Demo[]
  +quizzes: Quiz[]
}

class CaseLibrary {
  +cases: Case[]
  +selectedCase: Case
  +selectCase()
}

class InteractiveDemo {
  +parameters: Object
  +saturation: number
  +contrast: number
  +updateParameter()
}

class Quiz {
  +questions: Question[]
  +currentQuestion: number
  +score: number
  +next()
  +submit()
}

KnowledgeHub --> CaseLibrary
KnowledgeHub --> InteractiveDemo
KnowledgeHub --> Quiz

@enduml
```

---

## 6. 核心类图

```plantuml
@startuml PrintBridge_核心类图
!theme plain

title 核心类图

class ColorStore {
  +activeProfile: string
  +analysis: ColorAnalysis
  +profiles: ICCProfile[]
  +setActiveProfile()
  +setAnalysis()
  +getProfiles()
}

class ProjectStore {
  +originalImage: ImageData
  +processedImage: ImageData
  +processingOptions: Options
  +setOriginalImage()
  +setProcessedImage()
  +updateProcessingOptions()
}

class ColorEngine {
  +profiles: ICCProfile[]
  +getAvailableProfiles()
  +analyzeColor()
  +initializeColorEngine()
  +rgbToCmyk()
  +calculateDeltaE()
}

class ImageProcessor {
  +simulatePrintPreview()
  +processImage()
}

class PrintChecker {
  +checkResolution()
  +checkColorMode()
  +checkBleed()
  +checkGamut()
  +getProblemList()
}

class AiColorAdvisor {
  +apiKey: string
  +analyzeImage()
  +getRecommendation()
}

class useImageProcessorWorker {
  +processImage()
  +isProcessing: boolean
  +error: string
}

ColorEngine ..> ColorStore
ImageProcessor ..> ProjectStore
PrintChecker ..> ProjectStore
AiColorAdvisor ..> ColorStore
AiColorAdvisor ..> ProjectStore
useImageProcessorWorker --> ImageProcessor

@enduml
```

---

## 7. 系统总体流程图

```plantuml
@startuml PrintBridge_系统总体流程图
!theme plain

title 系统总体流程图

start
:启动应用;
:主界面;
if (选择模块) then (色彩实验室)
  :导入图像;
  :选择ICC配置;
  :执行色彩分析;
  :软打样预览;
  :导出结果;
else (跨媒介预览)
  :调整观察条件;
  :生成预览效果;
  :导出结果;
else (打印适配器)
  :运行打印检测;
  if (发现问题?) then (是)
    :运行修复向导;
  endif
  :预览确认;
  :导出印刷;
else (知识中心)
  :学习资源;
  :案例分析;
  :自测测验;
endif
stop

@enduml
```

---

## 8. 打印检测流程图

```plantuml
@startuml PrintBridge_打印检测流程图
!theme plain

title 打印检测流程图

start
:运行打印检测;
:检查分辨率;

if (分辨率 >= 300?) then (是)
  :检查色彩模式;
else (否)
  :标记问题: 分辨率不足;
  :检查色彩模式;
endif

if (色彩模式 = CMYK?) then (是)
  :检查出血区域;
else (否)
  :标记问题: 色彩模式错误;
  :检查出血区域;
endif

if (出血 >= 3mm?) then (是)
  :检查色域;
else (否)
  :标记问题: 出血不足;
  :检查色域;
endif

if (色域在范围内?) then (是)
  :检测通过;
  :显示分数 80-100;
else (否)
  :标记问题: 色域警告;
  :检测通过;
  :显示分数 60-79;
endif

stop

@enduml
```

---

## 9. 色彩实验室用例图

```plantuml
@startuml PrintBridge_色彩实验室用例图
!theme plain

left to right direction

actor 用户 as U

rectangle 色彩实验室 {
  usecase 导入图像 as UC1
  usecase 选择ICC配置 as UC2
  usecase 执行色彩分析 as UC3
  usecase 查看分析结果 as UC4
  usecase 软打样预览 as UC5
  usecase 导出图像 as UC6
}

U --> UC1
U --> UC2
U --> UC3
U --> UC4
U --> UC5
U --> UC6

@enduml
```

---

## 10. 跨媒介预览用例图

```plantuml
@startuml PrintBridge_跨媒介预览用例图
!theme plain

left to right direction

actor 用户 as U

rectangle 跨媒介预览 {
  usecase 选择对比模式 as UC1
  usecase 并排对比 as UC2
  usecase 叠加对比 as UC3
  usecase 调整光源 as UC4
  usecase 调整纸张材质 as UC5
  usecase 调整观察距离 as UC6
  usecase 调整分辨率 as UC7
  usecase 刷新预览 as UC8
  usecase AI色彩分析 as UC9
}

U --> UC1
U --> UC2
U --> UC3
U --> UC4
U --> UC5
U --> UC6
U --> UC7
U --> UC8
U --> UC9

@enduml
```

---

## 11. IPC通信时序图

```plantuml
@startuml PrintBridge_IPC通信时序图
!theme plain

title IPC通信时序图

actor 用户 as U
participant Renderer as R
participant Preload as P
participant Main as M

U -> R : 导入图像
R -> P : openFile(options)
P -> M : ipcRenderer.invoke('dialog:openFile')
M -> M : 显示文件对话框
M -->> P : {filePath, buffer}
P -->> R : {filePath, buffer}
R -> R : 显示图像

U -> R : 调整观察条件
R -> P : processImage(buffer, options)
P -> M : ipcRenderer.invoke('image:process')
M -->> P : processedBuffer
P -->> R : processedBuffer
R -> R : 更新预览

M -> R : menu:import (webContents.send)
R -> P : onMenuAction(callback)
P -> R : callback('import')
R -> R : 触发文件选择

@enduml
```

---

## 使用说明

### 在线编辑器

1. 访问 [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. 粘贴上述代码
3. 点击 "Render" 生成图表
4. 右键保存为 PNG/SVG

### 本地生成

安装 PlantUML 后，使用以下命令：

```bash
# 生成单个图表
plantuml diagram.puml

# 生成所有图表
plantuml *.puml

# 指定输出格式
plantuml -Tpng diagram.puml
plantuml -Tsvg diagram.puml
```

### VS Code 插件

安装 "PlantUML" 插件后：
1. 打开 `.puml` 文件
2. 按 `Alt+D` 预览
3. 按 `Ctrl+Shift+P` → "PlantUML: Export Current Diagram" 导出

---

*文档生成时间: 2026-04-29*