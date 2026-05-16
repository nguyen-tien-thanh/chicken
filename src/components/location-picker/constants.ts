/** Trung tâm mặc định TP. Hồ Chí Minh */
export const DEFAULT_MAP_CENTER = {
  lat: 10.806428,
  lng: 106.596363,
} as const;

/** Giới hạn pan/zoom trong phạm vi TP.HCM */
export const HCMC_BOUNDS = {
  southWest: { lat: 10.35, lng: 106.36 },
  northEast: { lat: 11.16, lng: 107.02 },
} as const;

export const DEFAULT_MAP_ZOOM = 14;
export const SELECTED_MAP_ZOOM = 17;
export const MIN_MAP_ZOOM = 12;
export const MAX_MAP_ZOOM = 19;
