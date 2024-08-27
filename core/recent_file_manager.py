"""
用于打开最近的文件功能
"""

from dataclasses import dataclass
import datetime
import json
from pathlib import Path

from core.app_dir import DATA_DIR


@dataclass
class RecentFile:
    """最近打开的文件"""

    file_path: Path
    last_opened_time: datetime.datetime
    size: int  # 文件大小，以字节为单位

    def dump(self) -> dict:
        """
        将最近打开的文件信息转为字典
        """
        return {
            "file_path": str(self.file_path),
            "last_opened_time": self.last_opened_time.strftime("%Y-%m-%d %H:%M:%S"),
            "size": self.size
        }

    @staticmethod
    def load_from_dict(data: dict) -> "RecentFile":
        """
        从字典中加载最近打开的文件信息
        """
        return RecentFile(
            Path(data["file_path"]),
            datetime.datetime.strptime(data["last_opened_time"], "%Y-%m-%d %H:%M:%S"),
            data["size"]
        )


class RecentFileManager:
    recent_files_list_path = Path(DATA_DIR) / "recent_files_list.json"

    def __init__(self):
        self._recent_files = []

        self.init()

    def init(self) -> None:
        """
        初始化最近文件列表
        """
        if not self.recent_files_list_path.exists():
            init_content = "[]"
            with open(self.recent_files_list_path, "w", encoding="utf-8") as f:
                f.write(init_content)
        else:
            with open(self.recent_files_list_path, "r", encoding="utf-8") as f:
                self._recent_files = [RecentFile.load_from_dict(item) for item in json.load(f)]
            pass

    @property
    def recent_files_list(self) -> list[RecentFile]:
        """
        最近打开的文件列表
        """
        return self._recent_files
    
    def add_recent_file(self, file_path: Path) -> None:
        """
        添加最近打开的文件
        """
        if not file_path.exists():
            return

        recent_file = None
        for item in self._recent_files:
            if item.file_path == file_path:
                recent_file = item
                break

        if recent_file is None:
            recent_file = RecentFile(file_path, datetime.datetime.now(), file_path.stat().st_size)
            self._recent_files.append(recent_file)
        else:
            recent_file.last_opened_time = datetime.datetime.now()

        self._recent_files.sort(key=lambda x: x.last_opened_time, reverse=True)

        with open(self.recent_files_list_path, "w", encoding="utf-8") as f:
            json.dump([item.dump() for item in self._recent_files], f, indent=4)

    pass
