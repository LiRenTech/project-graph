from pathlib import Path

import PyInstaller.__main__
from PyQt5 import pyrcc_main


def main():
    # 项目根目录，不是src
    path = Path(__file__).parent
    # 创建临时文件
    with open(path / "src" / "_package.py", "w") as f:
        f.write(
            "from project_graph.__main__ import main\nif __name__ == '__main__': main()"
        )
    # 生成assets
    (path / "src" / "project_graph" / "assets" / "image.rcc").unlink(True)
    pyrcc_main.processResourceFile(
        [(path / "src" / "project_graph" / "assets" / "image.rcc").as_posix()],
        (path / "src" / "project_graph" / "assets" / "assets.py").as_posix(),
        False,
    )
    # 打包
    PyInstaller.__main__.run(
        [
            "--onefile",
            "--windowed",
            f"--icon={path / 'src' / 'project_graph' / 'assets' / 'favicon.ico'}",
            "--hidden-import=PyQt5",
            "-n",
            "project-graph",
            (path / "src" / "_package.py").as_posix(),
        ]
    )
    # 删除临时文件
    (path / "src" / "_package.py").unlink()
