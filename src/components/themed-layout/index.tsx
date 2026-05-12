import { Layout as AntdLayout, Grid } from 'antd';
import React from 'react';

import { ThemedLayoutContextProvider } from '@refinedev/antd';
import { ThemedHeader } from './header';
import { ThemedSider } from './sider';
import type { RefineThemedLayoutProps } from './types';

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
  initialSiderCollapsed,
  onSiderCollapsed,
}) => {
  const breakpoint = Grid.useBreakpoint();
  const SiderToRender = Sider ?? ThemedSider;
  const HeaderToRender = Header ?? ThemedHeader;
  const isSmall = typeof breakpoint.sm === 'undefined' ? true : breakpoint.sm;
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
              }}
            >
              {children}
            </div>
            {OffLayoutArea && <OffLayoutArea />}
          </AntdLayout.Content>
          {Footer && <Footer />}
        </AntdLayout>
      </AntdLayout>
    </ThemedLayoutContextProvider>
  );
};
