import {
  List as AntdList,
  DeleteButton,
  EditButton,
  FilterDropdown,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import { Input, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { Link, useSearchParams } from 'react-router';

import { ResponsiveTable, type ResponsiveColumnType } from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { MEDIA_MD_DOWN, useMediaQuery } from '@/hooks';
import type { IPurchase } from '@/types';
import { DATE_FORMAT, formatMoney } from '@/utils';

export const List = () => {
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);
  const [searchParams] = useSearchParams();
  const supplier_idParam = searchParams.get('supplier_id');

  const { tableProps, filters, sorters } = useTable<IPurchase>({
    syncWithLocation: true,
    resource: 'purchases',
    meta: {
      select: '*,supplier:suppliers(*),purchase_items(*,product:products(*))',
    },
    filters: {
      ...(supplier_idParam
        ? {
            permanent: [
              {
                field: 'supplier_id',
                operator: 'eq',
                value: supplier_idParam,
              },
            ],
          }
        : {}),
    },
    sorters: { initial: [{ field: 'purchase_date', order: 'desc' }] },
    queryOptions: { enabled: !isMobile },
  });

  const columns: ResponsiveColumnType<IPurchase>[] = [
    {
      dataIndex: 'purchase_date',
      title: 'Ngày nhập',
      sorter: true,
      defaultSortOrder: 'descend',
      mobileRole: 'title',
      render: (v: string) => v && dayjs(v).format(DATE_FORMAT),
      filterDropdown: props => (
        <FilterDropdown {...props}>
          <Input.Search placeholder="Tìm ngày nhập..." />
        </FilterDropdown>
      ),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: ['supplier', 'name'],
      sorter: true,
      mobileRole: 'subtitle',
      render: (_, r) =>
        r.supplier ? (
          <Link to={`/suppliers/show/${r.supplier.id}`}>{r.supplier.name}</Link>
        ) : (
          r.supplier_id
        ),
      filterDropdown: props => (
        <FilterDropdown {...props}>
          <Input.Search placeholder="Tìm nhà cung cấp..." />
        </FilterDropdown>
      ),
    },
    {
      dataIndex: 'cages_count',
      title: 'Số lồng',
      align: 'right',
      sorter: true,
      render: (v: number) => v != null && `${v} lồng`,
    },
    {
      dataIndex: 'cages_weight',
      title: 'Tổng trọng lượng lồng',
      align: 'right',
      sorter: true,
      mobileRole: 'hidden',
      render: (v: number) => v != null && `${v} kg`,
    },
    {
      title: 'Tổng tiền',
      align: 'right',
      sorter: true,
      dataIndex: 'total_amount',
      render: (_, r) => (
        <Typography.Text strong>{formatMoney(r.total_amount)}</Typography.Text>
      ),
      filterDropdown: props => (
        <FilterDropdown {...props}>
          <Input.Search placeholder="Tìm tổng tiền..." />
        </FilterDropdown>
      ),
    },
    {
      dataIndex: 'average_weight',
      title: 'TB kg/con',
      align: 'right',
      sorter: true,
      mobileRole: 'hidden',
      render: (v: number) => v != null && `${v} kg`,
    },
    {
      dataIndex: 'note',
      title: 'Ghi chú',
      ellipsis: true,
      sorter: true,
      mobileRole: 'hidden',
      filterDropdown: props => (
        <FilterDropdown {...props}>
          <Input.Search placeholder="Tìm ghi chú..." />
        </FilterDropdown>
      ),
    },
    {
      dataIndex: 'created_at',
      title: 'Ngày tạo',
      sorter: true,
      responsive: ['xl'],
      mobileRole: 'hidden',
      render: (v: string) => v && <RelativeTime value={v} />,
      filterDropdown: props => (
        <FilterDropdown {...props}>
          <Input.Search placeholder="Tìm ngày tạo..." />
        </FilterDropdown>
      ),
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
        resource="purchases"
        columns={columns}
        filters={filters}
        sorters={sorters}
        meta={{
          select:
            '*,supplier:suppliers(*),purchase_items(*,product:products(*))',
        }}
        rowKey="id"
      />
    </AntdList>
  );
};
