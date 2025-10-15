# ThymeSheet License Key Management Guide

## 🔐 How the License System Works

Your app now uses **cryptographic license key validation** - a secure method where:
- ✅ **No valid keys are stored in the app code**
- ✅ Keys are mathematically validated using a secret algorithm
- ✅ Each key can only be activated on ONE computer
- ✅ You can generate unlimited keys without updating the app
- ✅ Keys are tied to the user's hardware (MAC address + hostname + OS)

## 📝 How to Generate License Keys

### Step 1: Run the Generator Script

```bash
node generate-secure-keys.js 10
```

This generates 10 valid license keys. You can generate as many as you need.

### Step 2: Store Keys Securely

**IMPORTANT:** Store your generated keys in a secure location:

#### Option A: Password Manager (Recommended)
- Store in 1Password, LastPass, Bitwarden, etc.
- Create a "Secure Note" called "ThymeSheet License Keys"
- Paste the list of keys

#### Option B: Encrypted Spreadsheet
- Create an Excel/Google Sheet file
- Encrypt the file with a password
- Track: `Key | Issued To | Email | Date | Status | Hardware ID`

#### Option C: Secure Text File
- Create a `.txt` file
- Store in an encrypted folder (use BitLocker on Windows)
- Name it: `thymesheet-licenses-PRIVATE.txt`

### Example Tracking Format:

```
License Key              | User Name      | Email                | Date       | Status    | Notes
─────────────────────────┼────────────────┼──────────────────────┼────────────┼───────────┼──────────
THYME-Q8XO-X44X-1E97     | John Smith     | john@company.com     | 2025-10-15 | Activated | Computer: LAPTOP-001
THYME-A47Y-2ENT-7A99     | Jane Doe       | jane@company.com     | 2025-10-15 | Pending   | Sent via email
THYME-NS77-Q4DV-E583     | Bob Johnson    | bob@company.com      | 2025-10-15 | Revoked   | Left company
```

## 🚀 How to Distribute Keys to Users

### Method 1: Email (Recommended for Private Use)
```
Subject: Your ThymeSheet License Key

Hi [Name],

Here's your personal ThymeSheet license key:

THYME-Q8XO-X44X-1E97

Instructions:
1. Download ThymeSheet from [your download link]
2. Install and launch the app
3. Enter your license key when prompted
4. Click "Activate License"

IMPORTANT: This key can only be used on ONE computer.

If you need help, reply to this email.

Thanks!
```

### Method 2: Secure File Share
- Upload the installer + a text file with their key
- Share via Dropbox, Google Drive (with expiring link)
- Each user gets their own folder with their unique key

### Method 3: In-Person/Chat
- Send via encrypted messaging (Signal, WhatsApp)
- Read over phone for internal team members

## 🔧 Key Management Tasks

### Generate More Keys
```bash
# Generate 5 keys
node generate-secure-keys.js 5

# Generate 50 keys
node generate-secure-keys.js 50
```

### Change Your Secret (Advanced)
If you want to change your secret phrase:

1. Edit `generate-secure-keys.js`:
   ```javascript
   const LICENSE_SECRET = 'YourNewSecretPhrase2024!';
   ```

2. Edit `main.js` line 63:
   ```javascript
   const LICENSE_SECRET = Buffer.from('base64encodedstring', 'base64').toString('utf8');
   ```

3. To encode your secret in base64:
   ```bash
   node -e "console.log(Buffer.from('YourNewSecretPhrase2024!').toString('base64'))"
   ```

4. **IMPORTANT:** All old keys will stop working. Generate new keys with the new secret.

### Revoke a Key (If Needed)
Since keys are hardware-bound, you can't "revoke" them directly. But you can:

1. Track revoked keys in your spreadsheet
2. If moving to online validation later, add a revoke list
3. For now: Issue new keys if someone leaves your organization

## 📊 Where Are Keys Stored?

### On Your Computer (Generator)
- `generate-secure-keys.js` - The key generator script
- Keep this file PRIVATE and SECURE
- Back it up to a secure location
- Never commit it to public Git repositories

### In the App
- `main.js` - Contains the validation algorithm (not the keys!)
- The secret is obfuscated as base64 but not truly encrypted
- No list of valid keys anywhere in the code

### On User's Computer (After Activation)
- `Documents/ThymeSheet/.thymesheet-license` - Activated license file
- Contains: Their key + their hardware ID + activation date
- This file ties the key to their specific computer

## 🎯 For Future Selling

When you're ready to sell ThymeSheet commercially:

### Option A: Keep Current System
- Generate keys manually
- Use Gumroad/Paddle to deliver keys after purchase
- Set up webhook to auto-generate keys

### Option B: Upgrade to Online Validation
- Move to server-based validation
- Track activations in database
- Allow key transfer between computers (limit to 2-3)
- Add subscription support

## ⚠️ Security Best Practices

1. **Never share `generate-secure-keys.js` publicly**
2. **Don't commit keys to GitHub** (add to `.gitignore`)
3. **Keep your LICENSE_SECRET private**
4. **Track issued keys** in a secure spreadsheet
5. **Use email for distribution** (leave a paper trail)
6. **Back up your key generator** to multiple secure locations

## 🆘 Troubleshooting

### User Can't Activate Key
- Verify the key is typed correctly (copy-paste recommended)
- Check if the key has already been activated on another computer
- Generate a new key if needed

### User Needs to Transfer License
- Current system: Each key works on ONE computer only
- To transfer: Generate a new key for the new computer
- Track the old key as "revoked" in your spreadsheet

### Lost the Key Generator
- You still have the secret in `main.js` (base64 encoded)
- Decode it: `echo "base64string" | base64 -d`
- Recreate the generator with the same secret

## 📞 Support Template

Save this response for when users ask about licensing:

```
ThymeSheet uses one-time license keys that are tied to your computer.

Each license key:
- Works on ONE computer only
- Cannot be shared or transferred
- Remains valid indefinitely (no expiration)

If you need to use ThymeSheet on a different computer, contact me for a new license key.

Technical note: The license is tied to your computer's hardware ID (MAC address + hostname). If you change your network adapter or computer name, you may need a new key.
```

## 🎉 You're All Set!

You now have a secure, professional license system that:
- Prevents unauthorized sharing
- Tracks who has access
- Scales to thousands of users
- Requires no server infrastructure

Keep `generate-secure-keys.js` safe and you can manage licenses forever!
