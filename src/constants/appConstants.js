// Application constants

export const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "wayne";
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

export const ALL_USERS_FILTER = "ALL_USERS";
export const ALL_TAB = "ALL";
export const DEFAULT_MOVEMENT_TYPE = "Tow";

export const STORAGE_KEYS = {
  CURRENT_USER: "tui-logbook-currentUser",
  FLEET: "tui-logbook-fleet",
  HISTORY: "tui-logbook-history",
  USERS: "tui-logbook-users",
};

export const SUCCESS_MESSAGE_DURATION = 5000;
export const RECORDS_PER_PAGE = 10;
export const AIRCRAFT_SUGGESTION_LIMIT = 12;
