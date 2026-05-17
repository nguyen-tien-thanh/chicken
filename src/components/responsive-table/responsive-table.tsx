import { useInfiniteList } from '@refinedev/core';
import type { BaseRecord } from '@refinedev/core';
import { Result, Table } from 'antd';
import type { TablePaginationConfig } from 'antd';
import { useMemo } from 'react';

import { MEDIA_MD_DOWN, useMediaQuery } from '@/hooks';

import { MobileCardList } from './mobile-card-list';
import type { ResponsiveTableProps } from './types';

export function ResponsiveTable<RecordType extends BaseRecord>({
  resource,
  columns,
  filters,
  sorters,
  meta,
  pagination,
  ...tableProps
}: ResponsiveTableProps<RecordType>) {
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);

  const pageSize =
    pagination === false
      ? 10
      : ((pagination as TablePaginationConfig)?.pageSize ?? 10);

  const {
    result: { data, hasNextPage },
    query: { isError, isLoading, fetchNextPage },
  } = useInfiniteList<RecordType>({
    resource,
    filters,
    sorters,
    meta,
    pagination: { pageSize },
    queryOptions: { enabled: isMobile },
  });

  const records = useMemo(
    () => (data?.pages ?? []).flatMap(page => page.data),
    [data?.pages],
  );

  if (isMobile) {
    if (isError) {
      return <Result status="error" title="Không tải được danh sách" />;
    }

    return (
      <MobileCardList
        columns={columns}
        dataSource={records}
        loading={isLoading}
        hasNextPage={!!hasNextPage}
        onLoadMore={() => fetchNextPage()}
        onRow={tableProps.onRow}
        rowKey={tableProps.rowKey}
        locale={tableProps.locale}
        rowClassName={tableProps.rowClassName}
      />
    );
  }

  return <Table {...tableProps} columns={columns} pagination={pagination} />;
}
