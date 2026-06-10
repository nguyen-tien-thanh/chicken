import { ColorModeContext } from '@/contexts/color-mode';
import { useIsMobile } from '@/hooks';
import { IUser } from '@/types';
import { useGetIdentity } from '@refinedev/core';
import { Avatar, Space, Switch, Typography } from 'antd';
import React, { useContext } from 'react';

const { Text } = Typography;

export const UserControls: React.FC = () => {
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);
  const isMobile = useIsMobile();

  return (
    <Space>
      {isMobile ? (
        <>
          <Space style={{ marginRight: '8px' }} size="middle">
            {user?.name && <Text strong>{user.name.split('@')[0]}</Text>}
            {user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
          </Space>
          <Switch
            checkedChildren="🌛"
            unCheckedChildren="🔆"
            checked={mode === 'dark'}
            onChange={checked => setMode(checked ? 'dark' : 'light')}
          />
        </>
      ) : (
        <>
          <Switch
            checkedChildren="🌛"
            unCheckedChildren="🔆"
            checked={mode === 'dark'}
            onChange={checked => setMode(checked ? 'dark' : 'light')}
          />
          <Space style={{ marginLeft: '8px' }} size="middle">
            {user?.name && <Text strong>{user.name.split('@')[0]}</Text>}
            {user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
          </Space>
        </>
      )}
    </Space>
  );
};
