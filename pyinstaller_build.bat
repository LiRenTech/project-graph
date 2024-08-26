@echo off
REM 获取批处理文件所在的目录路径
set "PROJECT_DIR=%~dp0"

REM 切换到项目目录
cd /d "%PROJECT_DIR%"

REM 输出当前路径
echo current path: %cd%

REM 激活虚拟环境
call .\.venv\Scripts\activate

REM 输出激活虚拟环境的提示
echo activate virtual environment: %cd%

REM 运行PyInstaller命令
pyinstaller --onefile --windowed --icon=./assets/favicon.ico main.py -n project-graph

REM 提示结束
echo build project-graph finished.

REM 暂停以查看输出
pause
