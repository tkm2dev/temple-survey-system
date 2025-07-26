@echo off
echo Running database migration to add user fields...
echo.

REM Try to find MySQL in common installation paths
set MYSQL_PATH=""

if exist "C:\xampp\mysql\bin\mysql.exe" (
    set MYSQL_PATH="C:\xampp\mysql\bin\mysql.exe"
    echo Found MySQL in XAMPP
) else if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    echo Found MySQL Server 8.0
) else if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
    echo Found MySQL Server 5.7
) else (
    echo MySQL not found in common paths.
    echo Please run the migration manually using phpMyAdmin or MySQL Workbench
    echo See MIGRATION_INSTRUCTIONS.md for details
    pause
    exit /b 1
)

echo.
echo Enter MySQL root password:
%MYSQL_PATH% -u root -p temple_survey_db_v2 < migration_add_user_fields.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Migration completed successfully!
    echo Please restart your Node.js server.
) else (
    echo.
    echo Migration failed. Please check the error above.
    echo You may need to run the migration manually.
)

echo.
pause
