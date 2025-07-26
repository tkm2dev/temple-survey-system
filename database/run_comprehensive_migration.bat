@echo off
echo Running comprehensive database migration...
echo This will fix the users table structure and role enum values.
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
    echo Use the comprehensive_migration.sql file
    pause
    exit /b 1
)

echo.
echo Enter MySQL root password:
%MYSQL_PATH% -u root -p temple_survey_db_v2 < comprehensive_migration.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Migration completed successfully!
    echo.
    echo Next steps:
    echo 1. Restart your Node.js server
    echo 2. Test login with: admin / admin123
    echo 3. Check the application
) else (
    echo.
    echo Migration failed. Please check the error above.
    echo You may need to run the migration manually.
)

echo.
pause
