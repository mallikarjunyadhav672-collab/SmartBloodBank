#!/usr/bin/env python
"""
Quick database reset script - deletes old database and creates fresh one
"""
import os
import time

db_path = r"c:\Smart BloodBank\backend\instance\smartblood.db"

# Try multiple times to delete the database
print("Attempting to delete old database...")
for attempt in range(5):
    try:
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"✓ Database deleted successfully on attempt {attempt + 1}")
            break
    except PermissionError:
        print(f"✗ Attempt {attempt + 1} failed (still locked). Waiting...")
        time.sleep(1)
    except Exception as e:
        print(f"✗ Error: {e}")

# Verify it's deleted
if not os.path.exists(db_path):
    print("✓ Database file confirmed deleted!")
    print("\nNOW DO THIS:")
    print("1. Stop your Flask server completely (Ctrl+C)")
    print("2. Run: python reset_db.py (this script)")
    print("3. Delete 'c:\\Smart BloodBank\\backend\\instance\\smartblood.db' manually if it exists")
    print("4. Restart Flask: python app.py")
    print("5. Try creating a blood bank again")
else:
    print("✗ Database still exists - Flask server may still be running")
    print("Please close all Python processes and try again")
