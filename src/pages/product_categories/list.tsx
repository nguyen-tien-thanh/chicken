import {
  List as AntdList,
  DeleteButton,
  EditButton,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import { Space } from 'antd';
import dayjs from 'dayjs';

import { ResponsiveTable, type ResponsiveColumnType } from '@/components';
import { MEDIA_MD_DOWN, useMediaQuery } from '@/hooks';
import type { IProductCategory } from '@/types';
import { DATETIME_FORMAT } from '@/utils';

export const List = () => {
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);

  const { tableProps, filters, sorters } = useTable<IProductCategory>({
    syncWithLocation: true,
    resource: 'product_categories',
    queryOptions: { enabled: !isMobile },
  });

  const columns: ResponsiveColumnType<IProductCategory>[] = [
    {
      dataIndex: 'name',
      title: 'Tên danh mục',
      sorter: true,
      mobileRole: 'title',
    },
    {
      dataIndex: 'created_at',
      title: 'Ngày tạo',
      render: (v: string | null) => v && dayjs(v).format(DATETIME_FORMAT),
    },
    {
      dataIndex: 'deleted_at',
      title: 'Ngày xóa mềm',
      mobileRole: 'hidden',
      render: (v: string | null) => v && dayjs(v).format(DATETIME_FORMAT),
    },
    {
      title: 'Thao tác',
      dataIndex: 'actions',
      mobileRole: 'actions',
      render: (_, record) => (
        <Space>
          <EditButton hideText recordItemId={record.id} />
          <ShowButton hideText recordItemId={record.id} />
          <DeleteButton hideText recordItemId={record.id} />
        </Space>
      ),
    },
  ];

  return (
    <AntdList>
      <ResponsiveTable
        {...tableProps}
        resource="product_categories"
        columns={columns}
        filters={filters}
        sorters={sorters}
        rowKey="id"
      />
    </AntdList>
  );
};
