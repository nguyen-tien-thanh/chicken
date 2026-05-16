import { useMediaQuery, MEDIA_MD_DOWN } from "./useMediaQuery";

const DEFAULT_DRAWER_WIDTH = "45vw";

export function useResponsiveDrawerWidth(
  desktopWidth: string | number = DEFAULT_DRAWER_WIDTH
): string | number {
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);
  return isMobile ? "100%" : desktopWidth;
}
