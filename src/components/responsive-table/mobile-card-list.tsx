import type { TableProps } from 'antd';
import {
  Card,
  Divider,
  Empty,
  Flex,
  Skeleton,
  Spin,
  Typography,
} from 'antd';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

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
      <div>{children}</div>
    </Flex>
  );
}

function MobileCard<RecordType extends object>({
  record,
  index,
  rowClassName,
  onRow,
  titleColumn,
  subtitleColumn,
  bodyColumns,
  actionsColumn,
}: {
  record: RecordType;
  index: number;
  rowClassName: TableProps<RecordType>['rowClassName'];
  onRow: TableProps<RecordType>['onRow'];
  titleColumn?: ResponsiveColumnType<RecordType>;
  subtitleColumn?: ResponsiveColumnType<RecordType>;
  bodyColumns: ResponsiveColumnType<RecordType>[];
  actionsColumn?: ResponsiveColumnType<RecordType>;
}) {
  const rowProps = onRow?.(record, index);
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
    titleColumn
      ? [subtitleColumn, ...bodyColumns]
      : bodyColumns
  ).filter(Boolean) as ResponsiveColumnType<RecordType>[];

  return (
    <Card
      size="small"
      hoverable={!!rowProps?.onClick}
      className={className}
      onClick={rowProps?.onClick}
      title={cardTitle}
      actions={cardActions.length > 0 ? cardActions : undefined}
    >
      <Flex vertical gap="middle">
        {fieldColumns.map(col => {
          const colKey = String(col.key ?? col.dataIndex ?? col.title);
          return (
            <FieldBlock key={colKey} label={renderColumnTitle(col.title)}>
              {renderColumnCell(col, record, index)}
            </FieldBlock>
          );
        })}
      </Flex>
    </Card>
  );
}

export function MobileCardList<RecordType extends object>({
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
      <Flex vertical gap="small">
        {dataSource.map((record, index) => (
          <MobileCard
            key={getRowKeyValue(record, index, rowKey)}
            record={record}
            index={index}
            rowClassName={rowClassName}
            onRow={onRow}
            titleColumn={titleColumn}
            subtitleColumn={subtitleColumn}
            bodyColumns={bodyColumns}
            actionsColumn={actionsColumn}
          />
        ))}
      </Flex>
    </InfiniteScroll>
  );
}
