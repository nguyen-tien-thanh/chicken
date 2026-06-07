import type { TableProps } from 'antd';
import { Card, Divider, Empty, Flex, Skeleton, Spin, Typography, theme } from 'antd';
import type { MouseEventHandler, ReactNode } from 'react';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigation } from '@refinedev/core';

import type { ResponsiveColumnType } from './types';
import {
  extractCardActions,
  getRowKeyValue,
  partitionMobileColumns,
  renderColumnCell,
  renderColumnTitle,
} from './utils';

type MobileCardListProps<RecordType extends object> = Pick<
  TableProps<RecordType>,
  'onRow' | 'rowKey' | 'locale' | 'rowClassName'
> & {
  resource: string;
  columns: ResponsiveColumnType<RecordType>[];
  dataSource: readonly RecordType[];
  loading?: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
};

function FieldBlock({
  label,
  children,
}: {
  label?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Flex vertical gap={2}>
      {label ? (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {label}
        </Typography.Text>
      ) : null}
      <div style={{ minWidth: 0, overflow: 'hidden' }}>{children}</div>
    </Flex>
  );
}

function MobileCard<RecordType extends object>({
  resource,
  record,
  index,
  rowKey,
  rowClassName,
  onRow,
  titleColumn,
  subtitleColumn,
  bodyColumns,
  actionsColumn,
}: {
  resource: string;
  record: RecordType;
  index: number;
  rowKey: TableProps<RecordType>['rowKey'];
  rowClassName: TableProps<RecordType>['rowClassName'];
  onRow: TableProps<RecordType>['onRow'];
  titleColumn?: ResponsiveColumnType<RecordType>;
  subtitleColumn?: ResponsiveColumnType<RecordType>;
  bodyColumns: ResponsiveColumnType<RecordType>[];
  actionsColumn?: ResponsiveColumnType<RecordType>;
}) {
  const { token } = theme.useToken();
  const { show } = useNavigation();
  const rowProps = onRow?.(record, index);
  const recordId = getRowKeyValue(record, index, rowKey);
  const className = [
    typeof rowClassName === 'function'
      ? rowClassName(record, index, 0)
      : rowClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const cardTitle = titleColumn
    ? renderColumnCell(titleColumn, record, index)
    : subtitleColumn
      ? renderColumnCell(subtitleColumn, record, index)
      : undefined;

  const cardActions = actionsColumn
    ? extractCardActions(renderColumnCell(actionsColumn, record, index))
    : [];

  const fieldColumns = (
    titleColumn ? [subtitleColumn, ...bodyColumns] : bodyColumns
  ).filter(Boolean) as ResponsiveColumnType<RecordType>[];

  const handleCardClick: MouseEventHandler<HTMLElement> = event => {
    const target = event.target as HTMLElement;
    if (target.closest('a, button, [role="button"]')) {
      return;
    }

    if (rowProps?.onClick) {
      rowProps.onClick(event);
      return;
    }

    show(resource, recordId);
  };

  return (
    <Card
      size="small"
      hoverable
      className={className}
      onClick={handleCardClick}
      title={cardTitle}
      style={{
        flex: 1,
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: token.marginSM,
          minHeight: 0,
        },
      }}
    >
      <Flex vertical gap="small" style={{ flex: 1, minWidth: 0 }}>
        {fieldColumns.map(col => {
          const colKey = String(col.key ?? col.dataIndex ?? col.title);
          return (
            <FieldBlock key={colKey} label={renderColumnTitle(col.title)}>
              {renderColumnCell(col, record, index)}
            </FieldBlock>
          );
        })}
      </Flex>
      {cardActions.length > 0 ? (
        <Flex
          justify="flex-end"
          gap="small"
          wrap="wrap"
          onClick={event => event.stopPropagation()}
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            marginTop: 'auto',
            marginInline: -token.paddingSM,
            marginBottom: -token.paddingSM,
            padding: token.paddingSM,
          }}
        >
          {cardActions}
        </Flex>
      ) : null}
    </Card>
  );
}

export function MobileCardList<RecordType extends object>({
  resource,
  columns,
  dataSource,
  loading,
  hasNextPage,
  onLoadMore,
  onRow,
  rowKey,
  locale,
  rowClassName,
}: MobileCardListProps<RecordType>) {
  const { token } = theme.useToken();
  const { titleColumn, subtitleColumn, bodyColumns, actionsColumn } = useMemo(
    () => partitionMobileColumns(columns),
    [columns],
  );

  const emptyText =
    typeof locale?.emptyText === 'string'
      ? locale.emptyText
      : 'Không có dữ liệu';

  if (loading && dataSource.length === 0) {
    return (
      <Flex justify="center" align="center">
        <Spin />
      </Flex>
    );
  }

  if (!loading && dataSource.length === 0) {
    return (
      <Flex justify="center" align="center">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
      </Flex>
    );
  }

  return (
    <InfiniteScroll
      dataLength={dataSource.length}
      next={onLoadMore}
      hasMore={hasNextPage}
      loader={
        <Flex justify="center">
          <Skeleton active paragraph={{ rows: 1 }} />
        </Flex>
      }
      endMessage={
        dataSource.length > 0 ? (
          <Divider plain>Đã hiển thị tất cả</Divider>
        ) : undefined
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: token.marginXS,
        }}
      >
        {dataSource.map((record, index) => (
          <div
            key={getRowKeyValue(record, index, rowKey)}
            style={{ minWidth: 0, display: 'flex' }}
          >
            <MobileCard
              resource={resource}
              record={record}
              index={index}
              rowKey={rowKey}
              rowClassName={rowClassName}
              onRow={onRow}
              titleColumn={titleColumn}
              subtitleColumn={subtitleColumn}
              bodyColumns={bodyColumns}
              actionsColumn={actionsColumn}
            />
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
