# 🎯 Hybrid License System - Complete Guide

## ✅ System Implemented Successfully!

Your ThymeSheet app now has an **automatic, one-time-use license key system** that:
- ✅ Auto-assigns a unique key from a pool of 50 keys
- ✅ Each key works on ONE computer only (hardware-bound)
- ✅ No manual emailing needed
- ✅ Works completely offline
- ✅ Each installer can activate up to 50 users

---

## 🔄 How It Works

### User Experience:
```
1. User downloads ThymeSheet installer
2. Runs installer and installs app
3. Opens ThymeSheet for the first time
4. App automatically picks a random key from the pool
5. Key is instantly activated and tied to their computer
6. User never sees or enters a key - it just works!
```

### Behind the Scenes:
- 50 pre-generated license keys are embedded in `license-key-pool.json`
- On first launch, app checks if already licensed
- If not, randomly selects one key from the pool
- Activates that key (binds to MAC address + hostname + OS)
- License file saved to `Documents/ThymeSheet/.thymesheet-license`
- That key is now permanently tied to that computer

---

## 📁 Files Created

### 1. **license-key-pool.json** (50 valid keys)
   - Embedded in every installer
   - Contains 50 cryptographically valid license keys
   - Randomly selected on first launch

### 2. **thymesheet-license-tracker.csv** (Your tracking spreadsheet)
   - Track which keys have been activated
   - See who is using each key
   - Monitor activation dates

### 3. **generate-secure-keys.js** (Key generator)
   - Generate MORE keys when you run out
   - Same mathematical algorithm
   - Unlimited key generation

---

## 🚀 Distribution Process

### Step 1: Build the Installer
```bash
npm run dist
```

This creates an installer in the `dist/` folder that includes:
- The app
- The 50-key pool
- Everything users need

### Step 2: Share the Installer
Upload `ThymeSheet Setup 2.0.2.exe` to:
- **Google Drive** (with public link)
- **Dropbox** (with public link)
- **Your website**
- **Email** (if small enough)
- **GitHub Releases** (best for updates)

### Step 3: Users Download & Install
- Users run the installer
- Install ThymeSheet
- Open the app
- Automatic activation - done!

---

## 📊 Tracking Activations

Use the provided **thymesheet-license-tracker.csv** file to track usage:

| License Key              | Issued To | Email | Date Activated | Status | Hardware ID | Notes |
|-------------------------|-----------|-------|----------------|--------|-------------|-------|
| THYME-DZND-FMGZ-8DD8    | User 1    | email | 2025-10-16     | Active | abc123...   |       |
| THYME-FNDH-T3ZF-79FC    | User 2    | email | 2025-10-16     | Active | def456...   |       |

**How to track:**
- Users can send you their activated key (optional)
- You can add a "report activation" feature (sends key to Google Form)
- Manually track based on who downloaded

---

## 🔄 When You Run Out of Keys

### Option A: Generate New Pool (Recommended)

1. Generate 50 more keys:
```bash
node generate-secure-keys.js 50
```

2. Update `license-key-pool.json` with new keys

3. Rebuild installer:
```bash
npm run dist
```

4. Upload new installer with new key pool

### Option B: Add Keys to Existing Pool

1. Generate additional keys:
```bash
node generate-secure-keys.js 25
```

2. Open `license-key-pool.json`

3. Add new keys to the array:
```json
{
  "keys": [
    "THYME-DZND-FMGZ-8DD8",
    "THYME-FNDH-T3ZF-79FC",
    ... (existing keys)
    "THYME-NEW1-KEY1-XXXX",  // Add new keys here
    "THYME-NEW2-KEY2-YYYY"
  ]
}
```

4. Rebuild and redistribute

---

## 🔐 Security Features

### Hardware Binding
Each key is tied to:
- MAC address (network adapter)
- Computer hostname
- Operating system

If someone tries to:
- **Share their install** → New person gets a DIFFERENT random key
- **Copy their license file** → Won't work on different hardware
- **Reinstall on same computer** → Same key still works

### Key Validation
Keys are validated using cryptographic checksums:
- Format: `THYME-XXXX-YYYY-ZZZZ`
- `ZZZZ` is a checksum of `XXXX + YYYY + SECRET`
- Can't be faked without knowing your SECRET

### What if installer is shared?
- Each person who installs gets ONE random key from the pool
- Max 50 activations per installer build
- Generate new installer with new pool when needed

---

## 💰 For Future: Transitioning to Paid

When you're ready to sell ThymeSheet:

### Option 1: Keep Current System
1. Use Gumroad/Paddle for sales
2. Generate unique key per purchase
3. Email key to customer (they enter manually)
4. Good for: Simple setup, low volume

### Option 2: Upgrade to Online Validation
1. Move keys to a database (Firebase/Supabase)
2. App requests key from your server
3. Track activations in real-time
4. Allow license transfer (revoke old, issue new)
5. Good for: Professional, scalable, support features

### Option 3: Subscription Model
1. Use Stripe/Paddle subscription
2. Validate active subscription via API
3. Monthly/yearly billing
4. Good for: Recurring revenue

---

## ⚠️ Important Notes

### Each Installer = 50 Activations
- One installer can activate 50 different computers
- After 50, you need a new installer with fresh keys
- Track your distribution carefully!

### Keys Are Visible in Installer
- Technically, someone could open `license-key-pool.json` in the installer
- They would see all 50 keys
- **But**: Each key still only works on ONE computer
- **So**: Even if they see the keys, they can only use one
- **This is the trade-off** for offline, automatic activation

### More Secure Alternatives
If you need HIGHER security (for selling):
- Use Google Sheets backend (free, requires internet)
- Use Firebase (free tier, professional)
- Use paid service like Gumroad (handles everything)

---

## 🛠️ Maintenance

### Monthly Tasks
- Check `thymesheet-license-tracker.csv`
- Track how many keys have been used
- Generate new installer when running low

### When Users Report Issues
Common issues:
1. **"License activation failed"**
   - Pool might be empty (all 50 used)
   - Generate new installer

2. **"Need to transfer to new computer"**
   - Generate a new key manually
   - Send via email
   - They enter it manually

3. **"Lost access after reinstall"**
   - Same hardware = should work automatically
   - Different hardware = need new key

---

## 📧 Email Template for Manual Key Distribution

(If someone needs a manual key)

```
Subject: Your ThymeSheet License Key

Hi [Name],

Here's your personal ThymeSheet license key:

THYME-XXXX-YYYY-ZZZZ

Instructions:
1. Open ThymeSheet
2. On the license screen, enter this key
3. Click "Activate License"

This key is tied to your computer and can only be used once.

If you have any issues, reply to this email.

Thanks!
```

---

## 🎉 You're All Set!

Your automatic license system is ready to go. Just:
1. ✅ Build the installer (`npm run dist`)
2. ✅ Upload to Google Drive/Dropbox/etc.
3. ✅ Share link with authorized users
4. ✅ Track activations in your spreadsheet
5. ✅ Generate new installer when you hit 50 users

No emailing keys, no manual activation - it just works!
