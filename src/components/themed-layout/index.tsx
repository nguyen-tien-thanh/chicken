import { useIsMobile } from '@/hooks';
import { Layout as AntdLayout, Grid } from 'antd';
import React from 'react';

import { ThemedLayoutContextProvider } from '@refinedev/antd';
import { ThemedBottomNavigation } from './bottom-navigation';
import { ThemedHeader } from './header';
import { ThemedSider } from './sider';
import type { RefineThemedLayoutProps } from './types';

export * from './bottom-navigation';
export * from './header';
export * from './sider';
export * from './title';
export * from './types';

export const ThemedLayout: React.FC<RefineThemedLayoutProps> = ({
  children,
  Header,
  Sider,
  Title,
  Footer,
  OffLayoutArea,
  BottomNavigation,
  bottomNavMore,
  initialSiderCollapsed,
  onSiderCollapsed,
}) => {
  const breakpoint = Grid.useBreakpoint();
  const SiderToRender = Sider ?? ThemedSider;
  const HeaderToRender = Header ?? ThemedHeader;
  const BottomNavigationToRender = BottomNavigation ?? ThemedBottomNavigation;
  const isSmall = typeof breakpoint.sm === 'undefined' ? true : breakpoint.sm;
  const isMobile = useIsMobile();
  const hasSider = !!SiderToRender({ Title });

  return (
    <ThemedLayoutContextProvider
      initialSiderCollapsed={initialSiderCollapsed}
      onSiderCollapsed={onSiderCollapsed}
    >
      <AntdLayout style={{ minHeight: '100vh' }} hasSider={hasSider}>
        <SiderToRender Title={Title} />
        <AntdLayout>
          <HeaderToRender />
          <AntdLayout.Content>
            <div
              style={{
                minHeight: 360,
                padding: isSmall ? 24 : 12,
                paddingBottom: isMobile
                  ? `calc(72px + env(safe-area-inset-bottom, 0px))`
                  : undefined,
              }}
            >
              {children}
            </div>
            {OffLayoutArea && <OffLayoutArea />}
          </AntdLayout.Content>
          {Footer && <Footer />}
          <BottomNavigationToRender more={bottomNavMore} />
        </AntdLayout>
      </AntdLayout>
    </ThemedLayoutContextProvider>
  );
};
