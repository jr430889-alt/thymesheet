# 🚀 ThymeSheet - Getting Started Guide

**Professional Time Tracking for Consultants**

Welcome to ThymeSheet! This guide will help you get up and running quickly.

---

## 📥 Installation

### Download & Install

1. Download **ThymeSheet Setup 2.0.3.exe** from:
   - GitHub Releases: https://github.com/jr430889-alt/thymesheet/releases/latest
   - Or from the link your administrator provided

2. Run the installer
3. Follow the installation wizard
4. Launch ThymeSheet

### First Launch - Automatic Activation

When you first open ThymeSheet:
- The app automatically activates with a license key
- Your license is tied to this computer only
- No manual key entry needed!
- You'll see the main screen within seconds

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Add Your First Project

When you first open ThymeSheet, you'll see the **Manage Projects** page.

**Option A: Import from CSV**
1. Click **"Import Projects from CSV"**
2. Download the template (if you need one)
3. Fill in your projects:
   ```
   Client Name,Project/Admin Name,Task Code,Subtask Code
   Acme Corp,Website Redesign,1. Development,1.1 Frontend
   Acme Corp,Website Redesign,1. Development,1.2 Backend
   ```
4. Click **"Choose CSV File"** and select your file
5. Click **"Import Projects"**

**Option B: Add Projects Manually**
1. Scroll down to **"Add a project and start tracking"**
2. Fill in the fields:
   - **Client Name**: e.g., "Acme Corp"
   - **Project Name**: e.g., "Website Redesign"
   - **Task Code**: e.g., "1. Development"
   - **Subtask Code**: e.g., "1.1 Frontend"
3. Click **"Add Project"**
4. Repeat for each project/task combination

**Option C: Try Demo Data**
- Click **"Load Demo Data"** to see example projects
- Perfect for testing the app!

### Step 2: Start Tracking Time

1. Click **"Track Time"** in the top navigation
2. Select a project from the dropdown
3. (Optional) Add a comment about what you're working on
4. Click **"Start"** or press **Enter**
5. The timer starts! ⏱️

### Step 3: Stop Tracking

When you're done:
1. Click **"Stop"** or press **Space**
2. Your time entry is automatically saved
3. See it appear in **Recent Time Entries** below

### Step 4: Export Your Hours

1. Go to **"Manage Projects"**
2. Click **"Export Time to CSV"**
3. Set your date range (optional)
4. Click **"Export CSV"**
5. Open in Excel or Google Sheets

---

## 🎨 Interface Overview

### Navigation Bar (Top)
- **ThymeSheet** logo (left)
- **Track Time** - Where you track your hours
- **Manage Projects** - Add/edit projects, export data
- **Settings** ⚙️ - Customize the app
- **Help** ❓ - User guide and feedback
- **Update Available** 🔄 (when updates exist)

### Track Time Page

#### Timer Section
- **Project dropdown** - Select what you're working on
  - ⭐ Recent projects appear at the top
  - All projects below
- **Comment field** - Note what you're doing (optional)
- **Start/Stop button** - Click or press Enter/Space
- **Live timer** - Shows elapsed time (HH:MM:SS)

#### Daily Progress Bar (Optional)
- Shows hours worked today vs. daily goal
- Progress percentage and hours remaining
- Can be toggled off in Settings

#### Time Summary Widget (Optional)
- Collapsible summary box
- Shows:
  - **Today**: Total hours today
  - **This Week**: Total hours this week
  - **This Month**: Total hours this month
- Includes currently running timer
- Can be toggled off in Settings

#### Recent Time Entries
- Last 10 entries shown
- **Search bar** - Filter by client, project, or comment
- **Edit button** ✏️ - Modify hours or comments
- **Delete button** 🗑️ - Remove entry
- Pagination for older entries

#### Keyboard Shortcuts (Collapsible)
- Click to expand/collapse
- Lists all keyboard shortcuts

---

## ⌨️ Keyboard Shortcuts

### Global (Work Anywhere)
- **Ctrl+Shift+Z** - Show/Hide window
- **Ctrl+Shift+Space** - Start/Stop timer

### Track Time Page
- **1-9** - Quick select recent projects (1 = first recent project, etc.)
- **Enter** - Start tracking (works even when typing in fields)
- **Space** - Pause/Resume timer (when not in a text field)

### Settings Menu
- **Ctrl+,** - Open All Settings

---

## ⚙️ Settings & Customization

Access Settings from the gear icon ⚙️ in the top right.

### Time Rounding
Round your time entries automatically:
- **None** - Exact time
- **5 minutes** - Round to nearest 5 (e.g., 1.23h → 1.25h)
- **10 minutes** - Round to nearest 10
- **15 minutes** - Round to nearest 15

