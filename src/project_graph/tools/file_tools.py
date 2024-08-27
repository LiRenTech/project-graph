import platform
import subprocess
from pathlib import Path

from PyQt5.QtWidgets import QMessageBox


def read_file(path: Path) -> str:
    print("开始读取文件", path)
    try:
        return path.read_text("utf-8")
    # 文件不存在
    except FileNotFoundError:
        QMessageBox.critical(
            None, "无法打开文件", "文件不存在，请检查路径是否正确。", QMessageBox.Ok
        )
        return ""
    # 解码错误
    except UnicodeDecodeError:
        QMessageBox.critical(
            None, "无法打开文件", "文件编码错误，请使用UTF-8编码。", QMessageBox.Ok
        )
        return ""
    # 没有权限
    except PermissionError:
        # 尝试提权
        if platform.system() == "Linux":
            # 使用pkexec
            cmd_result = subprocess.run(
                ["pkexec", "cat", path.as_posix()], capture_output=True
            )
            print("pkexec读取文件完成", cmd_result.stdout, type(cmd_result.stdout))
            return cmd_result.stdout.decode("utf-8")
        QMessageBox.critical(
            None, "无法打开文件", "没有权限打开文件，请检查权限。", QMessageBox.Ok
        )
        return ""
