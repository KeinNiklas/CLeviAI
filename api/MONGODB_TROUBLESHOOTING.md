# MongoDB Atlas Credential Troubleshooting Guide

## Problem
Authentication fails with error: `bad auth : authentication failed`

## Verified So Far
- ✅ IP address added to Network Access
- ✅ URI format is correct
- ✅ Password URL encoding tested
- ❌ Authentication still fails

## Most Likely Causes

### 1. **Password Mismatch** (Most Common)
The password in MongoDB Atlas doesn't match `MongoZDT`

**How to Fix:**
1. Go to MongoDB Atlas → Database Access
2. Find user `Vercel-Admin-clavidb`
3. Click "Edit" 
4. Click "Edit Password"
5. Set password to: `MongoZDT`
6. Click "Update User"

### 2. **User Doesn't Exist**
The user `Vercel-Admin-clavidb` might not exist

**How to Fix:**
1. Go to MongoDB Atlas → Database Access
2. If user doesn't exist, click "Add New Database User"
3. Authentication Method: Password
4. Username: `Vercel-Admin-clavidb`
5. Password: `MongoZDT`
6. Database User Privileges: "Read and write to any database" (or specific to `cleviaidb`)
7. Click "Add User"

### 3. **Wrong Database Permissions**
User exists but doesn't have access to `cleviaidb`

**How to Fix:**
1. Go to MongoDB Atlas → Database Access
2. Find user `Vercel-Admin-clavidb`
3. Click "Edit"
4. Under "Database User Privileges", ensure:
   - Either "Read and write to any database" is selected
   - OR "Custom Role" with readWrite on `cleviaidb`
5. Click "Update User"

## Alternative: Create New User

If you're unsure about the existing credentials, create a fresh user:

### Step 1: Create New User in MongoDB Atlas
1. Go to Database Access → Add New Database User
2. Username: `cleviaiuser`
3. Password: `CLeviAI2026!` (or your choice)
4. Privileges: "Read and write to any database"
5. Click "Add User"

### Step 2: Update mongodb.env
Replace the content with:
```env
MONGODB_URI=mongodb+srv://cleviaiuser:CLeviAI2026!@clavidb.qkkcbfh.mongodb.net/?retryWrites=true&w=majority&appName=clavidb
MONGODB_DATABASE=cleviaidb
```

### Step 3: Test Connection
```bash
cd api
python test_mongodb.py
```

## Next Steps

1. **Try fixing the existing user first** (Option 1 above)
2. **If that doesn't work, create a new user** (Alternative above)
3. **After fixing, run:**
   ```bash
   python test_mongodb.py
   python migrate_to_mongodb.py
   ```

## Need Help?

If you're still having issues, please share:
- Screenshot of the Database User in MongoDB Atlas (hide the password)
- The exact username you see in MongoDB Atlas
- Whether you created a new password or are using an existing one
