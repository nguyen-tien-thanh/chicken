import type { CrudFilter, CrudSort, MetaQuery } from '@refinedev/core';
import type { TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';

export type MobileColumnRole = 'title' | 'subtitle' | 'actions' | 'hidden';

export type ResponsiveColumnType<RecordType> = ColumnType<RecordType> & {
  mobileRole?: MobileColumnRole;
};

export type ResponsiveTableProps<RecordType extends object> = Omit<
  TableProps<RecordType>,
  'columns'
> & {
  resource: string;
  columns: ResponsiveColumnType<RecordType>[];
  filters?: CrudFilter[];
  sorters?: CrudSort[];
  meta?: MetaQuery;
};
