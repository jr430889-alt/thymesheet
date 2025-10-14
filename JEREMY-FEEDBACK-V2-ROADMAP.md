# Jeremy's Time Tracker V2 - Roadmap
*Based on real user feedback from Jeremy*

## 🚀 New App Name Ideas
- **TimeShift Pro**
- **ClockWise**
- **TimeCraft**
- **ChronoTrack**
- **FlowTime**
- **ProjectPulse**

## 📋 V2 Feature Roadmap

### 🔧 Installation & UX Improvements
- [ ] **Progress Bar for Installation** - Show npm install progress with percentage
- [ ] **Better Status Messages** - "Installing dependencies... 45% complete"
- [ ] **Installation Time Estimate** - "This usually takes 3-5 minutes"
- [ ] **Faster Setup** - Pre-bundle dependencies or use smaller packages

### 📊 Manual Time Entry & Editing
- [ ] **Manual Time Entry Form** - Add time retroactively
- [ ] **Edit Existing Entries** - Click to edit any time entry
- [ ] **Time Entry Validation** - Prevent overlapping entries
- [ ] **Bulk Time Entry** - Add multiple entries at once

### 📝 Project Management Enhancements
- [ ] **Restructured Project Code Fields** - Replace single category field with four intuitive fields:
  - Project/Admin Name
  - Project/Admin Code
  - Task Code
  - Description
  - *This allows consultants to organize codes by project/admin and task, replacing the current workaround of putting project names in the category field*
- [ ] **Bulk Project Import** - CSV upload for project codes
- [ ] **Project Templates** - Common project types
- [ ] **Project Categories** - Group similar projects
- [ ] **Project Search/Filter** - Find projects quickly

### 🧭 Better Navigation
- [ ] **Tabbed Interface** - Projects | Tracking | Reports | Settings
- [ ] **Dashboard Homepage** - Quick overview when app opens
- [ ] **Breadcrumb Navigation** - Always know where you are
- [ ] **Quick Actions Menu** - Right-click context menus

### 📋 Notes & Descriptions
- [ ] **Time Entry Notes** - Add descriptions to each entry
- [ ] **Note Templates** - Common meeting types, tasks
- [ ] **Notes in Exports** - Include notes in CSV/Excel exports
- [ ] **Search by Notes** - Find entries by description

### 📈 Advanced Exports
- [ ] **Custom Date Ranges** - Export any time period
- [ ] **Project Filtering** - Export specific projects only
- [ ] **Multiple Formats** - CSV, XLSX, PDF, JSON
- [ ] **Export Templates** - Different layouts for different clients
- [ ] **Scheduled Exports** - Auto-export weekly/monthly

### 📊 Dashboard & Analytics
- [ ] **Visual Dashboard** - Charts and graphs
- [ ] **Time Distribution** - Hours by project (pie charts)
- [ ] **Trend Analysis** - Daily/weekly/monthly patterns
- [ ] **Goal Tracking** - Set and monitor hour targets
- [ ] **Productivity Insights** - Peak working hours, patterns

### ⚡ Performance & Polish
- [ ] **Faster Startup** - Optimize app load time
- [ ] **Better Error Handling** - Graceful failure recovery
- [ ] **Keyboard Shortcuts** - More hotkeys for power users
- [ ] **Dark Mode** - Eye-friendly nighttime theme
- [ ] **Backup/Sync** - Cloud backup options

## 🎯 V2.0 Priority Features
*What to build first based on Jeremy's feedback*

### Phase 1 (Core Improvements)
1. Manual time entry
2. Edit existing entries
3. Better navigation (tabs)
4. Notes on time entries

### Phase 2 (Power Features)
1. Custom date range exports
2. Bulk project import
3. Installation progress bar
4. Basic dashboard

### Phase 3 (Advanced Features)
1. Visual analytics
2. Multiple export formats
3. Advanced filtering
4. Productivity insights

## 💡 Technical Considerations for V2
- **Database Upgrade** - Move from localStorage to SQLite for better data handling
- **UI Framework** - Consider React with Material-UI or Ant Design for better components
- **State Management** - Redux or Zustand for complex state
- **Export Engine** - Dedicated library for advanced export features
- **Chart Library** - Chart.js or D3.js for analytics dashboard

## 🎉 Jeremy's Favorite Features to Keep
- ✅ Global hotkeys (Ctrl+Shift+X, Ctrl+Shift+Space)
- ✅ System tray integration
- ✅ One-click project switching
- ✅ Clean, simple interface
- ✅ No-fuss time tracking

---

*"Jeremy's feedback shows this went from a simple time tracker to a real productivity tool that he actually wants to use daily. V2 will be a proper professional time tracking application!"*