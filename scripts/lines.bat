@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set totalLines=0

REM 获取当前目录的上级目录
cd ..
set projectDir=%cd%

echo 正在扫描项目目录 %projectDir% 及子目录下的所有 .tsx 文件...


REM 扫描项目目录及子目录下的所有 .tsx 文件，忽略 node_modules 目录
for /r "%projectDir%" %%f in (*.tsx) do (
    echo %%f | findstr /i /c:"node_modules" >nul
    if errorlevel 1 (
        REM 统计每个文件的行数
        for /f %%l in ('find /c /v "" ^< "%%f"') do (
            set lines=%%l
            echo %%f: !lines! 行
            set /a totalLines+=!lines!
        )
    )
)

echo 总行数: %totalLines% 行
pause
endlocal
