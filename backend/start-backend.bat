@echo off
cd /d "%~dp0"
echo Starting backend server...
mvn spring-boot:run
pause

