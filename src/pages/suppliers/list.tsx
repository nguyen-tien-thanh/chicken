import {
  List as AntdList,
  DeleteButton,
  EditButton,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import { Space } from 'antd';

import { ResponsiveTable, type ResponsiveColumnType } from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { MEDIA_MD_DOWN, useMediaQuery } from '@/hooks';
import { type ISupplier } from '@/types';

export const List = () => {
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);

  const { tableProps, filters, sorters } = useTable<ISupplier>({
    syncWithLocation: true,
    resource: 'suppliers',
    sorters: { initial: [{ field: 'created_at', order: 'desc' }] },
    queryOptions: { enabled: !isMobile },
  });

  const columns: ResponsiveColumnType<ISupplier>[] = [
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      mobileRole: 'title',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      sorter: true,
      mobileRole: 'subtitle',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      render: (address: string | null) => (
        <Space size="small">{address}</Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      sorter: true,
      mobileRole: 'hidden',
      render: (v: string) => v && <RelativeTime value={v} />,
    },
    {
      title: 'Thao tác',
      dataIndex: 'actions',
      fixed: 'right',
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
        resource="suppliers"
        columns={columns}
        filters={filters}
        sorters={sorters}
        rowKey="id"
      />
    </AntdList>
  );
};
