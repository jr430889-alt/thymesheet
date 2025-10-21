# Code Signing Setup Guide

Code signing eliminates Windows security warnings and builds trust with users. Here's how to set it up:

## Step 1: Purchase a Code Signing Certificate

### Recommended Providers:
- **SSL.com** (~$200/year) - Good for individual developers
- **Sectigo/Comodo** (~$150-300/year) - Popular choice
- **DigiCert** (~$400/year) - Premium option
- **SignPath.io** (Free for open source) - Free alternative

### For Open Source Projects (FREE):
If your project is open source, you can apply for free code signing through:
- **SignPath.io** - https://about.signpath.io/product/open-source
- They provide free code signing certificates for open source projects

## Step 2: Obtain Your Certificate

Once you purchase a certificate:
1. Complete the identity verification process (may take 1-7 days)
2. Download your certificate as a `.pfx` or `.p12` file
3. You'll receive a password to protect the certificate

## Step 3: Store Your Certificate

1. Create a `certs` folder in your project root:
   ```bash
   mkdir certs
   ```

2. Copy your certificate file to the `certs` folder and name it `certificate.pfx`

3. **IMPORTANT**: Add `certs/` to your `.gitignore` file to prevent committing your certificate:
   ```bash
   echo "certs/" >> .gitignore
   ```

## Step 4: Set Up Environment Variables

### Option A: Using Environment Variables (Recommended)
Set your certificate password as an environment variable:

**Windows (Command Prompt):**
```cmd
setx CSC_KEY_PASSWORD "your-certificate-password"
```

**Windows (PowerShell):**
```powershell
[Environment]::SetEnvironmentVariable("CSC_KEY_PASSWORD", "your-certificate-password", "User")
```

### Option B: Using package.json
Update the `certificatePassword` field in [package.json](package.json):
```json
"certificatePassword": "your-password-here"
```
**Warning**: This is less secure as the password is in plaintext.

## Step 5: Update package.json

The configuration is already set up in [package.json](package.json):

```json
"win": {
  "certificateFile": "certs/certificate.pfx",
  "certificatePassword": "",
  "signingHashAlgorithms": ["sha256"],
  "signDlls": true
}
```

If using environment variables, keep `certificatePassword` as an empty string.

## Step 6: Build and Publish Signed Releases

### Build Locally (Signed):
```bash
npm run dist-signed
```

### Publish to GitHub (Signed):
```bash
npm run publish-signed
```

### Continue Building Unsigned (For Testing):
```bash
npm run dist
npm run publish
```

## Step 7: Verify Code Signing

After building, verify your executable is signed:
1. Right-click `dist\ThymeSheet-Setup-[version].exe`
2. Select "Properties"
3. Go to the "Digital Signatures" tab
4. You should see your certificate information

## Building Reputation with Windows SmartScreen

Even with code signing, new certificates may still trigger warnings until they build reputation:
- **Standard Certificate**: Warnings may appear for the first few weeks/months
- **EV (Extended Validation) Certificate**: Immediate trust, no warnings (~$300-500/year)
- **Reputation Building**: After enough downloads without issues, Windows trusts your certificate

## Troubleshooting

### "Cannot find certificate file"
- Ensure `certs/certificate.pfx` exists in your project root
- Check the path in package.json is correct

### "Invalid certificate password"
- Verify your `CSC_KEY_PASSWORD` environment variable is set correctly
- Try setting the password directly in package.json temporarily

### "Certificate expired"
- Renew your certificate with your provider
- Update the certificate file in the `certs/` folder

### Still Getting Warnings
- This is normal for new certificates - reputation builds over time
- Consider upgrading to an EV certificate for immediate trust
- Ensure certificate is issued to your company/name that matches your app

## Free Alternative: Self-Signed Certificate

For testing purposes, you can create a self-signed certificate:

```powershell
$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=ThymeSheet" -CertStoreLocation Cert:\CurrentUser\My
$pwd = ConvertTo-SecureString -String "YourPassword" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "certs\certificate.pfx" -Password $pwd
```

**Note**: Self-signed certificates still show warnings but demonstrate the signing process.

---

**Questions?** Check electron-builder docs: https://www.electron.build/code-signing