### Auto-Pause Detection
Automatically stop timer when idle:
- Enable/disable auto-pause
- Choose idle time: 5, 10, 15, or 30 minutes
- Get prompted when idle time is reached

### Daily Goal
Set a target for hours per day:
- Enable/disable daily goal
- Set hours per day (1-24)
- See progress bar on Track Time page

### Daily Progress
Toggle the progress bar on/off:
- Shows hours worked vs. daily goal
- Displays percentage complete
- Shows hours remaining

### Time Summary Widget
Toggle the time summary box on/off:
- Shows daily/weekly/monthly totals
- Collapsible widget
- Real-time updates

### Full Day Notification
Get notified after working 8 hours:
- One notification per day
- Reminds you to take a break

### Hourly Break Reminder
Get reminded every hour to take a break:
- Notification every hour while tracking
- Encourages regular breaks

---

## 📊 Managing Projects

### View All Projects
- Go to **Manage Projects**
- All projects listed by client/project/task/subtask
- Organized in expandable tree structure

### Edit a Project
1. Click the **Edit** button (✏️) next to a project
2. Update any field
3. Click **"Save Changes"**

### Delete a Project
1. Click the **Delete** button (🗑️) next to a project
2. Confirm deletion
3. Note: Associated time entries remain (won't be deleted)

### Bulk Import
1. Click **"Import Projects from CSV"**
2. Use the template format:
   ```
   Client Name,Project/Admin Name,Task Code,Subtask Code
   ```
3. Select your CSV file
4. Click **"Import Projects"**
5. Projects are added (duplicates are skipped)

### Link to CSV (Advanced)
Link to a master CSV file that auto-updates your projects:
1. Click **"Link to CSV File"**
2. Select your master project list CSV
3. Projects will sync from this file
4. Update the CSV, then click **"Reload from CSV"** in the app

---

## 📤 Exporting Time Data

### Export to CSV

1. Go to **Manage Projects**
2. Click **"Export Time to CSV"**
3. (Optional) Filter by:
   - Date range (start/end dates)
   - Specific client
   - Specific project
4. Click **"Export CSV"**
5. File downloads with name: `thymesheet-export-YYYY-MM-DD.csv`

### CSV Format
Your export includes:
- Date
- Client Name
- Project Name
- Task Code
- Subtask Code
- Hours (decimal format, e.g., 1.5)
- Comment

Perfect for importing into:
- Excel
- Google Sheets
- Billing systems
- Accounting software

---

## 🎯 Best Practices

### Organizing Projects
- Use consistent naming conventions
- Group by client → project → task → subtask
- Keep task codes short and meaningful
- Use subtask codes for detailed breakdowns

**Example Structure:**
```
Acme Corp
  └─ Website Redesign
      └─ 1. Meetings and Delivery
          └─ 1.1 Project Meetings
          └─ 1.2 Internal Meetings
      └─ 2. Design
          └─ 2.1 UI/UX Design
          └─ 2.2 Graphics
      └─ 3. Development
          └─ 3.1 Frontend
          └─ 3.2 Backend
```

### Time Tracking Tips
1. **Start timer immediately** when beginning work
2. **Use comments** to note specific activities
3. **Stop timer** during breaks and lunch
4. **Review Recent Entries** to catch mistakes
5. **Export regularly** (weekly or monthly)
6. **Use auto-pause** to catch forgotten timers

### Comments Best Practices
- Keep them brief but descriptive
- Examples:
  - "Implemented user authentication"
  - "Client meeting - discussed requirements"
  - "Bug fix - login page issue"
  - "Code review"

### Daily Workflow
1. **Morning**: Open ThymeSheet, start timer on first task
2. **Throughout Day**:
   - Switch projects as needed (timer switches automatically)
   - Add comments for important work
   - Take breaks (stop timer)
3. **End of Day**: Review Recent Entries, fix any errors
4. **End of Week/Month**: Export to CSV for billing/reporting

---

## 🔔 Notifications

ThymeSheet includes helpful notifications:

### Auto-Pause Notification
When enabled and you've been idle:
- "You've been idle for X minutes. Do you want to stop the timer?"
- Click "Yes" to stop
- Click "No" to keep timer running

### Full Day Notification
After working 8 hours:
- "🎉 That's a full day's work! You've hit 8 hours. Time to take a break!"
- Shows once per day

### Hourly Break Reminder
Every hour while tracking:
- "💧 Time for a 5-minute break! Go grab a drink of water."
- Encourages healthy work habits

### Update Available
When a new version is released:
- Banner appears at top of app
- Click to download and install update
- Updates happen automatically in the background

---

## 🔄 Updates & Maintenance

### Automatic Updates
ThymeSheet checks for updates automatically:
1. New version detected → banner appears
2. Click "Download Update"
3. Update downloads in background
4. Click "Restart and Install"
5. App restarts with new version

### Your Data is Safe
- All data stored in `Documents/ThymeSheet/`
- Survives updates and reinstalls
- Back up `thymesheet-data.json` for extra safety

### Version Check
To see your current version:
- Open **Settings** (gear icon)
- Look under the "Settings" heading
- Shows: "ThymeSheet v2.0.3"

---

## 💾 Data & Backup

### Where is Your Data Stored?
All data is saved locally on your computer:
- **Location**: `C:\Users\[YourName]\Documents\ThymeSheet\`
- **File**: `thymesheet-data.json`

### Backup Your Data
**Option 1: Manual Backup**
1. Close ThymeSheet
2. Navigate to `Documents\ThymeSheet\`
3. Copy `thymesheet-data.json` to a safe location (USB drive, cloud storage)

**Option 2: Cloud Sync**
- Place a shortcut to ThymeSheet folder in Dropbox/OneDrive
- Automatic cloud backup!

### Restore from Backup
1. Close ThymeSheet
2. Copy your backup `thymesheet-data.json`
3. Paste into `Documents\ThymeSheet\`
4. Open ThymeSheet

---

## 🆘 Troubleshooting

### Timer Won't Start
- Make sure a project is selected from the dropdown
- Check that the app isn't already tracking (look for running timer)
- Try refreshing: Close and reopen the app

### Projects Not Showing
- Go to **Manage Projects**
- Check if projects exist
- Try adding a demo project to test
- If imported from CSV, verify CSV format

### Time Entry Disappeared
- Check **Manage Projects** → **Export Time to CSV**
- Look at specific date range
- Use search in Recent Time Entries

### CSV Import Not Working
- Verify CSV format matches template exactly
- Check for special characters in project names
- Make sure file is saved as .csv (not .xlsx)

### Auto-Pause Not Working
- Enable in **Settings** → **Auto-Pause Detection**
- Move mouse/keyboard to reset idle timer
- Check selected idle time (5-30 minutes)

### Can't See Update Banner
- Updates only show when new version available
- Check manually: Help → Check for Updates (coming soon)
- Current version shown in Settings

### App Won't Open
- Check if another instance is already running
- Look for ThymeSheet icon in system tray
- Restart computer if needed

---

## 📞 Support & Feedback

### Send Feedback
Click the **💬 Feedback** button in the top navigation:
- Bug reports
- Feature requests
- General feedback

### User Guide
Access anytime from **Help** → **User Guide**

### Check Version
**Settings** → Look for "ThymeSheet v2.0.3"

---

## 🎓 Advanced Features

### CSV Project Management
Link to a master CSV file for dynamic project updates:
1. Maintain projects in a shared CSV
2. Link ThymeSheet to this file
3. When CSV updates, click "Reload from CSV"
4. Great for teams with shared project lists

### Keyboard Power User Mode
Master the shortcuts to track time without touching the mouse:
- `1-9` to select recent projects
- `Enter` to start tracking
- `Space` to pause/resume
- `Ctrl+Shift+Z` to minimize app

### Multi-Project Time Tracking
- Track time across multiple clients simultaneously
- Switch projects mid-timer (stops old, starts new)
- Review all tracked time in Recent Entries

---

## 📝 Quick Reference Card

### Most Used Features
| Action | How To |
|--------|--------|
| Start tracking | Select project → Click Start (or press Enter) |
| Stop tracking | Click Stop (or press Space) |
| Switch projects | Select different project while tracking |
| Add comment | Type in comment field before starting |
| Edit entry | Click ✏️ in Recent Time Entries |
| Export hours | Manage Projects → Export Time to CSV |
| Add project | Manage Projects → Fill form → Add Project |
| Import projects | Manage Projects → Import Projects from CSV |
| View settings | Click ⚙️ icon → All Settings |
| Send feedback | Click 💬 Feedback button |

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+Shift+Z | Show/Hide app window |
| Ctrl+Shift+Space | Start/Stop timer |
| 1-9 | Quick select recent projects |
| Enter | Start tracking |
| Space | Pause/Resume (when not in text field) |
| Ctrl+, | Open Settings |

---

## 🎉 You're Ready!

You now know everything you need to track your time professionally with ThymeSheet.

**Next Steps:**
1. Add your real projects
2. Start tracking time today
3. Export your first timesheet
4. Customize settings to your workflow

**Questions?** Send feedback using the 💬 button!

---

**ThymeSheet v2.0.3**
Professional Time Tracking for Consultants
© 2025 Jeremy
