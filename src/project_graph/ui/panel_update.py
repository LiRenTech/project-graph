import platform
from threading import Thread

import dateutil
import dateutil.parser
import httpx
from PyQt5.QtGui import QFont
from PyQt5.QtWidgets import (
    QCommandLinkButton,
    QDialog,
    QLabel,
    QMessageBox,
    QSizePolicy,
    QVBoxLayout,
)

from project_graph import INFO


def show_update_panel():
    dialog = QDialog()
    dialog.setWindowTitle("project-graph 更新")

    # 纵向布局
    layout = QVBoxLayout(dialog)
    layout.setContentsMargins(10, 10, 10, 10)
    # 当前版本信息
    label_cur = QLabel(dialog)
    label_cur.setText(
        f"当前版本: {INFO.commit}\n发布日期: {dateutil.parser.parse(INFO.date).strftime('%Y-%m-%d %H:%M:%S')}"
    )
    layout.addWidget(label_cur)
    # 新版本信息
    label_new = QLabel(dialog)
    label_new.setText("正在检查更新...")
    label_new.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
    layout.addWidget(label_new)
    # 日志信息
    label_log = QLabel(dialog)
    log_font = QFont()
    log_font.setStyleHint(QFont.StyleHint.Monospace)
    label_log.setFont(log_font)
    layout.addWidget(label_log)

    # 按钮
    def update():
        # 确认是否更新
        reply = QMessageBox.question(
            None,
            "确认更新",
            "点击确认后会更新到最新版本，更新时不要关闭应用",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No,
        )
        if reply == QMessageBox.No:
            return

        def _update():
            button_update.setEnabled(False)
            label_log.clear()
            QMessageBox.information(None, "更新完成", "更新完成，退出代码: ?")
            button_update.setEnabled(True)

        Thread(target=_update).start()

    button_update = QCommandLinkButton("更新")
    button_update.setEnabled(False)
    button_update.clicked.connect(update)
    layout.addWidget(button_update)

    dialog.setLayout(layout)

    def check():
        # 调用github api获取最新commit信息
        commit_info = httpx.get(
            "https://api.github.com/repos/LiRenTech/project-graph/commits/master"
        ).json()
        sha = commit_info["sha"]
        message = commit_info["commit"]["message"]
        if sha == INFO.commit:
            label_new.setText("当前已是最新版本")
        # 显示更新信息
        label_new.setText(f"发现新版本，版本号：{sha}\n更新内容：{message}")
        button_update.setEnabled(True)
        if INFO.env == "dev":
            if platform.system() == "Linux":
                label_log.setText(
                    "WARNING: 点击更新后会安装/更新正式版本 (即使用安装脚本安装)"
                )
            else:
                label_log.setText("ERROR: 开发环境无法更新")

    Thread(target=check).start()

    dialog.exec_()
