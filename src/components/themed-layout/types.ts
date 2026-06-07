import type { ReactNode } from 'react';
import type {
  RefineThemedLayoutSiderProps as BaseRefineThemedLayoutSiderProps,
  RefineThemedLayoutHeaderProps,
  RefineThemedLayoutProps as BaseRefineThemedLayoutProps,
  RefineLayoutThemedTitleProps,
} from '@refinedev/ui-types';

type RefineThemedLayoutSiderProps = BaseRefineThemedLayoutSiderProps & {
  fixed?: boolean;
};

export type BottomNavMoreConfig = {
  label?: string;
  icon?: ReactNode;
  drawerTitle?: string;
};

export type RefineThemedLayoutBottomNavigationProps = {
  meta?: Record<string, unknown>;
  more?: BottomNavMoreConfig;
};

type RefineThemedLayoutProps = BaseRefineThemedLayoutProps & {
  BottomNavigation?: React.FC<RefineThemedLayoutBottomNavigationProps>;
  bottomNavMore?: BottomNavMoreConfig;
};

export type {
  RefineLayoutThemedTitleProps,
  RefineThemedLayoutSiderProps,
  RefineThemedLayoutHeaderProps,
  RefineThemedLayoutProps,
};
