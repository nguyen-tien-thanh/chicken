import { Logo } from '@/components/logo';
import { useLink, useRefineOptions } from '@refinedev/core';
import { Space, Typography, theme } from 'antd';
import React from 'react';
import type { RefineLayoutThemedTitleProps } from '../types';

export const ThemedTitle: React.FC<RefineLayoutThemedTitleProps> = ({
  collapsed,
  icon: iconFromProps,
  text: textFromProps,
  wrapperStyles,
}) => {
  const { title: { icon: defaultIcon, text: defaultText } = {} } =
    useRefineOptions();
  const icon =
    typeof iconFromProps === 'undefined' ? defaultIcon : iconFromProps;
  const text =
    typeof textFromProps === 'undefined' ? defaultText : textFromProps;
  const { token } = theme.useToken();
  const Link = useLink();

  return (
    <Link
      to="/"
      style={{
        display: 'inline-block',
        textDecoration: 'none',
      }}
    >
      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 'inherit',
          ...wrapperStyles,
        }}
      >
        <div
          style={{
            height: '24px',
            width: '24px',
            color: token.colorPrimary,
          }}
        >
          {<Logo width={24} height={24} />}
        </div>

        {!collapsed && (
          <Typography.Title
            style={{
              fontSize: 'inherit',
              marginBottom: 0,
              fontWeight: 700,
            }}
          >
            Chicken
          </Typography.Title>
        )}
      </Space>
    </Link>
  );
};
