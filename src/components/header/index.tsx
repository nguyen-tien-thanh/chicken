import { useIsMobile } from '@/hooks';
import type { RefineThemedLayoutHeaderProps } from '@refinedev/antd';
import { Layout as AntdLayout, Col, Grid, Row, theme } from 'antd';
import React from 'react';
import { GlobalSearch } from './GlobalSearch';
import { UserControls } from './user-controls';

const { useToken } = theme;
const { useBreakpoint } = Grid;

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const screens = useBreakpoint();
  const isMobile = useIsMobile();
  if (isMobile) return null;

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    padding: '0px 24px',
    height: '64px',
  };

  if (sticky) {
    headerStyles.position = 'sticky';
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      <Row
        align="middle"
        style={{ justifyContent: screens.sm ? 'space-between' : 'end' }}
      >
        <Col xs={0} sm={8} md={12}>
          <GlobalSearch />
        </Col>
        <Col>
          <UserControls />
        </Col>
      </Row>
    </AntdLayout.Header>
  );
};
