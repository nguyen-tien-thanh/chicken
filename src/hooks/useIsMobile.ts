import { useMediaQuery } from './useMediaQuery';

/** Ant Design `lg` — viewports narrower than 992px */
export const MEDIA_LG_DOWN = '(max-width: 991px)';

export function useIsMobile(): boolean {
  return useMediaQuery(MEDIA_LG_DOWN);
}
