import { ColorModeContext } from '@/contexts/color-mode';
import { IUser } from '@/types';
import type { RefineThemedLayoutHeaderProps } from '@refinedev/antd';
import { useGetIdentity } from '@refinedev/core';
import {
  Layout as AntdLayout,
  Avatar,
  Col,
  Grid,
  Row,
  Space,
  Switch,
  theme,
  Typography,
} from 'antd';
import React, { useContext } from 'react';
import { GlobalSearch } from './GlobalSearch';

const { Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);
  const screens = useBreakpoint();

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
          <Space>
            <Switch
              checkedChildren="🌛"
              unCheckedChildren="🔆"
              onChange={() => setMode(mode === 'light' ? 'dark' : 'light')}
              defaultChecked={mode === 'dark'}
            />
            <Space style={{ marginLeft: '8px' }} size="middle">
              {user?.name && <Text strong>{user.name}</Text>}
              {user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
            </Space>
          </Space>
        </Col>
      </Row>
    </AntdLayout.Header>
  );
};
