const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageBreak, PageNumber } = require('docx');
const fs = require('fs');
const path = require('path');

// Create border style
const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };

// A4 page size (DXA)
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN = 1440; // 1 inch
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// Load image helper
function loadImage(filename) {
  const imgPath = path.join(__dirname, 'diagrams', filename);
  if (fs.existsSync(imgPath)) {
    return fs.readFileSync(imgPath);
  }
  return null;
}

function createCell(text, width, isHeader = false) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: isHeader ? { fill: "D9D9D9", type: ShadingType.CLEAR } : { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: isHeader, size: 22 })]
    })]
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: options.size || 22, bold: options.bold || false })],
    spacing: { after: options.spacingAfter || 200 }
  });
}

function createHeading(text, level) {
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text, bold: true })],
    spacing: { before: 400, after: 200 }
  });
}

function createImageParagraph(filename, width, height, caption) {
  const imgData = loadImage(filename);
  if (!imgData) {
    return new Paragraph({
      children: [new TextRun({ text: `[${caption} - 图片未找到]`, italics: true, color: "999999" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 }
    });
  }

  return new Paragraph({
    children: [
      new ImageRun({
        type: "png",
        data: imgData,
        transformation: { width, height },
        altText: { title: caption, description: caption, name: caption }
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 }
  });
}

function createCaption(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 20 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 300 }
  });
}

// ========== Requirements Specification Document ==========

const requirementsDoc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: "PrintBridge 需求规格说明书", size: 18, color: "666666" })],
          alignment: AlignmentType.RIGHT
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "第 ", size: 18 }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
            new TextRun({ text: " 页", size: 18 })
          ],
          alignment: AlignmentType.CENTER
        })]
      })
    },
    children: [
      // Cover
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({
        children: [new TextRun({ text: "PrintBridge", bold: true, size: 72 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({ text: "需求规格说明书", bold: true, size: 48 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      }),
      // Document info
      new Paragraph({ spacing: { before: 800 } }),
      new Paragraph({
        children: [new TextRun({ text: "姓名：王沛森", size: 28 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ spacing: { before: 200 } }),
      new Paragraph({
        children: [new TextRun({ text: "指导老师：钟云飞", size: 28 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ spacing: { before: 200 } }),
      new Paragraph({
        children: [new TextRun({ text: "版本：v1.1", size: 28 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ spacing: { before: 200 } }),
      new Paragraph({
        children: [new TextRun({ text: "项目编号：PB-EDU-2026-01", size: 28 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // Table of Contents
      createHeading("目录", HeadingLevel.HEADING_1),
      createParagraph("1 概述", { bold: true }),
      createParagraph("1.1 用户简介", { spacingAfter: 100 }),
      createParagraph("1.1.1 游客", { spacingAfter: 100 }),
      createParagraph("1.1.2 用户", { spacingAfter: 100 }),
      createParagraph("1.1.3 管理员", { spacingAfter: 100 }),
      createParagraph("1.2 项目目的与目标", { bold: true }),
      createParagraph("1.2.1 项目目的", { spacingAfter: 100 }),
      createParagraph("1.2.2 项目目标", { spacingAfter: 100 }),
      createParagraph("1.3 术语定义", { bold: true, spacingAfter: 100 }),
      createParagraph("1.4 参考资料", { bold: true, spacingAfter: 100 }),
      createParagraph("1.5 相关文档", { bold: true, spacingAfter: 100 }),
      createParagraph("2 目标系统描述", { bold: true }),
      createParagraph("2.1 角色定义", { bold: true, spacingAfter: 100 }),
      createParagraph("2.2 业务流程", { bold: true }),
      createParagraph("2.2.1 网站总体工作图", { spacingAfter: 100 }),
      createParagraph("2.2.2 用户导入图像流程", { spacingAfter: 100 }),
      createParagraph("2.2.3 色彩分析流程", { spacingAfter: 100 }),
      createParagraph("2.2.4 跨媒介预览流程", { spacingAfter: 100 }),
      createParagraph("3 总体功能需求", { bold: true }),
      createParagraph("3.1 总体功能", { bold: true, spacingAfter: 100 }),
      createParagraph("3.2 用例图形式分析", { bold: true }),
      createParagraph("3.2.1 登录注册及个人信息维护", { spacingAfter: 100 }),
      createParagraph("3.2.2 色彩实验室系统", { spacingAfter: 100 }),
      createParagraph("3.2.3 跨媒介预览系统", { spacingAfter: 100 }),
      createParagraph("3.2.4 打印适配系统", { spacingAfter: 100 }),
      createParagraph("3.2.5 知识中心系统", { spacingAfter: 100 }),
      createParagraph("3.3 类图", { bold: true, spacingAfter: 100 }),
      createParagraph("4 系统性能需求", { bold: true, spacingAfter: 100 }),
      createParagraph("5 目标系统界面与接口需求", { bold: true }),
      createParagraph("5.1 界面需求", { spacingAfter: 100 }),
      createParagraph("5.2 页面设计", { spacingAfter: 100 }),
      createParagraph("5.3 接口需求", { spacingAfter: 100 }),
      createParagraph("6 系统其他需求", { bold: true }),
      createParagraph("6.1 安全性", { spacingAfter: 100 }),
      createParagraph("6.2 可靠性", { spacingAfter: 100 }),
      createParagraph("6.3 灵活性", { spacingAfter: 100 }),

      // Chapter 1
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("1 概述", HeadingLevel.HEADING_1),

      createHeading("1.1 用户简介", HeadingLevel.HEADING_2),
      createParagraph("本 PrintBridge 跨媒介预览系统的最终用户是有意愿使用本系统进行色彩管理和打印预览的用户，使用者主要有普通用户和管理员两种。"),

      createHeading("1.1.1 游客", HeadingLevel.HEADING_3),
      createParagraph("在实际操作中，未导入图像的用户。游客可以浏览知识中心的内容，查看案例库和参与测验，但无法使用色彩分析和打印预览功能。"),

      createHeading("1.1.2 用户", HeadingLevel.HEADING_3),
      createParagraph("在实际操作中，已导入图像的用户。用户可使用导入的图像进行色彩分析、跨媒介预览、打印问题检测等核心功能。"),

      createHeading("1.1.3 管理员", HeadingLevel.HEADING_3),
      createParagraph("在实际操作中，拥有系统管理权限的账号。管理员可以管理系统配置和维护系统运行状态。"),

      createHeading("1.2 项目目的与目标", HeadingLevel.HEADING_2),

      createHeading("1.2.1 项目目的", HeadingLevel.HEADING_3),
      createParagraph("PrintBridge 是一款连接数字媒体设计与印刷工程的跨平台桌面应用。它帮助学生和专业人士理解色彩管理和印刷工作流程，提供从屏幕显示到印刷输出的完整色彩模拟预览功能。"),
      createParagraph("随着数字内容创作的普及，创作者面临一个核心问题：屏幕上看到的颜色与实际印刷输出的颜色存在差异。PrintBridge 通过软打样技术和跨媒介预览功能，帮助用户在创作阶段就能预见最终的印刷效果。"),

      createHeading("1.2.2 项目目标", HeadingLevel.HEADING_3),
      createParagraph("a. 提供准确的 RGB 到 CMYK 色彩转换功能"),
      createParagraph("b. 模拟不同纸张材质和光源条件下的印刷效果"),
      createParagraph("c. 检测并提示潜在的打印问题"),
      createParagraph("d. 提供交互式的色彩管理和印刷知识学习平台"),
      createParagraph("e. 整个系统可以稳定运行"),

      createHeading("1.3 术语定义", HeadingLevel.HEADING_2),
      createParagraph("[1] ICC配置文件：国际色彩联盟制定的色彩管理系统标准，用于描述设备色彩空间"),
      createParagraph("[2] 软打样（Soft Proofing）：在显示器上模拟图像在不同输出设备上的效果"),
      createParagraph("[3] 色域（Color Gamut）：色彩空间包含的颜色范围"),
      createParagraph("[4] ΔE：表示两种颜色之间差异的度量值"),
      createParagraph("[5] CMYK：青、品红、黄、黑四色油墨色彩模型"),

      createHeading("1.4 参考资料", HeadingLevel.HEADING_2),
      createParagraph("[1] 吕云翔. 软件工程——理论与实践[M]. 人民邮电出版社, 2020."),
      createParagraph("[2] Pressman R S. 软件工程: 实践者的研究方法(英文精编版)[M]. 机械工业出版社, 2019."),

      createHeading("1.5 相关文档", HeadingLevel.HEADING_2),
      createParagraph("[1] 《需求规格说明书》"),
      createParagraph("[2] 《软件设计说明书》"),
      createParagraph("[3] 《测试报告》"),

      // Chapter 2
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("2 目标系统描述", HeadingLevel.HEADING_1),

      createHeading("2.1 角色定义", HeadingLevel.HEADING_2),
      createParagraph("本系统的角色定义如表1所示。"),

      new Paragraph({ children: [new TextRun({ text: "表1 系统角色定义表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [1500, 2500, 3000, 4506],
        rows: [
          new TableRow({ children: [
            createCell("编号", 1500, true),
            createCell("角色", 2500, true),
            createCell("职责", 3000, true),
            createCell("相关的业务", 4506, true)
          ]}),
          new TableRow({ children: [
            createCell("01", 1500),
            createCell("游客", 2500),
            createCell("无", 3000),
            createCell("浏览知识中心内容", 4506)
          ]}),
          new TableRow({ children: [
            createCell("02", 1500),
            createCell("用户", 2500),
            createCell("使用基础功能", 3000),
            createCell("色彩分析、预览、打印检测", 4506)
          ]}),
          new TableRow({ children: [
            createCell("03", 1500),
            createCell("管理员", 2500),
            createCell("管理平台", 3000),
            createCell("系统配置与维护", 4506)
          ]})
        ]
      }),

      createHeading("2.2 业务流程", HeadingLevel.HEADING_2),

      createHeading("2.2.1 系统总体工作图", HeadingLevel.HEADING_3),
      createParagraph("系统总体工作流程如图1所示。"),
      createImageParagraph('01_system_overview.png', 550, 180, '图1 系统总体工作示意图'),
      createCaption("图1 系统总体工作示意图"),

      createHeading("2.2.2 用户导入图像流程", HeadingLevel.HEADING_3),
      createParagraph("用户导入图像是使用系统核心功能的起点，其流程如图2所示。"),
      createImageParagraph('02_image_import_flow.png', 450, 360, '图2 用户导入图像流程图'),
      createCaption("图2 用户导入图像流程图"),

      createHeading("2.2.3 色彩分析流程", HeadingLevel.HEADING_3),
      createParagraph("色彩分析流程如图3所示。"),
      createImageParagraph('03_color_analysis_flow.png', 500, 400, '图3 色彩分析流程图'),
      createCaption("图3 色彩分析流程图"),

      createHeading("2.2.4 跨媒介预览流程", HeadingLevel.HEADING_3),
      createParagraph("跨媒介预览是本系统的核心功能，其流程如图4所示。"),
      createImageParagraph('04_cross_preview_flow.png', 550, 400, '图4 跨媒介预览流程图'),
      createCaption("图4 跨媒介预览流程图"),

      // Chapter 3
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("3 总体功能需求", HeadingLevel.HEADING_1),

      createHeading("3.1 总体功能", HeadingLevel.HEADING_2),
      createParagraph("本系统的功能概述如图5所示。"),
      createImageParagraph('05_function_overview.png', 550, 250, '图5 功能总体结构图'),
      createCaption("图5 功能总体结构图"),

      createParagraph("本系统包含四个主要功能模块："),
      createParagraph("1) 色彩实验室(ColorLab)：提供图像导入、ICC配置管理、色彩分析和软打样功能"),
      createParagraph("2) 跨媒介预览(CrossPreview)：提供并排对比、叠加对比，光源模拟、纸张材质模拟、清晰度模拟功能"),
      createParagraph("3) 打印适配(PrintAdapter)：提供打印问题检测和打印就绪向导功能"),
      createParagraph("4) 知识中心(KnowledgeHub)：提供案例库、互动演示和测验功能"),

      createHeading("3.2 用例图形式分析", HeadingLevel.HEADING_2),

      createHeading("3.2.1 登录注册及个人信息维护", HeadingLevel.HEADING_3),
      createParagraph("本系统为桌面应用，无需登录注册功能。用户直接打开应用即可使用所有功能。"),

      createHeading("3.2.2 色彩实验室系统", HeadingLevel.HEADING_3),
      createParagraph("色彩实验室系统用例图如图6所示。"),
      createImageParagraph('06_usecase_color_lab.png', 450, 300, '图6 色彩实验室系统用例图'),
      createCaption("图6 色彩实验室系统用例图"),

      createHeading("3.2.3 跨媒介预览系统", HeadingLevel.HEADING_3),
      createParagraph("跨媒介预览系统用例图如图7所示。"),
      createImageParagraph('07_usecase_cross_preview.png', 450, 300, '图7 跨媒介预览系统用例图'),
      createCaption("图7 跨媒介预览系统用例图"),

      createHeading("3.2.4 打印适配系统", HeadingLevel.HEADING_3),
      createParagraph("打印适配系统用例图如图8所示。"),
      createImageParagraph('08_usecase_print_adapter.png', 400, 280, '图8 打印适配系统用例图'),
      createCaption("图8 打印适配系统用例图"),

      createHeading("3.2.5 知识中心系统", HeadingLevel.HEADING_3),
      createParagraph("知识中心系统用例图如图9所示。"),
      createImageParagraph('09_usecase_knowledge_hub.png', 400, 280, '图9 知识中心系统用例图'),
      createCaption("图9 知识中心系统用例图"),

      createHeading("3.3 类图", HeadingLevel.HEADING_2),
      createParagraph("系统的需求类图如图10所示。"),
      createImageParagraph('10_class_diagram.png', 600, 420, '图10 系统需求类图'),
      createCaption("图10 系统需求类图"),

      // Chapter 4
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("4 系统性能需求", HeadingLevel.HEADING_1),
      createParagraph("具体性能需求点如表2所示。"),

      new Paragraph({ children: [new TextRun({ text: "表2 性能需求表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [1000, 2500, 1500, 3000, 2506],
        rows: [
          new TableRow({ children: [
            createCell("编号", 1000, true),
            createCell("性能需求名称", 2500, true),
            createCell("使用者", 1500, true),
            createCell("功能描述", 3000, true),
            createCell("响应要求", 2506, true)
          ]}),
          new TableRow({ children: [
            createCell("1", 1000),
            createCell("加载系统界面", 2500),
            createCell("用户", 1500),
            createCell("启动应用并显示主界面", 3000),
            createCell("2秒以内", 2506)
          ]}),
          new TableRow({ children: [
            createCell("2", 1000),
            createCell("图像导入", 2500),
            createCell("用户", 1500),
            createCell("读取并显示图像文件", 3000),
            createCell("3秒以内", 2506)
          ]}),
          new TableRow({ children: [
            createCell("3", 1000),
            createCell("色彩分析", 2500),
            createCell("用户", 1500),
            createCell("完成RGB到CMYK转换和色域分析", 3000),
            createCell("2秒以内", 2506)
          ]}),
          new TableRow({ children: [
            createCell("4", 1000),
            createCell("预览更新", 2500),
            createCell("用户", 1500),
            createCell("根据条件变化实时更新预览效果", 3000),
            createCell("1秒以内", 2506)
          ]})
        ]
      }),

      // Chapter 5
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("5 目标系统界面与接口需求", HeadingLevel.HEADING_1),

      createHeading("5.1 界面需求", HeadingLevel.HEADING_2),
      createParagraph("输入设备：键盘、鼠标"),
      createParagraph("输出设备：显示器"),
      createParagraph("显示风格：现代化简洁风格，采用 Ant Design 组件库"),
      createParagraph("显示方式：响应式布局，适配不同窗口尺寸"),
      createParagraph("输出格式：以 Electron 桌面应用方式输出"),

      createHeading("5.2 页面设计", HeadingLevel.HEADING_2),
      createParagraph("色彩实验室页面：提供图像导入、ICC配置选择、色彩分析和软打样预览功能。"),
      createParagraph("跨媒介预览页面：提供并排对比和叠加对比两种模式，右侧为观察条件设置面板。"),
      createParagraph("打印适配页面：提供问题列表展示和解决向导功能。"),
      createParagraph("知识中心页面：提供案例库、演示和测验的标签页切换。"),

      createHeading("5.3 接口需求", HeadingLevel.HEADING_2),
      createParagraph("用户接口：使用 Electron 和 React 构建的桌面应用界面"),
      createParagraph("外部接口：通过 IPC 通信调用原生文件对话框"),
      createParagraph("内部接口：React 组件间通过 Zustand 状态管理进行数据共享"),

      // Chapter 6
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("6 系统其他需求", HeadingLevel.HEADING_1),

      createHeading("6.1 安全性", HeadingLevel.HEADING_2),
      createParagraph("本项目应确保用户数据的隐私和安全。所有图像数据在本地处理，不会上传到任何服务器。系统应能够记录运行时发生的错误。"),

      createHeading("6.2 可靠性", HeadingLevel.HEADING_2),
      createParagraph("本项目应保证稳定运行，在出现异常时能够给出明确的错误提示并允许用户重试。"),

      createHeading("6.3 灵活性", HeadingLevel.HEADING_2),
      createParagraph("本项目支持多种图像格式的导入，并支持后续功能扩展。色彩转换参数可根据不同需求进行调整。")
    ]
  }]
});

// Write file
Packer.toBuffer(requirementsDoc).then(buffer => {
  fs.writeFileSync('F:/Code/test3/printbridge/docs/需求规格说明书.docx', buffer);
  console.log('需求规格说明书.docx created successfully');
});
