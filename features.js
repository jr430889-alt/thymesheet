// Feature flags and tier definitions for ThymeSheet
// Defines which features are available in FREE vs PREMIUM tiers

const FEATURES = {
  // FREE tier features (always available to everyone)
  // Core time tracking
  BASIC_TIMER: 'free',
  MANUAL_ENTRY: 'free',
  EDIT_ANY_ENTRY: 'free',
  VIEW_ALL_HISTORY: 'free',
  DELETE_ENTRY: 'free',
  COMMENTS: 'free',
  PAUSE_RESUME: 'free',

  // Project management (manual)
  MANUAL_PROJECT_ADD: 'free',
  EDIT_DELETE_PROJECTS: 'free',
  UNLIMITED_PROJECTS: 'free',
  FOUR_LEVEL_HIERARCHY: 'free',
  VIEW_ALL_PROJECTS: 'free',

  // Export (full data access)
  BASIC_EXPORT: 'free',
  EXPORT_DATE_FILTER: 'free',
  EXPORT_PROJECT_FILTER: 'free',

  // UI/UX
  ALL_KEYBOARD_SHORTCUTS: 'free',
  SYSTEM_TRAY: 'free',
  MINIMIZE_TO_TRAY: 'free',
  RECENT_ENTRIES_VIEW: 'free',

  // Data ownership
  UNLIMITED_HISTORY: 'free',
  LOCAL_DATA_STORAGE: 'free',
  DATA_EXPORT: 'free',

  // PREMIUM features (trial + paid only)
  // Time-saving imports
  CSV_IMPORT: 'premium',
  CSV_LINKING: 'premium',

  // Search & filter
  SEARCH_TIME_ENTRIES: 'premium',
  FILTER_TIME_ENTRIES: 'premium',
  SEARCH_PROJECTS: 'premium',
  FILTER_PROJECTS: 'premium',

  // Widgets
  TIME_SUMMARY_WIDGET: 'premium',
  DAILY_PROGRESS_WIDGET: 'premium',

  // Settings & customization
  TIME_ROUNDING_SETTINGS: 'premium',
  IDLE_DETECTION_SETTINGS: 'premium',
  DAILY_GOAL_SETTINGS: 'premium',
  ACTIVITY_REMINDER_SETTINGS: 'premium',
  FLOATING_TIMER_SETTINGS: 'premium',
  BREAK_REMINDER_SETTINGS: 'premium',

  // Smart features
  IDLE_DETECTION: 'premium',
  DAILY_GOALS: 'premium',
  ACTIVITY_REMINDERS: 'premium',
  FLOATING_TIMER: 'premium',
  BREAK_REMINDERS: 'premium',

  // Support
  PREMIUM_SUPPORT: 'premium',
};

// License tier definitions
const LICENSE_TIERS = {
  FREE: 'free',
  TRIAL: 'trial',
  PREMIUM: 'premium'
};

// License key prefixes
const LICENSE_KEY_PREFIXES = {
  TRIAL: 'TRIL',
  PREMIUM: 'PREM'
};

// Trial duration in days
const TRIAL_DURATION_DAYS = 30;

module.exports = {
  FEATURES,
  LICENSE_TIERS,
  LICENSE_KEY_PREFIXES,
  TRIAL_DURATION_DAYS
};
