import {
  LeftOutlined,
  LogoutOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  CanAccess,
  type TreeMenuItem,
  useIsExistAuthentication,
  useLink,
  useLogout,
  useMenu,
  useTranslate,
  useWarnAboutChange,
} from '@refinedev/core';
import { useIsMobile } from '@/hooks';
import {
  Button,
  ConfigProvider,
  Layout,
  Menu,
  theme,
} from 'antd';
import type { MenuProps } from 'antd';
import React, { useContext, useMemo } from 'react';

import { useThemedLayoutContext } from '@refinedev/antd';
import { ThemedTitle } from '../title';
import type { RefineThemedLayoutSiderProps } from '../types';

type MenuItem = NonNullable<MenuProps['items']>[number];

export const ThemedSider: React.FC<RefineThemedLayoutSiderProps> = ({
  Title: TitleFromProps,
  render,
  meta,
  fixed,
  activeItemDisabled = false,
  siderItemsAreCollapsed = true,
}) => {
  const { token } = theme.useToken();
  const { siderCollapsed, setSiderCollapsed } = useThemedLayoutContext();

  const isExistAuthentication = useIsExistAuthentication();
  const direction = useContext(ConfigProvider.ConfigContext)?.direction;
  const Link = useLink();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const translate = useTranslate();
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu({ meta });
  const { mutate: mutateLogout } = useLogout();
  const isMobile = useIsMobile();

  const RenderToTitle = TitleFromProps ?? ThemedTitle;

  const buildTreeItems = (
    tree: TreeMenuItem[],
    currentSelectedKey?: string,
  ): MenuItem[] => {
    const items: MenuItem[] = [];

    for (const item of tree) {
      const { key, name, children, meta: itemMeta, list } = item;
      const parentName = itemMeta?.parent;
      const label = item?.label ?? itemMeta?.label ?? name;
      const icon = itemMeta?.icon;
      const route = list;

      if (children.length > 0) {
        const childItems = buildTreeItems(children, currentSelectedKey);
        if (childItems.length === 0) continue;

        items.push({
          key: item.key,
          icon: icon ?? <UnorderedListOutlined />,
          label: (
            <CanAccess
              resource={name}
              action="list"
              params={{ resource: item }}
            >
              {label}
            </CanAccess>
          ),
          children: childItems,
        });
        continue;
      }

      const isSelected = key === currentSelectedKey;
      const isRoute = !(parentName !== undefined && children.length === 0);
      const linkStyle: React.CSSProperties =
        activeItemDisabled && isSelected ? { pointerEvents: 'none' } : {};

      items.push({
        key: item.key,
        icon: icon ?? (isRoute ? <UnorderedListOutlined /> : undefined),
        label: (
          <CanAccess
            resource={name}
            action="list"
            params={{ resource: item }}
          >
            <>
              <Link to={route ?? ''} style={linkStyle}>
                {label}
              </Link>
              {!siderCollapsed && isSelected ? (
                <div className="ant-menu-tree-arrow" />
              ) : null}
            </>
          </CanAccess>
        ),
        style: linkStyle,
      });
    }

    return items;
  };

  const handleLogout = () => {
    if (warnWhen) {
      const confirm = window.confirm(
        translate(
          'warnWhenUnsavedChanges',
          'Are you sure you want to leave? You have unsaved changes.',
        ),
      );

      if (confirm) {
        setWarnWhen(false);
        mutateLogout();
      }
    } else {
      mutateLogout();
    }
  };

  const logoutItem: MenuItem | false =
    isExistAuthentication && {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: translate('buttons.logout', 'Logout'),
      onClick: () => handleLogout(),
    };

  const defaultExpandMenuItems = (() => {
    if (siderItemsAreCollapsed) return [];

    return menuItems.map(({ key }) => key);
  })();

  const treeItems = useMemo(
    () => buildTreeItems(menuItems, selectedKey),
    [menuItems, selectedKey, siderCollapsed, activeItemDisabled, Link],
  );

  const renderSiderItems = (): MenuProps['items'] => {
    if (render) {
      return render({
        items: treeItems as unknown as React.ReactElement[],
        logout: logoutItem as unknown as React.ReactNode,
        collapsed: siderCollapsed,
      }) as MenuProps['items'];
    }

    return [...treeItems, logoutItem].filter(Boolean) as MenuProps['items'];
  };

  const renderMenu = () => {
    return (
      <Menu
        selectedKeys={selectedKey ? [selectedKey] : []}
        defaultOpenKeys={[...defaultOpenKeys, ...defaultExpandMenuItems]}
        mode="inline"
        items={renderSiderItems()}
        style={{
          paddingTop: '8px',
          border: 'none',
          overflow: 'auto',
          height: 'calc(100% - 72px)',
        }}
      />
    );
  };

  if (isMobile) {
    return null;
  }

  const siderStyles: React.CSSProperties = {
    backgroundColor: token.colorBgContainer,
    borderRight: `1px solid ${token.colorBgElevated}`,
  };

  if (fixed) {
    siderStyles.position = 'fixed';
    siderStyles.top = 0;
    siderStyles.height = '100vh';
    siderStyles.zIndex = 999;
  }
  const renderClosingIcons = () => {
    const iconProps = { style: { color: token.colorPrimary } };
    const OpenIcon = direction === 'rtl' ? RightOutlined : LeftOutlined;
    const CollapsedIcon = direction === 'rtl' ? LeftOutlined : RightOutlined;
    const IconComponent = siderCollapsed ? CollapsedIcon : OpenIcon;

    return <IconComponent {...iconProps} />;
  };

  return (
    <>
      {fixed && (
        <div
          style={{
            width: siderCollapsed ? '80px' : '200px',
            transition: 'all 0.2s',
          }}
        />
      )}
      <Layout.Sider
        style={siderStyles}
        collapsible
        collapsed={siderCollapsed}
        onCollapse={(collapsed, type) => {
          if (type === 'clickTrigger') {
            setSiderCollapsed(collapsed);
          }
        }}
        collapsedWidth={80}
        breakpoint="lg"
        trigger={
          <Button
            type="text"
            style={{
              borderRadius: 0,
              height: '100%',
              width: '100%',
              backgroundColor: token.colorBgElevated,
            }}
          >
            {renderClosingIcons()}
          </Button>
        }
      >
        <div
          style={{
            width: siderCollapsed ? '80px' : '200px',
            padding: siderCollapsed ? '0' : '0 16px',
            display: 'flex',
            justifyContent: siderCollapsed ? 'center' : 'flex-start',
            alignItems: 'center',
            height: '64px',
            backgroundColor: token.colorBgElevated,
            fontSize: '14px',
          }}
        >
          <RenderToTitle collapsed={siderCollapsed} />
        </div>
        {renderMenu()}
      </Layout.Sider>
    </>
  );
};
