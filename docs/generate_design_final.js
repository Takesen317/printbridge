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

// ========== Software Design Specification Document ==========

const designDoc = new Document({
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
          children: [new TextRun({ text: "PrintBridge 软件设计说明书", size: 18, color: "666666" })],
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
        children: [new TextRun({ text: "软件设计说明书", bold: true, size: 48 })],
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
      createParagraph("1 引言", { bold: true }),
      createParagraph("1.1 编写目的", { spacingAfter: 100 }),
      createParagraph("1.2 术语定义", { spacingAfter: 100 }),
      createParagraph("1.3 参考资料", { spacingAfter: 100 }),
      createParagraph("1.4 相关文档", { spacingAfter: 100 }),
      createParagraph("2 总体设计", { bold: true }),
      createParagraph("2.1 硬件运行环境", { spacingAfter: 100 }),
      createParagraph("2.2 软件运行环境", { spacingAfter: 100 }),
      createParagraph("2.3 子系统清单", { spacingAfter: 100 }),
      createParagraph("2.4 功能模块清单", { spacingAfter: 100 }),
      createParagraph("3 数据库设计", { bold: true }),
      createParagraph("3.1 数据库表名列表", { spacingAfter: 100 }),
      createParagraph("3.2 数据库表之间的关系", { spacingAfter: 100 }),
      createParagraph("3.3 数据库各表具体字段", { spacingAfter: 100 }),
      createParagraph("4 典型功能子系统设计", { bold: true }),
      createParagraph("4.1 色彩实验室系统设计", { spacingAfter: 100 }),
      createParagraph("4.2 跨媒介预览系统设计", { spacingAfter: 100 }),
      createParagraph("4.3 打印适配系统设计", { spacingAfter: 100 }),
      createParagraph("4.4 知识中心系统设计", { spacingAfter: 100 }),
      createParagraph("5 功能模块设计", { bold: true }),
      createParagraph("5.1 色彩实验室页面", { spacingAfter: 100 }),
      createParagraph("5.2 跨媒介预览页面", { spacingAfter: 100 }),
      createParagraph("5.3 打印适配页面", { spacingAfter: 100 }),
      createParagraph("5.4 知识中心页面", { spacingAfter: 100 }),
      createParagraph("6 接口设计", { bold: true, spacingAfter: 100 }),
      createParagraph("7 角色授权设计", { bold: true, spacingAfter: 100 }),
      createParagraph("8 系统错误处理", { bold: true }),
      createParagraph("8.1 出错信息管理", { spacingAfter: 100 }),
      createParagraph("8.2 故障预防与补救", { spacingAfter: 100 }),
      createParagraph("9 项目测试计划", { bold: true, spacingAfter: 100 }),

      // Chapter 1
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("1 引言", HeadingLevel.HEADING_1),

      createHeading("1.1 编写目的", HeadingLevel.HEADING_2),
      createParagraph("在完成了 PrintBridge 需求分析的基础上，我们依据《需求规格说明书》对我们的项目进行了整体上的设计，同样也是为了将我们项目的设计变得文档化才编写了这一软件设计说明书。"),

      createHeading("1.2 术语定义", HeadingLevel.HEADING_2),
      createParagraph("本系统：\"PrintBridge 跨媒介预览系统\"项目本身，包括文档和源代码。"),
      createParagraph("ICC配置文件：国际色彩联盟制定的色彩管理系统标准文件。"),
      createParagraph("软打样：在显示器上模拟图像在不同输出设备上的显示效果。"),

      createHeading("1.3 参考资料", HeadingLevel.HEADING_2),
      createParagraph("[1] 吕云翔. 软件工程——理论与实践[M]. 人民邮电出版社, 2020."),
      createParagraph("[2] Pressman R S. 软件工程: 实践者的研究方法(英文精编版)[M]. 机械工业出版社, 2019."),

      createHeading("1.4 相关文档", HeadingLevel.HEADING_2),
      createParagraph("[1] 《需求规格说明书》"),
      createParagraph("[2] 《软件开发计划书》"),
      createParagraph("[3] 《测试报告》"),

      // Chapter 2
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("2 总体设计", HeadingLevel.HEADING_1),

      createHeading("2.1 硬件运行环境", HeadingLevel.HEADING_2),
      createParagraph("处理器：Intel Core i5 或更高"),
      createParagraph("内存：8GB 或更高"),
      createParagraph("硬盘容量：256GB 或更高"),
      createParagraph("输入输出设备：鼠标、键盘、显示屏"),

      createHeading("2.2 软件运行环境", HeadingLevel.HEADING_2),
      createParagraph("操作系统：Windows 10/11, macOS 10.15+, Ubuntu 20.04+"),
      createParagraph("前端框架：React 18 + TypeScript"),
      createParagraph("桌面框架：Electron 28"),
      createParagraph("状态管理：Zustand 5"),
      createParagraph("UI组件库：Ant Design 6"),
      createParagraph("构建工具：Vite 5"),

      createHeading("2.3 子系统清单", HeadingLevel.HEADING_2),
      createParagraph("本项目的子系统清单列表如表1所示。"),

      new Paragraph({ children: [new TextRun({ text: "表1 子系统清单列表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [1200, 3000, 6706],
        rows: [
          new TableRow({ children: [
            createCell("编号", 1200, true),
            createCell("名称", 3000, true),
            createCell("子系统功能描述", 6706, true)
          ]}),
          new TableRow({ children: [
            createCell("1", 1200),
            createCell("色彩实验室系统", 3000),
            createCell("1）用户导入图像文件并显示\n2）选择ICC配置文件\n3）进行色彩分析并显示结果\n4）软打样预览效果", 6706)
          ]}),
          new TableRow({ children: [
            createCell("2", 1200),
            createCell("跨媒介预览系统", 3000),
            createCell("1）并排对比数字显示与模拟印刷\n2）叠加对比数字显示与模拟印刷\n3）光源类型模拟（D50/D65/F）\n4）纸张材质模拟（铜版纸/哑光纸/新闻纸）\n5）观察距离和分辨率模拟", 6706)
          ]}),
          new TableRow({ children: [
            createCell("3", 1200),
            createCell("打印适配系统", 3000),
            createCell("1）检测图像的打印问题\n2）提供问题解决向导", 6706)
          ]}),
          new TableRow({ children: [
            createCell("4", 1200),
            createCell("知识中心系统", 3000),
            createCell("1）浏览案例库\n2）观看互动演示\n3）参与测验", 6706)
          ]})
        ]
      }),

      createHeading("2.4 功能模块清单", HeadingLevel.HEADING_2),
      createParagraph("本项目的功能模块清单如表2所示。"),

      new Paragraph({ children: [new TextRun({ text: "表2 功能模块清单列表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [1200, 2500, 7206],
        rows: [
          new TableRow({ children: [createCell("编号", 1200, true), createCell("名称", 2500, true), createCell("模块功能描述", 7206, true)] }),
          new TableRow({ children: [createCell("101", 1200), createCell("导入图像", 2500), createCell("用户导入RGB/CMYK图像文件", 7206)] }),
          new TableRow({ children: [createCell("102", 1200), createCell("选择ICC配置文件", 2500), createCell("选择源色彩配置文件和目标打印配置文件", 7206)] }),
          new TableRow({ children: [createCell("103", 1200), createCell("色彩分析", 2500), createCell("分析图像色彩范围与色域", 7206)] }),
          new TableRow({ children: [createCell("104", 1200), createCell("软打样预览", 2500), createCell("在屏幕上模拟印刷效果", 7206)] }),
          new TableRow({ children: [createCell("105", 1200), createCell("并排对比", 2500), createCell("数字显示与模拟印刷并排对比", 7206)] }),
          new TableRow({ children: [createCell("106", 1200), createCell("叠加对比", 2500), createCell("数字显示与模拟印刷叠加对比", 7206)] }),
          new TableRow({ children: [createCell("107", 1200), createCell("光源模拟", 2500), createCell("D50/D65/F光源色温效果", 7206)] }),
          new TableRow({ children: [createCell("108", 1200), createCell("纸张材质模拟", 2500), createCell("铜版纸/哑光纸/新闻纸效果", 7206)] }),
          new TableRow({ children: [createCell("109", 1200), createCell("观察距离模拟", 2500), createCell("不同观察距离的清晰度效果", 7206)] }),
          new TableRow({ children: [createCell("110", 1200), createCell("分辨率模拟", 2500), createCell("不同DPI的图像清晰度", 7206)] }),
          new TableRow({ children: [createCell("201", 1200), createCell("打印问题检测", 2500), createCell("检测图像分辨率、色彩空间等问题", 7206)] }),
          new TableRow({ children: [createCell("202", 1200), createCell("打印就绪向导", 2500), createCell("引导用户解决打印问题", 7206)] }),
          new TableRow({ children: [createCell("301", 1200), createCell("浏览案例库", 2500), createCell("浏览学习案例", 7206)] }),
          new TableRow({ children: [createCell("302", 1200), createCell("互动演示", 2500), createCell("观看色彩管理演示", 7206)] }),
          new TableRow({ children: [createCell("303", 1200), createCell("参与测验", 2500), createCell("测试色彩管理知识", 7206)] })
        ]
      }),

      // Chapter 3
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("3 数据库设计", HeadingLevel.HEADING_1),

      createHeading("3.1 数据库表名列表", HeadingLevel.HEADING_2),
      createParagraph("本系统使用 Zustand 进行状态管理，数据存储在内存中。以下为运行时数据结构。"),

      new Paragraph({ children: [new TextRun({ text: "表3 数据结构列表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [1500, 4000, 5406],
        rows: [
          new TableRow({ children: [createCell("编号", 1500, true), createCell("表名/结构名", 4000, true), createCell("表功能说明", 5406, true)] }),
          new TableRow({ children: [createCell("1", 1500), createCell("ProjectState", 4000), createCell("项目状态存储", 5406)] }),
          new TableRow({ children: [createCell("2", 1500), createCell("ColorState", 4000), createCell("色彩实验室状态存储", 5406)] }),
          new TableRow({ children: [createCell("3", 1500), createCell("ImageData", 4000), createCell("图像数据结构", 5406)] }),
          new TableRow({ children: [createCell("4", 1500), createCell("ICCProfile", 4000), createCell("ICC配置文件结构", 5406)] })
        ]
      }),

      createHeading("3.2 数据库表之间的关系", HeadingLevel.HEADING_2),
      createParagraph("数据存储结构关系如图1所示。"),
      createImageParagraph('13_database_diagram.png', 550, 350, '图1 数据存储结构关系图'),
      createCaption("图1 数据存储结构关系图"),
      createParagraph("ProjectState 和 ColorState 通过 Zustand store 进行状态管理，ImageData 作为原始图像数据在模块间传递。"),

      createHeading("3.3 数据库各表具体字段", HeadingLevel.HEADING_2),

      new Paragraph({ children: [new TextRun({ text: "表4 ProjectState 结构", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [1200, 2500, 2500, 3706],
        rows: [
          new TableRow({ children: [createCell("序号", 1200, true), createCell("字段名", 2500, true), createCell("数据类型", 2500, true), createCell("字段说明", 3706, true)] }),
          new TableRow({ children: [createCell("1", 1200), createCell("originalImage", 2500), createCell("ImageData", 2500), createCell("原始导入的图像", 3706)] }),
          new TableRow({ children: [createCell("2", 1200), createCell("processedImage", 2500), createCell("ImageData", 2500), createCell("处理后的图像", 3706)] }),
          new TableRow({ children: [createCell("3", 1200), createCell("processingOptions", 2500), createCell("ImageProcessorOptions", 2500), createCell("处理参数选项", 3706)] })
        ]
      }),

      new Paragraph({ children: [new TextRun({ text: "表5 ColorState 结构", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [1200, 2500, 2500, 3706],
        rows: [
          new TableRow({ children: [createCell("序号", 1200, true), createCell("字段名", 2500, true), createCell("数据类型", 2500, true), createCell("字段说明", 3706, true)] }),
          new TableRow({ children: [createCell("1", 1200), createCell("activeProfile", 2500), createCell("ICCProfile", 2500), createCell("当前选中的ICC配置文件", 3706)] }),
          new TableRow({ children: [createCell("2", 1200), createCell("availableProfiles", 2500), createCell("ICCProfile[]", 2500), createCell("可用的ICC配置文件列表", 3706)] }),
          new TableRow({ children: [createCell("3", 1200), createCell("analysis", 2500), createCell("ColorAnalysis", 2500), createCell("色彩分析结果", 3706)] })
        ]
      }),

      // Chapter 4
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("4 典型功能子系统设计", HeadingLevel.HEADING_1),

      createHeading("4.1 色彩实验室系统设计", HeadingLevel.HEADING_2),
      createParagraph("色彩实验室系统类图设计如图2所示。"),
      createImageParagraph('10_class_diagram.png', 600, 420, '图2 色彩实验室系统类图'),
      createCaption("图2 色彩实验室系统类图"),

      createParagraph("色彩实验室系统活动图设计如图3所示。"),
      createImageParagraph('11_activity_color_lab.png', 500, 450, '图3 色彩实验室系统活动图'),
      createCaption("图3 色彩实验室系统活动图"),

      createHeading("4.2 跨媒介预览系统设计", HeadingLevel.HEADING_2),
      createParagraph("跨媒介预览系统类图设计如图4所示。"),
      createImageParagraph('10_class_diagram.png', 600, 420, '图4 跨媒介预览系统类图'),
      createCaption("图4 跨媒介预览系统类图"),

      createParagraph("跨媒介预览系统顺序图设计如图5所示。"),
      createImageParagraph('12_sequence_cross_preview.png', 550, 420, '图5 跨媒介预览系统顺序图'),
      createCaption("图5 跨媒介预览系统顺序图"),

      createHeading("4.3 打印适配系统设计", HeadingLevel.HEADING_2),
      createParagraph("打印适配系统用例图如图6所示。"),
      createImageParagraph('08_usecase_print_adapter.png', 400, 280, '图6 打印适配系统用例图'),
      createCaption("图6 打印适配系统用例图"),

      createHeading("4.4 知识中心系统设计", HeadingLevel.HEADING_2),
      createParagraph("知识中心系统用例图如图7所示。"),
      createImageParagraph('09_usecase_knowledge_hub.png', 400, 280, '图7 知识中心系统用例图'),
      createCaption("图7 知识中心系统用例图"),

      // Chapter 5
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("5 功能模块设计", HeadingLevel.HEADING_1),

      createHeading("5.1 色彩实验室页面", HeadingLevel.HEADING_2),
      createParagraph("包含功能模块：图像导入、ICC配置管理、色彩分析"),
      createParagraph("页面参数："),
      createParagraph("1. 图像数据：ImageData 对象，存储图像像素信息"),
      createParagraph("2. ICC配置文件：当前选中的配置文件"),
      createParagraph("调用背景：当用户点击左侧导航栏的\"色彩实验室\"时进入该页面"),
      createParagraph("页面组成："),
      createParagraph("1. 顶部工具栏：导入图像按钮、分析按钮"),
      createParagraph("2. 主内容区左侧：图像显示画布"),
      createParagraph("3. 主内容区中间：ICC配置选择下拉框"),
      createParagraph("4. 主内容区右侧：色彩分析结果展示"),
      createParagraph("5. 底部：软打样预览区域"),

      createHeading("5.2 跨媒介预览页面", HeadingLevel.HEADING_2),
      createParagraph("包含功能模块：并排对比、叠加对比、条件参数设置"),
      createParagraph("页面参数："),
      createParagraph("1. 原始图像数据：ImageData 对象"),
      createParagraph("2. 处理后图像数据：ImageData 对象"),
      createParagraph("调用背景：当用户点击左侧导航栏的\"跨媒介预览\"时进入该页面"),
      createParagraph("页面组成："),
      createParagraph("1. 主内容区左侧：对比视图（并排或叠加）"),
      createParagraph("2. 主内容区右侧：观察条件设置面板（光源、纸张、距离、分辨率）"),
      createParagraph("3. 底部：刷新预览按钮"),

      createHeading("5.3 打印适配页面", HeadingLevel.HEADING_2),
      createParagraph("包含功能模块：问题检测、解决向导"),
      createParagraph("调用背景：当用户点击左侧导航栏的\"打印适配\"时进入该页面"),
      createParagraph("页面组成："),
      createParagraph("1. 问题列表区域：显示检测到的所有打印问题"),
      createParagraph("2. 向导区域：逐步引导用户解决问题"),

      createHeading("5.4 知识中心页面", HeadingLevel.HEADING_2),
      createParagraph("包含功能模块：案例库、互动演示、测验"),
      createParagraph("调用背景：当用户点击左侧导航栏的\"知识中心\"时进入该页面"),
      createParagraph("页面组成："),
      createParagraph("1. 标签切换区：案例库/演示/测验"),
      createParagraph("2. 内容展示区：根据选中标签显示相关内容"),

      // Chapter 6
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("6 接口设计", HeadingLevel.HEADING_1),

      createHeading("6.1 用户接口", HeadingLevel.HEADING_2),
      createParagraph("本系统使用 Electron + React 构建桌面应用，采用 Ant Design 组件库实现用户界面。"),

      createHeading("6.2 外部接口", HeadingLevel.HEADING_2),
      createParagraph("本系统通过 Electron IPC 与操作系统交互："),
      createParagraph("- 使用原生文件对话框打开/保存文件"),
      createParagraph("- 通过菜单系统提供应用级操作"),

      createHeading("6.3 内部接口", HeadingLevel.HEADING_2),
      createParagraph("React 组件间通过 Zustand store 进行状态共享："),
      createParagraph("- projectStore：存储项目状态，包括原始图像和处理后的图像"),
      createParagraph("- colorStore：存储色彩分析相关状态"),

      // Chapter 7
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("7 角色授权设计", HeadingLevel.HEADING_1),
      createParagraph("本项目的使用角色有三类：游客、用户、管理员。"),

      createParagraph("角色权限关系如图8所示。"),
      createImageParagraph('14_rbac_diagram.png', 550, 300, '图8 角色权限示意图'),
      createCaption("图8 角色权限示意图"),

      new Paragraph({ children: [new TextRun({ text: "表6 角色授权设计表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [3500, 2800, 2806],
        rows: [
          new TableRow({ children: [createCell("子系统名称", 3500, true), createCell("游客", 2800, true), createCell("用户", 2806, true)] }),
          new TableRow({ children: [createCell("色彩实验室系统", 3500), createCell("○ 部分功能", 2800), createCell("● 全部功能", 2806)] }),
          new TableRow({ children: [createCell("跨媒介预览系统", 3500), createCell("○ 部分功能", 2800), createCell("● 全部功能", 2806)] }),
          new TableRow({ children: [createCell("打印适配系统", 3500), createCell("○ 部分功能", 2800), createCell("● 全部功能", 2806)] }),
          new TableRow({ children: [createCell("知识中心系统", 3500), createCell("● 全部功能", 2800), createCell("● 全部功能", 2806)] })
        ]
      }),
      createParagraph("●表示有全部权限，○表示享有部分权限"),
      createParagraph("游客可以浏览知识中心内容，但需要导入图像后才能使用色彩分析和预览功能。"),

      // Chapter 8
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("8 系统错误处理", HeadingLevel.HEADING_1),

      createHeading("8.1 出错信息管理", HeadingLevel.HEADING_2),
      createParagraph("1. 对前端可能输入或导入的内容或文件进行有效性和安全性检查"),
      createParagraph("2. 对程序运行中可能产生的异常进行捕获，同时收集错误信息"),
      createParagraph("3. 当用户操作失败时，显示明确的错误提示信息"),

      createHeading("8.2 故障预防与补救", HeadingLevel.HEADING_2),
      createParagraph("1. 以统一的机制进行权限控制"),
      createParagraph("2. 对关键数据进行定期备份"),
      createParagraph("3. 记录系统运行日志，便于问题追踪"),

      // Chapter 9
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("9 项目测试计划", HeadingLevel.HEADING_1),
      createParagraph("测试计划作为本项目的测试指导，将由项目成员按计划和规定进行测试。"),

      new Paragraph({ children: [new TextRun({ text: "表7 测试计划设计表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [1500, 2000, 3000, 3506],
        rows: [
          new TableRow({ children: [
            createCell("测试计划序号", 1500, true),
            createCell("测试计划类型", 2000, true),
            createCell("对应部分", 3000, true),
            createCell("测试计划内容", 3506, true)
          ]}),
          new TableRow({ children: [createCell("1", 1500), createCell("单元测试", 2000), createCell("图像导入模块", 3000), createCell("测试图像文件导入功能", 3506)] }),
          new TableRow({ children: [createCell("2", 1500), createCell("单元测试", 2000), createCell("色彩转换模块", 3000), createCell("测试RGB到CMYK转换准确性", 3506)] }),
          new TableRow({ children: [createCell("3", 1500), createCell("单元测试", 2000), createCell("预览生成模块", 3000), createCell("测试印刷预览效果生成", 3506)] }),
          new TableRow({ children: [createCell("4", 1500), createCell("集成测试", 2000), createCell("色彩实验室系统", 3000), createCell("测试完整色彩分析流程", 3506)] }),
          new TableRow({ children: [createCell("5", 1500), createCell("集成测试", 2000), createCell("跨媒介预览系统", 3000), createCell("测试对比视图和条件调整", 3506)] }),
          new TableRow({ children: [createCell("6", 1500), createCell("系统测试", 2000), createCell("整个PrintBridge", 3000), createCell("测试整个平台的运行", 3506)] })
        ]
      })
    ]
  }]
});

// Write file
Packer.toBuffer(designDoc).then(buffer => {
  fs.writeFileSync('F:/Code/test3/printbridge/docs/软件设计说明书.docx', buffer);
  console.log('软件设计说明书.docx created successfully');
});
