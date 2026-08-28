@echo off
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" call setup_windows.bat
if not exist ".venv\Scripts\python.exe" exit /b 1
".venv\Scripts\python.exe" -m pip install -e ".[build]"
if errorlevel 1 goto :error
".venv\Scripts\pyinstaller.exe" --noconfirm --clean --windowed ^
  --name TPPFingerScan ^
  --collect-all tpp_finger_scan ^
  src\tpp_finger_scan\main.py
if errorlevel 1 goto :error
echo.
echo Build selesai: dist\TPPFingerScan\TPPFingerScan.exe
pause
exit /b 0
:error
echo Build gagal.
pause
exit /b 1
