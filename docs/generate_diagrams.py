#!/usr/bin/env python3
"""
Generate flowcharts, class diagrams, activity diagrams and sequence diagrams for PrintBridge
Using matplotlib and Pillow
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle, Circle
import matplotlib.lines as mlines
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import matplotlib.font_manager as fm

# Add Chinese font
chinese_font_path = 'C:/Windows/Fonts/simhei.ttf'
chinese_font = fm.FontProperties(fname=chinese_font_path)

def get_font(size=9, bold=False):
    weight = 'bold' if bold else 'normal'
    return fm.FontProperties(fname=chinese_font_path, size=size, weight=weight)

# Output directory
OUTPUT_DIR = 'F:/Code/test3/printbridge/docs/diagrams'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Colors
COLORS = {
    'start_end': '#2E7D32',      # Green
    'process': '#1976D2',         # Blue
    'decision': '#FFA000',         # Orange
    'document': '#7B1FA2',         # Purple
    'arrow': '#424242',           # Dark gray
    'text': '#212121',            # Almost black
    'bg': '#FAFAFA',              # Light gray background
    'user_action': '#D32F2F',     # Red
    'system_response': '#0288D1',  # Light blue
    'header_bg': '#E3F2FD',       # Very light blue
}

def draw_rounded_rect(ax, x, y, width, height, color, text, fontsize=9, text_color='white'):
    """Draw a rounded rectangle (process box)"""
    box = FancyBboxPatch((x - width/2, y - height/2), width, height,
                         boxstyle="round,pad=0.02,rounding_size=0.15",
                         facecolor=color, edgecolor='black', linewidth=1.5)
    ax.add_patch(box)
    ax.text(x, y, text, ha='center', va='center', fontproperties=get_font(fontsize, text_color=='white'),
            color=text_color, wrap=True, multialignment='center')
    return (x, y, width, height)

def draw_diamond(ax, x, y, size, color, text, fontsize=8):
    """Draw a diamond (decision box)"""
    diamond = plt.Polygon([(x, y + size/2), (x + size/2, y), (x, y - size/2), (x - size/2, y)],
                         facecolor=color, edgecolor='black', linewidth=1.5)
    ax.add_patch(diamond)
    ax.text(x, y, text, ha='center', va='center', fontproperties=get_font(fontsize, True),
            color='white', multialignment='center')

def draw_oval(ax, x, y, width, height, color, text, fontsize=9):
    """Draw an oval (start/end)"""
    oval = mpatches.Ellipse((x, y), width, height, facecolor=color, edgecolor='black', linewidth=2)
    ax.add_patch(oval)
    ax.text(x, y, text, ha='center', va='center', fontsize=fontsize, color='white', fontweight='bold')

def draw_arrow(ax, start, end, color='#424242'):
    """Draw an arrow between two points"""
    ax.annotate('', xy=end, xytext=start,
                arrowprops=dict(arrowstyle='->', color=color, lw=1.5))

def draw_line(ax, start, end, color='#424242'):
    """Draw a line between two points"""
    ax.plot([start[0], end[0]], [start[1], end[1]], color=color, linewidth=1.5)

# ============ 图1: 系统总体工作图 ============
def create_system_overview():
    fig, ax = plt.subplots(1, 1, figsize=(12, 4))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 4)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    # Title
    ax.text(6, 3.6, '图1 系统总体工作示意图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Actors and their actions
    # User
    draw_oval(ax, 1.5, 2, 1.8, 0.7, '#1976D2', '用户', 11)

    # Processes
    draw_rounded_rect(ax, 4.5, 2, 2, 0.6, '#4CAF50', '导入图像', 10)
    draw_rounded_rect(ax, 7, 2, 2, 0.6, '#4CAF50', '色彩分析/\n跨媒介预览', 10)
    draw_rounded_rect(ax, 9.5, 2, 2, 0.6, '#4CAF50', '查看结果/\n解决问题', 10)

    # Data flows
    draw_arrow(ax, (2.4, 2), (3.5, 2))
    draw_arrow(ax, (5.5, 2), (6, 2))
    draw_arrow(ax, (8, 2), (8.5, 2))

    # Labels
    ax.text(3, 2.4, '1.选择文件', fontsize=8, ha='center')
    ax.text(5.75, 2.4, '2.分析/预览', fontsize=8, ha='center')
    ax.text(8.75, 2.4, '3.决策', fontsize=8, ha='center')

    # External systems
    ax.text(1.5, 0.8, '本地文件系统', fontsize=9, ha='center', style='italic', color='#666')
    ax.text(4.5, 0.8, '内存/状态管理', fontsize=9, ha='center', style='italic', color='#666')
    ax.text(7, 0.8, '显示渲染', fontsize=9, ha='center', style='italic', color='#666')

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/01_system_overview.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图2: 用户导入图像流程图 ============
def create_image_import_flow():
    fig, ax = plt.subplots(1, 1, figsize=(10, 8))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(5, 9.5, '图2 用户导入图像流程图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Start
    draw_oval(ax, 5, 8.5, 2, 0.6, COLORS['start_end'], '开始', 10)

    # Process boxes
    draw_rounded_rect(ax, 5, 7.5, 3.5, 0.6, COLORS['process'], '用户点击"导入图像"按钮', 9)
    draw_rounded_rect(ax, 5, 6.5, 3.5, 0.6, COLORS['process'], '系统弹出文件选择对话框', 9)
    draw_rounded_rect(ax, 5, 5.5, 3.5, 0.6, COLORS['process'], '用户选择图像文件', 9)
    draw_rounded_rect(ax, 5, 4.5, 3.5, 0.6, COLORS['process'], '系统读取文件并转换为ImageData', 9)
    draw_rounded_rect(ax, 5, 3.5, 3.5, 0.6, COLORS['process'], '系统存储到全局状态(Zustand)', 9)
    draw_rounded_rect(ax, 5, 2.5, 3.5, 0.6, COLORS['process'], '系统显示图像到画布', 9)

    # End
    draw_oval(ax, 5, 1.5, 2, 0.6, COLORS['start_end'], '结束', 10)

    # Decision
    draw_diamond(ax, 5, 7, 1.2, COLORS['decision'], '文件\n有效?', 8)

    # Arrows
    draw_arrow(ax, (5, 8.2), (5, 7.8))  # Start to first process
    draw_arrow(ax, (5, 7.2), (5, 7))    # Process to decision
    draw_arrow(ax, (5, 6.5), (5, 5.8))  # Decision to process
    draw_arrow(ax, (5, 5.2), (5, 4.8))
    draw_arrow(ax, (5, 4.2), (5, 3.8))
    draw_arrow(ax, (5, 3.2), (5, 2.8))
    draw_arrow(ax, (5, 2.2), (5, 1.8))

    # Error path
    ax.text(7.5, 7, '否', fontsize=8, color='red')
    ax.annotate('', xy=(8.5, 7), xytext=(5.6, 7),
                arrowprops=dict(arrowstyle='->', color='red', lw=1.5))
    draw_rounded_rect(ax, 9.5, 7, 1.5, 0.5, COLORS['user_action'], '显示错误', 8)

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/02_image_import_flow.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图3: 色彩分析流程图 ============
def create_color_analysis_flow():
    fig, ax = plt.subplots(1, 1, figsize=(11, 9))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 11)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(5.5, 10.5, '图3 色彩分析流程图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Start
    draw_oval(ax, 5.5, 9.5, 2, 0.6, COLORS['start_end'], '开始', 10)

    # Processes
    draw_rounded_rect(ax, 5.5, 8.7, 3.5, 0.6, COLORS['process'], '用户选择ICC配置文件', 9)
    draw_rounded_rect(ax, 5.5, 7.7, 3.5, 0.6, COLORS['process'], '系统获取图像像素数据', 9)
    draw_rounded_rect(ax, 5.5, 6.7, 3.5, 0.6, COLORS['process'], 'RGB to CMYK色彩转换', 9)
    draw_rounded_rect(ax, 5.5, 5.7, 3.5, 0.6, COLORS['process'], '计算色域内/外判断', 9)
    draw_rounded_rect(ax, 5.5, 4.7, 3.5, 0.6, COLORS['process'], '计算ΔE值(色彩准确度)', 9)
    draw_rounded_rect(ax, 5.5, 3.7, 3.5, 0.6, COLORS['process'], '显示分析结果到界面', 9)

    # Decision
    draw_diamond(ax, 5.5, 8, 1.2, COLORS['decision'], 'ΔE<3?', 8)

    # End
    draw_oval(ax, 5.5, 3, 2, 0.6, COLORS['start_end'], '结束', 10)

    # Arrows
    draw_arrow(ax, (5.5, 9.2), (5.5, 9.1))
    draw_arrow(ax, (5.5, 8.4), (5.5, 8))
    draw_arrow(ax, (5.5, 7.4), (5.5, 7))
    draw_arrow(ax, (5.5, 6.4), (5.5, 6))
    draw_arrow(ax, (5.5, 5.4), (5.5, 5))
    draw_arrow(ax, (5.5, 4.4), (5.5, 4))
    draw_arrow(ax, (5.5, 3.4), (5.5, 3.3))

    # Legend
    ax.text(9, 9.5, '在色域内', fontsize=8, color='green')
    ax.text(9, 8.5, '在色域外', fontsize=8, color='red')
    ax.annotate('', xy=(8.5, 8), xytext=(6.1, 8),
                arrowprops=dict(arrowstyle='->', color='green', lw=1.5))

    # Labels on arrows
    ax.text(6.8, 8.7, '是', fontsize=8, color='green')

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/03_color_analysis_flow.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图4: 跨媒介预览流程图 ============
def create_cross_preview_flow():
    fig, ax = plt.subplots(1, 1, figsize=(12, 9))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 11)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(6, 10.5, '图4 跨媒介预览流程图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Start
    draw_oval(ax, 6, 9.5, 2, 0.6, COLORS['start_end'], '开始', 10)

    # Processes
    draw_rounded_rect(ax, 6, 8.7, 4, 0.6, COLORS['process'], '用户选择观察条件参数', 9)
    draw_rounded_rect(ax, 6, 7.7, 4, 0.6, COLORS['process'], '光源: D50/D65/F + 纸张材质', 9)
    draw_rounded_rect(ax, 6, 6.7, 4, 0.6, COLORS['process'], '观察距离 + 分辨率调整', 9)
    draw_rounded_rect(ax, 6, 5.7, 4, 0.6, COLORS['process'], 'RGB to CMYK to RGB转换', 9)
    draw_rounded_rect(ax, 6, 4.7, 4, 0.6, COLORS['process'], '应用饱和度/对比度/清晰度', 9)
    draw_rounded_rect(ax, 6, 3.7, 4, 0.6, COLORS['process'], '生成预览图像并显示', 9)

    # End
    draw_oval(ax, 6, 3, 2, 0.6, COLORS['start_end'], '结束', 10)

    # Arrows
    draw_arrow(ax, (6, 9.2), (6, 9.1))
    draw_arrow(ax, (6, 8.4), (6, 8.3))
    draw_arrow(ax, (6, 7.4), (6, 7.3))
    draw_arrow(ax, (6, 6.4), (6, 6.3))
    draw_arrow(ax, (6, 5.4), (6, 5.3))
    draw_arrow(ax, (6, 4.4), (6, 4.3))
    draw_arrow(ax, (6, 3.4), (6, 3.3))

    # Side processes
    ax.text(10, 8.5, '饱和度调整:', fontsize=8)
    ax.text(10, 8.1, '铜版纸: 95%', fontsize=7)
    ax.text(10, 7.7, '哑光纸: 85%', fontsize=7)
    ax.text(10, 7.3, '新闻纸: 70%', fontsize=7)

    ax.text(10, 6.5, '清晰度因子:', fontsize=8)
    ax.text(10, 6.1, '基于距离×分辨率', fontsize=7)

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/04_cross_preview_flow.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图5: 功能总体结构图 ============
def create_function_overview():
    fig, ax = plt.subplots(1, 1, figsize=(12, 6))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(6, 7.5, '图5 功能总体结构图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Central system box
    draw_rounded_rect(ax, 6, 4, 4, 1.5, '#1565C0', 'PrintBridge\n跨媒介预览系统', 11, 'white')

    # Four modules
    modules = [
        (1.5, 2.5, '#43A047', '色彩实验室\n(ColorLab)', '图像导入\nICC配置\n色彩分析\n软打样'),
        (4.5, 2.5, '#7B1FA2', '跨媒介预览\n(CrossPreview)', '并排对比\n叠加对比\n光源模拟\n纸张模拟'),
        (7.5, 2.5, '#E65100', '打印适配\n(PrintAdapter)', '问题检测\n就绪向导'),
        (10.5, 2.5, '#00838F', '知识中心\n(KnowledgeHub)', '案例库\n互动演示\n测验'),
    ]

    for x, y, color, title, features in modules:
        draw_rounded_rect(ax, x, y, 2.5, 2.2, color, title, 9)
        ax.text(x, y - 0.8, features, fontsize=7, ha='center', va='top', color='#333')

    # Connections
    for x in [2.75, 5.75, 8.75]:
        draw_arrow(ax, (x - 1.25, 4), (x - 0.5, 3.6))

    for x in [2.75, 5.75, 8.75, 11.75]:
        if x < 11:
            draw_line(ax, (x + 0.5, y), (x + 1.25, y))

    # Bottom - shared data
    draw_rounded_rect(ax, 6, 0.8, 5, 0.8, '#757575', '共享状态: Zustand Store (ProjectState, ColorState)', 8)

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/05_function_overview.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图6-9: 用例图 ============
def create_usecase_color_lab():
    """Color Lab use case diagram"""
    fig, ax = plt.subplots(1, 1, figsize=(10, 7))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 9)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(5, 8.5, '图6 色彩实验室系统用例图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Actor
    draw_oval(ax, 1, 5, 1.2, 0.8, '#1976D2', '用户', 10)

    # Use cases
    uc_positions = [
        (5, 7.5, '导入图像'),
        (7, 6, '选择ICC配置文件'),
        (5, 5, '色彩分析'),
        (7, 3.5, '查看分析结果'),
        (3, 3.5, '软打样预览'),
    ]

    for x, y, text in uc_positions:
        draw_rounded_rect(ax, x, y, 2.2, 0.7, '#E3F2FD', text, 9, '#1565C0')

    # Actor to UC lines
    draw_line(ax, (1.6, 5), (3.9, 7.5))
    draw_line(ax, (1.6, 5), (5.9, 6))
    draw_line(ax, (1.6, 5), (3.9, 5))
    draw_line(ax, (1.6, 5), (5.9, 3.5))
    draw_line(ax, (1.6, 5), (2.2, 3.5))

    # Include relationships
    ax.text(4.5, 6.2, '<<include>>', fontsize=7, ha='center', color='#666')
    ax.annotate('', xy=(5, 5.35), xytext=(5, 5.65),
                arrowprops=dict(arrowstyle='->', color='#666', lw=1, ls='--'))

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/06_usecase_color_lab.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

def create_usecase_cross_preview():
    """Cross Preview use case diagram"""
    fig, ax = plt.subplots(1, 1, figsize=(10, 7))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 9)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(5, 8.5, '图7 跨媒介预览系统用例图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Actor
    draw_oval(ax, 1, 5, 1.2, 0.8, '#1976D2', '用户', 10)

    # Use cases
    uc_positions = [
        (5, 7.5, '并排对比'),
        (5, 6.2, '叠加对比'),
        (7.5, 5, '设置光源类型'),
        (7.5, 3.8, '设置纸张材质'),
        (3, 5, '设置观察距离'),
        (3, 3.5, '设置分辨率'),
    ]

    for x, y, text in uc_positions:
        draw_rounded_rect(ax, x, y, 2.2, 0.7, '#E8EAF6', text, 9, '#3F51B5')

    # Connections
    for x, y in [(3.9, 7.5), (3.9, 6.2), (6.1, 5), (6.1, 3.8), (2.2, 5), (2.2, 3.5)]:
        draw_line(ax, (1.6, 5), (x, y))

    # Extend relationships
    ax.text(6.5, 6.8, '<<extend>>', fontsize=7, ha='center', color='#666')

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/07_usecase_cross_preview.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

def create_usecase_print_adapter():
    """Print Adapter use case diagram"""
    fig, ax = plt.subplots(1, 1, figsize=(9, 6))
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 8)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(4.5, 7.5, '图8 打印适配系统用例图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Actor
    draw_oval(ax, 1, 4, 1.2, 0.8, '#1976D2', '用户', 10)

    # Use cases
    uc_positions = [
        (5, 6, '检测打印问题'),
        (7, 4.5, '查看问题详情'),
        (5, 3, '启动解决向导'),
        (7, 1.8, '执行解决步骤'),
    ]

    for x, y, text in uc_positions:
        draw_rounded_rect(ax, x, y, 2.2, 0.7, '#FFF3E0', text, 9, '#E65100')

    # Connections
    for x, y in [(3.9, 6), (6.1, 4.5), (3.9, 3), (6.1, 1.8)]:
        draw_line(ax, (1.6, 4), (x, y))

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/08_usecase_print_adapter.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

def create_usecase_knowledge_hub():
    """Knowledge Hub use case diagram"""
    fig, ax = plt.subplots(1, 1, figsize=(9, 6))
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 8)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(4.5, 7.5, '图9 知识中心系统用例图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Actor
    draw_oval(ax, 1, 4, 1.2, 0.8, '#1976D2', '用户', 10)

    # Use cases
    uc_positions = [
        (5, 6, '浏览案例库'),
        (7, 4.5, '查看案例详情'),
        (5, 3, '观看互动演示'),
        (7, 1.8, '参与知识测验'),
    ]

    for x, y, text in uc_positions:
        draw_rounded_rect(ax, x, y, 2.2, 0.7, '#E0F2F1', text, 9, '#00838F')

    # Connections
    for x, y in [(3.9, 6), (6.1, 4.5), (3.9, 3), (6.1, 1.8)]:
        draw_line(ax, (1.6, 4), (x, y))

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/09_usecase_knowledge_hub.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图10: 系统需求类图 ============
def create_class_diagram():
    """System class diagram showing main entities"""
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 12)
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(7, 11.5, '图10 系统需求类图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Class boxes - Format: (x, y, width, height, name, attributes, methods)
    classes = [
        (2, 9, 3.5, 1.8, 'ProjectStore', ['- originalImage: ImageData', '- processedImage: ImageData', '- processingOptions: Options'], ['+ setOriginalImage()', '+ setProcessedImage()']),
        (6.5, 9, 3.5, 1.8, 'ColorStore', ['- activeProfile: ICCProfile', '- availableProfiles: Profile[]', '- analysis: ColorAnalysis'], ['+ setActiveProfile()', '+ setAnalysis()']),
        (11, 9, 3.5, 1.8, 'ImageData', ['- width: number', '- height: number', '- data: Uint8ClampedArray'], ['+ getPixel()', '+ setPixel()']),
        (2, 5.5, 3.5, 1.6, 'ImageProcessor', ['- colorMode: string', '- resolution: number', '- paperType: string'], ['+ simulatePrintPreview()', '+ applyLightSource()']),
        (6.5, 5.5, 3.5, 1.6, 'ColorEngine', ['- profiles: ICCProfile[]', '- deltaEThreshold: number'], ['+ analyzeColor()', '+ rgbToCmyk()', '+ calculateDeltaE()']),
        (11, 5.5, 3.5, 1.6, 'PrintChecker', ['- issues: Problem[]'], ['+ checkResolution()', '+ checkColorSpace()', '+ generateReport()']),
        (2, 2, 3.5, 1.6, 'CrossPreviewView', ['- dividerPosition: number', '- opacity: number'], ['+ renderSideBySide()', '+ renderOverlay()']),
        (6.5, 2, 3.5, 1.6, 'ProfileSelector', ['- selectedProfile: string'], ['+ onProfileChange()']),
        (11, 2, 3.5, 1.6, 'ViewingConditionsPanel', ['- lightSource: string', '- viewingDistance: number'], ['+ onConditionsChange()']),
    ]

    for x, y, w, h, name, attrs, methods in classes:
        # Class box
        rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                               boxstyle="round,pad=0.02,rounding_size=0.1",
                               facecolor='#E3F2FD', edgecolor='#1565C0', linewidth=2)
        ax.add_patch(rect)

        # Class name header
        header_rect = Rectangle((x - w/2, y + h/2 - 0.4), w, 0.4, facecolor='#1565C0', edgecolor='#1565C0')
        ax.add_patch(header_rect)
        ax.text(x, y + h/2 - 0.2, name, ha='center', va='center', fontsize=9, fontweight='bold', color='white')

        # Attributes
        attr_text = '\n'.join(attrs)
        ax.text(x - w/2 + 0.1, y + h/2 - 0.6, attr_text, fontsize=7, va='top', family='monospace')

        # Methods
        method_text = '\n'.join(methods)
        ax.text(x - w/2 + 0.1, y - h/2 + 0.2, method_text, fontsize=7, va='bottom', family='monospace', color='#333')

        # Divider line
        ax.plot([x - w/2, x + w/2], [y - h/2 + 0.3, y - h/2 + 0.3], color='#1565C0', linewidth=1)

    # Relationships
    # ProjectStore -> ImageProcessor
    ax.annotate('', xy=(3.75, 7.5), xytext=(3.75, 8.1),
                arrowprops=dict(arrowstyle='->', color='#424242', lw=1.5))
    ax.text(4.2, 7.9, 'uses', fontsize=8, style='italic')

    # ColorStore -> ColorEngine
    ax.annotate('', xy=(8.25, 7.5), xytext=(8.25, 8.1),
                arrowprops=dict(arrowstyle='->', color='#424242', lw=1.5))
    ax.text(8.7, 7.9, 'uses', fontsize=8, style='italic')

    # PrintChecker -> ColorEngine
    ax.annotate('', xy=(12.75, 6.3), xytext=(9.75, 6.3),
                arrowprops=dict(arrowstyle='->', color='#424242', lw=1.5))
    ax.text(11.2, 6.5, 'uses', fontsize=8, style='italic')

    # CrossPreviewView -> ImageProcessor
    ax.annotate('', xy=(3.75, 4.2), xytext=(3.75, 4.6),
                arrowprops=dict(arrowstyle='->', color='#424242', lw=1.5))
    ax.text(4.2, 4.5, 'uses', fontsize=8, style='italic')

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/10_class_diagram.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图11: 色彩实验室系统活动图 ============
def create_activity_color_lab():
    """Color Lab activity diagram"""
    fig, ax = plt.subplots(1, 1, figsize=(11, 10))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 12)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(5.5, 11.5, '图11 色彩实验室系统活动图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Start
    draw_oval(ax, 5.5, 10.5, 1.8, 0.6, COLORS['start_end'], '开始', 10)

    # Activities
    activities = [
        (5.5, 9.5, '导入图像文件'),
        (5.5, 8.3, '选择ICC配置文件'),
        (5.5, 7.1, '点击"分析"按钮'),
        (5.5, 5.9, '系统读取图像像素'),
        (5.5, 4.7, 'RGB转CMYK转换'),
        (5.5, 3.5, '计算ΔE和色域判断'),
        (5.5, 2.3, '显示分析结果'),
    ]

    for x, y, text in activities:
        draw_rounded_rect(ax, x, y, 3, 0.8, COLORS['process'], text, 9)

    # Decision
    draw_diamond(ax, 5.5, 6.5, 1.4, COLORS['decision'], '色域内?', 8)

    # End
    draw_oval(ax, 5.5, 1.2, 1.8, 0.6, COLORS['start_end'], '结束', 10)

    # Arrows
    draw_arrow(ax, (5.5, 10.2), (5.5, 9.9))
    draw_arrow(ax, (5.5, 9.1), (5.5, 8.7))
    draw_arrow(ax, (5.5, 7.9), (5.5, 7.5))
    draw_arrow(ax, (5.5, 6.8), (5.5, 6.5))
    draw_arrow(ax, (5.5, 5.9), (5.5, 5.3))
    draw_arrow(ax, (5.5, 4.3), (5.5, 3.9))
    draw_arrow(ax, (5.5, 2.9), (5.5, 2.7))

    # Yes path
    ax.text(6.5, 6.5, '是', fontsize=8, color='green')
    ax.annotate('', xy=(6.5, 5.9), xytext=(6.2, 6.5),
                arrowprops=dict(arrowstyle='->', color='green', lw=1.5))

    # No path
    ax.text(3, 6.5, '否', fontsize=8, color='red')
    draw_rounded_rect(ax, 1.5, 6.5, 2, 0.6, '#FFCDD2', '显示警告', 8, '#B71C1C')
    ax.annotate('', xy=(2.5, 6.5), xytext=(4.8, 6.5),
                arrowprops=dict(arrowstyle='->', color='red', lw=1.5))
    draw_line(ax, (1.5, 6.8), (1.5, 7.5))
    draw_arrow(ax, (1.5, 7.5), (3, 7.5))
    draw_line(ax, (3, 7.5), (3, 5.9))
    draw_arrow(ax, (3, 5.9), (4, 5.9))

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/11_activity_color_lab.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图12: 跨媒介预览系统顺序图 ============
def create_sequence_cross_preview():
    """Cross Preview sequence diagram"""
    fig, ax = plt.subplots(1, 1, figsize=(12, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 12)
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(7, 11.5, '图12 跨媒介预览系统顺序图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Lifelines
    lifelines = [
        (2, '用户'),
        (4.5, 'CrossPreview'),
        (7, 'ViewingConditionsPanel'),
        (9.5, 'ImageProcessor'),
        (12, 'Zustand Store'),
    ]

    for x, name in lifelines:
        ax.plot([x, x], [1, 10], color='#424242', linewidth=1.5)
        rect = Rectangle((x-0.8, 10), 1.6, 0.5, facecolor='#E3F2FD', edgecolor='#1565C0', linewidth=1)
        ax.add_patch(rect)
        ax.text(x, 10.25, name, ha='center', va='center', fontsize=8, fontweight='bold')

    # Messages
    messages = [
        (2, 9.5, 4.5, 9.5, '1. 选择观察条件'),
        (4.5, 9, 7, 9, '2. onChange'),
        (7, 8.5, 9.5, 8.5, '3. getOptions()'),
        (9.5, 8, 12, 8, '4. getState()'),
        (12, 7.5, 9.5, 7.5, '5. return options'),
        (9.5, 7, 7, 7, '6. return preview'),
        (4.5, 6.5, 2, 6.5, '7. render(preview)'),
    ]

    for x1, y1, x2, y2, label in messages:
        if x1 < x2:
            ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                       arrowprops=dict(arrowstyle='->', color='#1976D2', lw=1.5))
        else:
            ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                       arrowprops=dict(arrowstyle='<-', color='#1976D2', lw=1.5))
        ax.text((x1+x2)/2, y1+0.15, label, fontsize=7, ha='center', color='#333')

    # Activation boxes (simplified as lines)
    ax.plot([4.5, 4.5], [9.3, 6.7], color='#FFC107', linewidth=3, alpha=0.5)
    ax.plot([9.5, 9.5], [8.3, 7.2], color='#FFC107', linewidth=3, alpha=0.5)

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/12_sequence_cross_preview.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图13: 数据库表关系图 ============
def create_database_diagram():
    """Database relationship diagram"""
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(7, 9.5, '图13 数据库表间关系图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Tables
    tables = [
        (2, 7, 'users', ['id (PK)', 'username', 'email', 'hashed_password'], '#E3F2FD'),
        (6, 7, 'profiles', ['id (PK)', 'name', 'type', 'description'], '#E8F5E9'),
        (10, 7, 'projects', ['id (PK)', 'user_id (FK)', 'name', 'created_at'], '#FFF3E0'),
        (4, 4, 'images', ['id (PK)', 'project_id (FK)', 'width', 'height', 'data'], '#F3E5F5'),
        (10, 4, 'analyses', ['id (PK)', 'image_id (FK)', 'deltaE', 'is_in_gamut'], '#E0F7FA'),
    ]

    for x, y, name, cols, color in tables:
        w, h = 3, 1.2 + len(cols) * 0.25
        rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle="round,pad=0.02,rounding_size=0.1",
                              facecolor=color, edgecolor='#424242', linewidth=1.5)
        ax.add_patch(rect)

        # Header
        header = Rectangle((x - w/2, y + h/2 - 0.35), w, 0.35, facecolor='#424242')
        ax.add_patch(header)
        ax.text(x, y + h/2 - 0.17, name, ha='center', va='center', fontsize=9, fontweight='bold', color='white')

        # Columns
        for i, col in enumerate(cols):
            ax.text(x - w/2 + 0.1, y + h/2 - 0.5 - i*0.25, col, fontsize=7, family='monospace')

    # Relationships
    # users -> projects
    ax.annotate('', xy=(9.1, 6.7), xytext=(3.9, 6.7),
                arrowprops=dict(arrowstyle='->', color='#424242', lw=1.5))
    ax.text(6.5, 7.1, '1:N', fontsize=8)

    # users -> profiles (many-to-many shown as separate)
    ax.annotate('', xy=(5.1, 6.7), xytext=(3.9, 7.3),
                arrowprops=dict(arrowstyle='->', color='#424242', lw=1.5))

    # projects -> images
    ax.annotate('', xy=(4, 5.2), xytext=(9.1, 5.3),
                arrowprops=dict(arrowstyle='->', color='#424242', lw=1.5))
    ax.text(6.5, 5.1, '1:N', fontsize=8)

    # images -> analyses
    ax.annotate('', xy=(9.1, 4.7), xytext=(5.9, 4.7),
                arrowprops=dict(arrowstyle='->', color='#424242', lw=1.5))
    ax.text(7.5, 5.1, '1:N', fontsize=8)

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/13_database_diagram.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# ============ 图14: 用户角色权限图 ============
def create_rbac_diagram():
    """Role-based access control diagram"""
    fig, ax = plt.subplots(1, 1, figsize=(12, 7))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 9)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg'])
    fig.patch.set_facecolor(COLORS['bg'])

    ax.text(6, 8.5, '图14 角色权限示意图', ha='center', va='center', fontsize=14, fontweight='bold')

    # Roles (left side)
    roles = [
        (2, 6.5, '游客', '#9E9E9E'),
        (2, 4.5, '用户', '#1976D2'),
        (2, 2.5, '管理员', '#D32F2F'),
    ]

    for x, y, name, color in roles:
        draw_oval(ax, x, y, 2, 1, color, name, 11)

    # Permissions (right side)
    permissions = [
        (9, 7, '浏览知识中心', '#4CAF50'),
        (9, 5.5, '色彩分析', '#4CAF50'),
        (9, 4, '跨媒介预览', '#4CAF50'),
        (9, 2.5, '打印检测', '#4CAF50'),
        (9, 1, '系统管理', '#D32F2F'),
    ]

    for x, y, name, color in permissions:
        draw_rounded_rect(ax, x, y, 2.5, 0.7, color, name, 9)

    # Permission lines
    # Guest -> 浏览知识中心
    draw_line(ax, (3, 6.2), (7.75, 7))
    ax.plot([3, 3], [6.2, 7], 'g--', linewidth=1, alpha=0.5)

    # User -> all green
    for y in [5.5, 4, 2.5]:
        draw_line(ax, (3, 4.8), (7.75, y))
    ax.plot([3, 3], [4.8, 2.5], 'b--', linewidth=1, alpha=0.3)

    # Admin -> all
    for y in [7, 5.5, 4, 2.5, 1]:
        draw_line(ax, (3, 2.8), (7.75, y))

    # Legend
    ax.text(6, 0.5, '实线: 有权限    虚线: 部分权限', fontsize=9, ha='center', style='italic')

    plt.tight_layout()
    path = f'{OUTPUT_DIR}/14_rbac_diagram.png'
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'])
    plt.close()
    print(f"Created: {path}")

# Main execution
if __name__ == '__main__':
    print("Generating PrintBridge diagrams...")

    # Flowcharts
    create_system_overview()
    create_image_import_flow()
    create_color_analysis_flow()
    create_cross_preview_flow()
    create_function_overview()

    # Use case diagrams
    create_usecase_color_lab()
    create_usecase_cross_preview()
    create_usecase_print_adapter()
    create_usecase_knowledge_hub()

    # Class diagram
    create_class_diagram()

    # Activity diagrams
    create_activity_color_lab()

    # Sequence diagrams
    create_sequence_cross_preview()

    # Database diagram
    create_database_diagram()

    # RBAC diagram
    create_rbac_diagram()

    print(f"\nAll diagrams saved to: {OUTPUT_DIR}")
    print("Files created:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        print(f"  - {f}")
