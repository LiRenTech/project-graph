"""
此模块仅仅导出一个变量 DATA_DIR，它代表了程序的用户数据目录。

数据目录的具体位置取决于操作系统和用户配置。
"""

# from pathlib import Path

# from appdirs import user_data_dir

from project_graph.liren_side.app import App
from project_graph.logging import log

_APP_NAME = "project-graph"
_APP_AUTHOR = "LiRen"

# DATA_DIR = user_data_dir(_APP_NAME, _APP_AUTHOR)

# log(DATA_DIR)

# # 确保目录存在
# if not Path(DATA_DIR).exists():
#     Path(DATA_DIR).mkdir(parents=True, exist_ok=True)
DATA_DIR = App.get_data_dir(_APP_NAME)
log(DATA_DIR)
