import {
  List as AntdList,
  DeleteButton,
  EditButton,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import { Input, Space } from 'antd';

import { ResponsiveTable, type ResponsiveColumnType } from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { MEDIA_MD_DOWN, useMediaQuery } from '@/hooks';
import type { ICustomer } from '@/types';
import { Link } from 'react-router';

export const List = () => {
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);

  const { tableProps, filters, sorters, setFilters } = useTable<ICustomer>({
    resource: 'customers',
    syncWithLocation: true,
    sorters: { initial: [{ field: 'name', order: 'asc' }] },
    queryOptions: { enabled: !isMobile },
  });

  const columns: ResponsiveColumnType<ICustomer>[] = [
    {
      title: 'Tên',
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
      render: (phone: string) => <Link to={`tel:${phone}`}>{phone}</Link>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      render: (address: string | null) => <Space size="small">{address}</Space>,
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
      <Input.Search
        allowClear
        placeholder="Tìm tên hoặc SĐT..."
        style={{ marginBottom: 16, maxWidth: 480 }}
        size="large"
        onSearch={value => {
          const q = value.trim();
          setFilters(
            q
              ? [
                  {
                    operator: 'or',
                    value: [
                      { field: 'name', operator: 'contains', value: q },
                      { field: 'phone', operator: 'contains', value: q },
                    ],
                  },
                ]
              : [],
            'replace',
          );
        }}
      />

      <ResponsiveTable
        {...tableProps}
        resource="customers"
        columns={columns}
        filters={filters}
        sorters={sorters}
        rowKey="id"
      />
    </AntdList>
  );
};
