import 'antd-mobile/es/global';

import { UserControls } from '@/components/header/user-controls';
import { useIsMobile } from '@/hooks';
import { EllipsisOutlined } from '@ant-design/icons';
import {
  type TreeMenuItem,
  useMenu,
  useNavigation,
  useTranslate,
  useWarnAboutChange,
} from '@refinedev/core';
import { theme } from 'antd';
import { List, Popup, TabBar } from 'antd-mobile';
import React, { useMemo, useState } from 'react';

import type { RefineThemedLayoutBottomNavigationProps } from '../types';

import './bottom-navigation.css';

const MORE_TAB_KEY = 'more';

const isPrimaryTab = (item: TreeMenuItem) => item.meta?.bottomNav === 'primary';

const getItemLabel = (item: TreeMenuItem) =>
  item.meta?.label ?? item.label ?? item.name;

export const ThemedBottomNavigation: React.FC<
  RefineThemedLayoutBottomNavigationProps
> = ({ meta, more }) => {
  const { token } = theme.useToken();
  const isMobile = useIsMobile();
  const translate = useTranslate();
  const { list } = useNavigation();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const { menuItems, selectedKey } = useMenu({ meta });
  const [moreOpen, setMoreOpen] = useState(false);

  const flatMenuItems = useMemo(
    () => menuItems.filter(item => item.children.length === 0),
    [menuItems],
  );

  const primaryItems = useMemo(
    () => flatMenuItems.filter(isPrimaryTab),
    [flatMenuItems],
  );

  const moreItems = useMemo(
    () => flatMenuItems.filter(item => !isPrimaryTab(item)),
    [flatMenuItems],
  );

  const activeKey = useMemo(() => {
    if (!selectedKey) {
      return undefined;
    }

    const selectedItem = flatMenuItems.find(item => item.key === selectedKey);

    if (!selectedItem) {
      return undefined;
    }

    if (isPrimaryTab(selectedItem)) {
      return selectedItem.key;
    }

    return moreItems.length > 0 ? MORE_TAB_KEY : undefined;
  }, [selectedKey, flatMenuItems, moreItems.length]);

  const handleNavigate = (item: TreeMenuItem) => {
    if (warnWhen) {
      const confirm = window.confirm(
        translate(
          'warnWhenUnsavedChanges',
          'Are you sure you want to leave? You have unsaved changes.',
        ),
      );

      if (!confirm) {
        return;
      }

      setWarnWhen(false);
    }

    list(item.name);
  };

  const handlePrimaryTabChange = (key: string) => {
    if (key === MORE_TAB_KEY) return;
    const item = primaryItems.find(menuItem => menuItem.key === key);
    if (item) handleNavigate(item);
  };

  const moreLabel = more?.label ?? 'Thêm';
  const moreIcon = more?.icon ?? <EllipsisOutlined />;
  const drawerTitle = more?.drawerTitle ?? moreLabel;

  if (!isMobile || primaryItems.length === 0) return null;

  return (
    <>
      <div
        className="themed-bottom-navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBgElevated}`,
        }}
      >
        <TabBar
          activeKey={activeKey ?? undefined}
          onChange={handlePrimaryTabChange}
          safeArea
        >
          {primaryItems.map(item => (
            <TabBar.Item
              key={item.key}
              icon={item.icon ?? item.meta?.icon}
              title={getItemLabel(item)}
            />
          ))}
          {moreItems.length > 0 && (
            <TabBar.Item
              key={MORE_TAB_KEY}
              icon={moreIcon}
              title={moreLabel}
              onClick={() => setMoreOpen(true)}
            />
          )}
        </TabBar>
      </div>

      {moreItems.length > 0 && (
        <Popup
          visible={moreOpen}
          onMaskClick={() => setMoreOpen(false)}
          onClose={() => setMoreOpen(false)}
          position="bottom"
          bodyStyle={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            maxHeight: '70vh',
            overflowY: 'auto',
            backgroundColor: token.colorBgContainer,
            color: token.colorText,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: '16px',
              borderBottom: `1px solid ${token.colorBgElevated}`,
            }}
          >
            <UserControls />
          </div>
          <List header={drawerTitle}>
            {moreItems.map(item => (
              <List.Item
                key={item.key}
                prefix={item.icon ?? item.meta?.icon}
                clickable
                onClick={() => {
                  setMoreOpen(false);
                  handleNavigate(item);
                }}
              >
                {getItemLabel(item)}
              </List.Item>
            ))}
          </List>
        </Popup>
      )}
    </>
  );
};
