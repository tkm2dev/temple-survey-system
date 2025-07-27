@echo off
echo ========================================
echo Temple Survey Database Setup
echo ========================================
echo.

echo Creating database and tables...
mysql -u root -p -e "source init.sql"

echo.
echo Adding initial data and users...
mysql -u root -p temple_survey_db_v2 -e "source seed.sql"

echo.
echo ========================================
echo Database setup completed successfully!
echo ========================================
echo.
echo Default login credentials:
echo Username: admin
echo Password: admin123
echo.
echo Test users:
echo - surveyor1 / admin123 (Surveyor role)
echo - reviewer1 / admin123 (Reviewer role)
echo.
pause
