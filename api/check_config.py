"""
Simple script to verify MongoDB URI is loaded correctly
"""

import os
from dotenv import load_dotenv

# Load environment variables
if os.path.exists("mongodb.env"):
    load_dotenv("mongodb.env")

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DATABASE")

print("MongoDB Configuration Check")
print("=" * 60)
print(f"URI loaded: {uri is not None}")
if uri:
    # Mask the password for security
    if "@" in uri:
        parts = uri.split("@")
        creds = parts[0].split("://")[1]
        if ":" in creds:
            user, pwd = creds.split(":", 1)
            masked_uri = uri.replace(pwd, "***")
            print(f"URI: {masked_uri}")
            print(f"Username: {user}")
            print(f"Password length: {len(pwd)} characters")
        else:
            print(f"URI: {uri}")
    else:
        print(f"URI: {uri}")
else:
    print("ERROR: MONGODB_URI not found!")

print(f"Database: {db_name}")
print("=" * 60)
