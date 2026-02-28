@echo off
REM Simple helper to run Flask-Migrate initial migration (Windows)
REM Ensure your venv is activated and dependencies are installed.

set FLASK_APP=app.py
set FLASK_ENV=development

REM Initialize migrations (run only once)
flask db init || echo migrations already initialized

REM Generate an initial migration
flask db migrate -m "initial" || echo migration step failed

REM Apply migrations to the database
flask db upgrade || echo upgrade step failed

echo Migration steps complete.
pause
