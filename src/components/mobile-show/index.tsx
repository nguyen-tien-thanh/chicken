import { RightOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Flex,
  Spin,
  Tag,
  Typography,
  theme,
  type TagProps,
} from 'antd';
import type { CSSProperties, ReactNode } from 'react';

export type MobileShowDetailItem = {
  label: string;
  value: ReactNode;
  hidden?: boolean;
};

export function MobileShowPage({
  loading,
  title,
  actions,
  children,
}: {
  loading?: boolean;
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <Flex justify="center" style={{ padding: 48 }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <Flex vertical>
      {title ? (
        <Typography.Title level={4} style={{ marginBottom: 12 }}>
          {title}
        </Typography.Title>
      ) : null}
      {actions ? (
        <Flex wrap gap={8} style={{ marginBottom: 12 }}>
          {actions}
        </Flex>
      ) : null}
      {children}
    </Flex>
  );
}

export function MobileShowValue({ children }: { children: ReactNode }) {
  return <Typography.Text>{children}</Typography.Text>;
}

export function MobileShowDetails({
  header,
  items,
}: {
  header?: string;
  items: MobileShowDetailItem[];
}) {
  const visible = items.filter(item => !item.hidden);

  return (
    <Card size="small" title={header} styles={{ body: { padding: 0 } }}>
      <Descriptions
        column={1}
        bordered
        size="small"
        labelStyle={{ width: '40%', fontWeight: 500 }}
      >
        {visible.map(item => (
          <Descriptions.Item key={item.label} label={item.label}>
            <MobileShowValue>{item.value}</MobileShowValue>
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Card>
  );
}

export function MobileShowSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Flex vertical gap={8} style={{ marginTop: 16 }}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      {children}
    </Flex>
  );
}

export function MobileShowList<T extends object>({
  dataSource,
  loading,
  emptyText = 'Không có dữ liệu',
  getKey,
  onItemClick,
  renderTitle,
  renderDescription,
}: {
  dataSource: readonly T[];
  loading?: boolean;
  emptyText?: string;
  getKey: (item: T, index: number) => string;
  onItemClick?: (item: T) => void;
  renderTitle: (item: T) => ReactNode;
  renderDescription?: (item: T) => ReactNode;
}) {
  const { token } = theme.useToken();

  if (loading && dataSource.length === 0) {
    return (
      <Flex justify="center" style={{ padding: 24 }}>
        <Spin />
      </Flex>
    );
  }

  if (!loading && dataSource.length === 0) {
    return <Empty description={emptyText} style={{ padding: '24px 0' }} />;
  }

  const clickable = !!onItemClick;

  return (
    <Flex vertical gap={token.marginXS}>
      {dataSource.map((item, index) => {
        const description = renderDescription?.(item);
        const multiline = !!description;
        const itemKey = getKey(item, index);
        const multilineStyle = multiline
          ? ({
              height: 'auto',
              paddingBlock: token.paddingContentVertical,
              alignItems: 'flex-start',
            } satisfies CSSProperties)
          : undefined;

        const content = (
          <Flex
            vertical
            align="flex-start"
            gap={token.marginXXS}
            flex={1}
            style={{ minWidth: 0, textAlign: 'start' }}
          >
            <Typography.Text>{renderTitle(item)}</Typography.Text>
            {description ? (
              <Typography.Text type="secondary">{description}</Typography.Text>
            ) : null}
          </Flex>
        );

        if (clickable) {
          return (
            <Button
              key={itemKey}
              block
              variant="outlined"
              color="default"
              icon={<RightOutlined />}
              iconPosition="end"
              style={multilineStyle}
              styles={
                multiline
                  ? {
                      icon: {
                        alignSelf: 'flex-start',
                        marginTop: token.marginXXS,
                      },
                    }
                  : undefined
              }
              onClick={() => onItemClick(item)}
            >
              {content}
            </Button>
          );
        }

        return (
          <Flex
            key={itemKey}
            align={multiline ? 'flex-start' : 'center'}
            style={{
              width: '100%',
              padding: `${token.paddingContentVertical}px ${token.paddingContentHorizontal}px`,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
              minHeight: multiline ? undefined : token.controlHeight,
            }}
          >
            {content}
          </Flex>
        );
      })}
    </Flex>
  );
}

const TAG_COLORS: Record<
  'primary' | 'success' | 'warning' | 'danger' | 'default',
  TagProps['color']
> = {
  primary: 'processing',
  success: 'success',
  warning: 'warning',
  danger: 'error',
  default: 'default',
};

export function MobileShowTag({
  color,
  children,
}: {
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  children: ReactNode;
}) {
  return <Tag color={color ? TAG_COLORS[color] : undefined}>{children}</Tag>;
}
