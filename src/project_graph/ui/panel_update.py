import platform
import shutil
import subprocess
import zipfile
from pathlib import Path

import dateutil.parser
import httpx
from PyQt5.QtCore import QThread, pyqtSignal
from PyQt5.QtGui import QCloseEvent, QFont
from PyQt5.QtWidgets import (
    QCommandLinkButton,
    QDialog,
    QLabel,
    QMessageBox,
    QSizePolicy,
    QVBoxLayout,
)

from project_graph import INFO


class UpdateCheckThread(QThread):
    update_available = pyqtSignal(str, str)  # 新版本信号
    no_update = pyqtSignal()  # 无更新信号
    error_occurred = pyqtSignal(str)  # 错误信号
    stop_thread = False  # 添加一个标志位来控制线程停止

    def run(self):
        try:
            commit_info = httpx.get(
                "https://api.github.com/repos/LiRenTech/project-graph/commits/master"
            ).json()
            sha = commit_info["sha"]
            message = commit_info["commit"]["message"]
            if sha == INFO.commit:
                self.no_update.emit()
            else:
                self.update_available.emit(sha, message)
        except Exception as e:
            if not self.stop_thread:
                self.error_occurred.emit(str(e))

    def stop(self):
        self.stop_thread = True
        self.quit()
        self.wait()


class UpdateThread(QThread):
    log_signal = pyqtSignal(str)  # 输出日志信号
    finished_signal = pyqtSignal(int)  # 更新完成信号
    stop_thread = False  # 添加一个标志位来控制线程停止

    def run(self):
        try:
            current_system = platform.system()

            if current_system == "Linux":
                self.log_signal.emit("正在运行 Linux 更新脚本...")
                command = "curl -sL https://raw.githubusercontent.com/LiRenTech/project-graph/master/install.sh | pkexec sh"
                process = subprocess.Popen(
                    command,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                )

                while True:
                    if self.stop_thread:
                        process.terminate()
                        self.log_signal.emit("更新已中止")
                        return

                    assert process.stdout is not None
                    output = process.stdout.readline()
                    if output == "" and process.poll() is not None:
                        break
                    if output:
                        self.log_signal.emit(output.strip())
                    assert process.stderr is not None
                    error = process.stderr.readline()
                    if error:
                        self.log_signal.emit(error.strip())

                exit_code = process.poll()
                if exit_code == 0:
                    self.log_signal.emit("Linux 更新成功！请重启应用")
                    self.finished_signal.emit(0)
                else:
                    self.log_signal.emit(f"更新失败，退出代码: {exit_code}")
                    self.finished_signal.emit(exit_code)

            # TODO: Windows 更新功能待测试
            elif current_system == "Windows":
                self.log_signal.emit("正在下载 Windows 更新包...")

                # 使用 httpx 下载 zip 文件
                url = "https://nightly.link/LiRenTech/project-graph/workflows/package/master/project-graph_windows.zip"
                zip_file_path = Path(__file__).parent / "project-graph_windows.zip"

                with httpx.stream("GET", url) as response:
                    with open(zip_file_path, "wb") as f:
                        for chunk in response.iter_bytes():
                            f.write(chunk)

                self.log_signal.emit("下载完成，正在解压...")

                # 解压缩文件
                with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
                    zip_ref.extractall(Path(__file__).parent)

                exe_source = Path(__file__).parent / "project-graph.exe"
                exe_dest = Path(__file__).parent / "project-graph_new.exe"

                if exe_source.exists():
                    # 移动解压后的 exe 文件
                    shutil.move(exe_source, exe_dest)
                    self.log_signal.emit(f"Windows 更新成功！新版本已保存至 {exe_dest}")
                    self.finished_signal.emit(0)
                else:
                    self.log_signal.emit("未找到更新文件，更新失败")
                    self.finished_signal.emit(1)

            elif current_system == "Darwin":  # macOS 系统
                self.log_signal.emit("macOS 不支持更新。")
                self.finished_signal.emit(1)

            else:
                self.log_signal.emit(f"未知系统：{current_system}，不支持更新。")
                self.finished_signal.emit(1)

        except Exception as e:
            self.log_signal.emit(f"更新出错: {str(e)}")
            self.finished_signal.emit(1)

    def stop(self):
        self.stop_thread = True
        self.quit()
        self.wait()


def show_update_panel():
    dialog = QDialog()
    dialog.setWindowTitle("project-graph 更新")

    layout = QVBoxLayout(dialog)
    layout.setContentsMargins(10, 10, 10, 10)

    label_cur = QLabel(dialog)
    label_cur.setText(
        f"当前版本: {INFO.commit}\n发布日期: {dateutil.parser.parse(INFO.date).strftime('%Y-%m-%d %H:%M:%S')}"
    )
    layout.addWidget(label_cur)

    label_new = QLabel(dialog)
    label_new.setText("正在检查更新...")
    label_new.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
    layout.addWidget(label_new)

    label_log = QLabel(dialog)
    log_font = QFont()
    log_font.setStyleHint(QFont.StyleHint.Monospace)
    label_log.setFont(log_font)
    layout.addWidget(label_log)

    button_update = QCommandLinkButton("更新")
    button_update.setEnabled(False)
    layout.addWidget(button_update)

    def handle_update_available(sha, message):
        label_new.setText(f"发现新版本，版本号：{sha}\n更新内容：{message}")
        button_update.setEnabled(True)

    def handle_no_update():
        label_new.setText("当前已是最新版本")
        button_update.setEnabled(True)

    def handle_error(error_message):
        label_new.setText(f"检查更新时出错: {error_message}")

    def update():
        reply = QMessageBox.question(
            None,
            "确认更新",
            "点击确认后会更新到最新版本，更新时不要关闭应用",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No,
        )
        if reply == QMessageBox.No:
            return

        def handle_log(log_message):
            label_log.setText(label_log.text() + log_message + "\n")

        def handle_update_finished(exit_code):
            QMessageBox.information(
                None, "更新完成", f"更新完成，退出代码: {exit_code}"
            )
            button_update.setEnabled(True)

        update_thread = UpdateThread()
        update_thread.log_signal.connect(handle_log)
        update_thread.finished_signal.connect(handle_update_finished)
        button_update.setEnabled(True)
        label_log.clear()
        update_thread.start()

        # 在对话框关闭时停止更新线程
        dialog.update_thread = update_thread

    button_update.clicked.connect(update)

    check_thread = UpdateCheckThread()
    check_thread.update_available.connect(handle_update_available)
    check_thread.no_update.connect(handle_no_update)
    check_thread.error_occurred.connect(handle_error)

    check_thread.start()

    # 在对话框关闭时停止线程
    def closeEvent(a0: QCloseEvent | None):
        assert a0 is not None
        check_thread.stop()
        if hasattr(dialog, "update_thread"):
            dialog.update_thread.stop()
        a0.accept()

    dialog.closeEvent = closeEvent

    dialog.exec_()
