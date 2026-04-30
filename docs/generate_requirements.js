const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageBreak, PageNumber } = require('docx');
const fs = require('fs');

// 创建边框样式
const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };

// A4纸张尺寸 (DXA)
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN = 1440; // 1 inch
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

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

// ========== 需求规格说明书 ==========

const requirementsDoc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
      }
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
      // 封面
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
      new Paragraph({ children: [new PageBreak()] }),

      // 目录标题
      createHeading("目录", HeadingLevel.HEADING_1),
      createParagraph("1 概述", { bold: true }),
      createParagraph("1.1 用户简介", { bold: true }),
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

      // 第1章
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

      createParagraph("随着数字内容创作的普及，创作者面临一个核心问题：屏幕上看到的颜色与实际印刷输出的颜色存在差异。PrintBridge 通过软打样技术和跨媒介预览功能，帮助用户在创作阶段就能预见最终的印刷效果，从而做出更好的色彩决策。"),

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
      createParagraph("[6] RGB：红、绿、蓝三原色色彩模型"),

      createHeading("1.4 参考资料", HeadingLevel.HEADING_2),
      createParagraph("[1] 吕云翔. 软件工程——理论与实践[M]. 人民邮电出版社, 2020."),
      createParagraph("[2] Pressman R S. 软件工程: 实践者的研究方法(英文精编版)[M]. 机械工业出版社, 2019."),
      createParagraph("[3] Ian Sommerille. 软件工程(原书第10版)[M]. 机械工业出版社, 2018."),

      createHeading("1.5 相关文档", HeadingLevel.HEADING_2),
      createParagraph("[1] 《需求规格说明书》"),
      createParagraph("[2] 《软件设计说明书》"),
      createParagraph("[3] 《测试报告》"),

      // 第2章
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

      createHeading("2.2.1 网站总体工作图", HeadingLevel.HEADING_3),
      createParagraph("系统总体工作流程如图1所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图1 系统总体工作图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),

      createHeading("2.2.2 用户导入图像流程", HeadingLevel.HEADING_3),
      createParagraph("用户导入图像是使用系统核心功能的起点，其流程如图2所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图2 用户导入图像流程图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),
      createParagraph("用户通过菜单或按钮触发文件对话框，选择图像文件后系统读取文件并转换为 ImageData 对象，同时存储到全局状态供各模块使用。"),

      createHeading("2.2.3 色彩分析流程", HeadingLevel.HEADING_3),
      createParagraph("色彩分析流程如图3所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图3 色彩分析流程图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),
      createParagraph("用户选择 ICC 配置文件后，系统读取图像像素数据，应用 RGB 到 CMYK 转换，计算色域内/外判断，并计算 ΔE 值来量化色彩准确度。"),

      createHeading("2.2.4 跨媒介预览流程", HeadingLevel.HEADING_3),
      createParagraph("跨媒介预览是本系统的核心功能，其流程如图4所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图4 跨媒介预览流程图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),
      createParagraph("用户选择光源类型（D50/D65/F）、纸张材质（铜版纸/哑光纸/新闻纸）、观察距离和分辨率后，系统计算相应的色彩转换和清晰度调整，实时生成预览效果。"),

      // 第3章
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("3 总体功能需求", HeadingLevel.HEADING_1),

      createHeading("3.1 总体功能", HeadingLevel.HEADING_2),
      createParagraph("本系统的功能概述如图5所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图5 功能总体结构图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),

      createParagraph("本系统包含四个主要功能模块："),
      createParagraph("1) 色彩实验室(ColorLab)：提供图像导入、ICC配置管理、色彩分析和软打样功能"),
      createParagraph("2) 跨媒介预览(CrossPreview)：提供并排对比、叠加对比、光源模拟、纸张材质模拟、清晰度模拟功能"),
      createParagraph("3) 打印适配(PrintAdapter)：提供打印问题检测和打印就绪向导功能"),
      createParagraph("4) 知识中心(KnowledgeHub)：提供案例库、互动演示和测验功能"),

      createHeading("3.2 用例图形式分析", HeadingLevel.HEADING_2),

      createHeading("3.2.1 登录注册及个人信息维护", HeadingLevel.HEADING_3),
      createParagraph("本系统为桌面应用，无需登录注册功能。用户直接打开应用即可使用所有功能。"),

      createHeading("3.2.2 色彩实验室系统", HeadingLevel.HEADING_3),
      createParagraph("色彩实验室系统用例图如图6所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图6 色彩实验室系统用例图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),

      new Paragraph({ children: [new TextRun({ text: "表2 \"导入图像\"用例介绍表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [2000, 3500, 3906],
        rows: [
          new TableRow({ children: [
            createCell("编号", 2000, true),
            createCell("101", 3500, true),
            createCell("用例名称", 3906, true)
          ]}),
          new TableRow({ children: [
            createCell("使用人员", 2000),
            createCell("用户", 3500),
            createCell("扩展点", 3906)
          ]}),
          new TableRow({ children: [
            createCell("输入", 2000),
            createCell("图像文件（PNG、JPG、TIFF等）", 3500),
            createCell("前置条件", 3906)
          ]}),
          new TableRow({ children: [
            createCell("系统响应", 2000),
            createCell("系统读取文件并转换为 ImageData 对象", 3500),
            createCell("后置条件", 3906)
          ]}),
          new TableRow({ children: [
            createCell("输出", 2000),
            createCell("图像显示在画布上", 3500),
            createCell("用户成功导入图像", 3906)
          ]})
        ]
      }),

      new Paragraph({ children: [new TextRun({ text: "表3 \"色彩分析\"用例介绍表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [2000, 3500, 3906],
        rows: [
          new TableRow({ children: [
            createCell("编号", 2000, true),
            createCell("102", 3500, true),
            createCell("用例名称", 3906, true)
          ]}),
          new TableRow({ children: [
            createCell("使用人员", 2000),
            createCell("用户", 3500),
            createCell("扩展点", 3906)
          ]}),
          new TableRow({ children: [
            createCell("输入", 2000),
            createCell("ICC配置文件选择", 3500),
            createCell("前置条件", 3906)
          ]}),
          new TableRow({ children: [
            createCell("系统响应", 2000),
            createCell("系统进行RGB到CMYK转换并计算ΔE值", 3500),
            createCell("后置条件", 3906)
          ]}),
          new TableRow({ children: [
            createCell("输出", 2000),
            createCell("显示色彩分析结果和色域判断", 3500),
            createCell("用户获得色彩分析报告", 3906)
          ]})
        ]
      }),

      createHeading("3.2.3 跨媒介预览系统", HeadingLevel.HEADING_3),
      createParagraph("跨媒介预览系统用例图如图7所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图7 跨媒介预览系统用例图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),

      new Paragraph({ children: [new TextRun({ text: "表4 \"并排对比\"用例介绍表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [2000, 3500, 3906],
        rows: [
          new TableRow({ children: [
            createCell("编号", 2000, true),
            createCell("103", 3500, true),
            createCell("用例名称", 3906, true)
          ]}),
          new TableRow({ children: [
            createCell("使用人员", 2000),
            createCell("用户", 3500),
            createCell("扩展点", 3906)
          ]}),
          new TableRow({ children: [
            createCell("输入", 2000),
            createCell("观察条件参数（光源、纸张、距离、分辨率）", 3500),
            createCell("前置条件", 3906)
          ]}),
          new TableRow({ children: [
            createCell("系统响应", 2000),
            createCell("系统生成印刷预览效果并与原图并排显示", 3500),
            createCell("后置条件", 3906)
          ]}),
          new TableRow({ children: [
            createCell("输出", 2000),
            createCell("左右两侧分别显示数字图像和模拟印刷效果", 3500),
            createCell("用户可以进行对比观察", 3906)
          ]})
        ]
      }),

      createHeading("3.2.4 打印适配系统", HeadingLevel.HEADING_3),
      createParagraph("打印适配系统用例图如图8所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图8 打印适配系统用例图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),

      createHeading("3.2.5 知识中心系统", HeadingLevel.HEADING_3),
      createParagraph("知识中心系统用例图如图9所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图9 知识中心系统用例图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),

      createHeading("3.3 类图", HeadingLevel.HEADING_2),
      createParagraph("系统的需求类图如图10所示。"),
      new Paragraph({ children: [new TextRun({ text: "[图10 系统需求类图 - 待插入]", italics: true, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),

      // 第4章
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("4 系统性能需求", HeadingLevel.HEADING_1),
      createParagraph("具体性能需求点如表5所示。"),

      new Paragraph({ children: [new TextRun({ text: "表5 性能需求表", bold: true })], spacing: { before: 300, after: 200 } }),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [1200, 2500, 1500, 3000, 1806],
        rows: [
          new TableRow({ children: [
            createCell("编号", 1200, true),
            createCell("性能需求名称", 2500, true),
            createCell("使用者", 1500, true),
            createCell("功能描述", 3000, true),
            createCell("响应要求", 1806, true)
          ]}),
          new TableRow({ children: [
            createCell("1", 1200),
            createCell("加载系统界面", 2500),
            createCell("用户", 1500),
            createCell("启动应用并显示主界面", 3000),
            createCell("2秒以内", 1806)
          ]}),
          new TableRow({ children: [
            createCell("2", 1200),
            createCell("图像导入", 2500),
            createCell("用户", 1500),
            createCell("读取并显示图像文件", 3000),
            createCell("3秒以内", 1806)
          ]}),
          new TableRow({ children: [
            createCell("3", 1200),
            createCell("色彩分析", 2500),
            createCell("用户", 1500),
            createCell("完成RGB到CMYK转换和色域分析", 3000),
            createCell("2秒以内", 1806)
          ]}),
          new TableRow({ children: [
            createCell("4", 1200),
            createCell("预览更新", 2500),
            createCell("用户", 1500),
            createCell("根据条件变化实时更新预览效果", 3000),
            createCell("1秒以内", 1806)
          ]}),
          new TableRow({ children: [
            createCell("5", 1200),
            createCell("打印问题检测", 2500),
            createCell("用户", 1500),
            createCell("分析图像并生成问题列表", 3000),
            createCell("2秒以内", 1806)
          ]})
        ]
      }),

      // 第5章
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

      // 第6章
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

// 写入文件
Packer.toBuffer(requirementsDoc).then(buffer => {
  fs.writeFileSync('F:/Code/test3/printbridge/docs/需求规格说明书.docx', buffer);
  console.log('需求规格说明书.docx created successfully');
});
