import {
  List as AntdList,
  DeleteButton,
  EditButton,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import { Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { Link, useSearchParams } from 'react-router';

import { ResponsiveTable, type ResponsiveColumnType } from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { MEDIA_MD_DOWN, useMediaQuery } from '@/hooks';
import { SALE_STATUS_LABELS, type ISale, type SaleStatus } from '@/types';
import { DATETIME_FORMAT, formatMoney } from '@/utils';
import { useNavigation } from '@refinedev/core';

const statusColor: Record<SaleStatus, string> = {
  PENDING: 'orange',
  PAID: 'green',
  CANCELLED: 'red',
};

export const List = () => {
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);
  const [searchParams] = useSearchParams();
  const customer_idParam = searchParams.get('customer_id');
  const { list } = useNavigation();
  const { tableProps, filters, sorters } = useTable<ISale>({
    syncWithLocation: true,
    resource: 'sales',
    meta: {
      select: '*,customer:customers(*),sale_items(*,product:products(*))',
    },
    filters: {
      ...(customer_idParam
        ? {
            permanent: [
              {
                field: 'customer_id',
                operator: 'eq',
                value: customer_idParam,
              },
            ],
          }
        : {}),
      initial: [],
    },
    sorters: { initial: [{ field: 'sale_date', order: 'desc' }] },
    queryOptions: { enabled: !isMobile },
  });

  const columns: ResponsiveColumnType<ISale>[] = [
    {
      title: 'Ngày bán',
      sorter: true,
      defaultSortOrder: 'descend',
      dataIndex: 'sale_date',
      mobileRole: 'title',
      render: (_, r) =>
        r.sale_date && dayjs(r.sale_date).format(DATETIME_FORMAT),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_id',
      mobileRole: 'subtitle',
      render: (_, r) =>
        r.customer ? (
          <Link to={`/customers/show/${r.customer.id}`}>
            {r.customer.name ?? r.customer.phone}
          </Link>
        ) : (
          r.customer_id
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, r) =>
        r.status ? (
          <Tag color={statusColor[r.status]}>
            {SALE_STATUS_LABELS[r.status]}
          </Tag>
        ) : null,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'final_amount',
      align: 'right',
      render: (_, r) => (
        <Typography.Text strong>{formatMoney(r.final_amount)}</Typography.Text>
      ),
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paid_amount',
      align: 'right',
      render: (_, r) => formatMoney(r.paid_amount),
    },
    {
      title: 'Còn lại',
      dataIndex: 'remaining_amount',
      align: 'right',
      render: (_, r) => formatMoney(r.remaining_amount),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      responsive: ['xl'],
      mobileRole: 'hidden',
      render: (v: string) =>
        v ? (
          <Typography.Text ellipsis style={{ maxWidth: 200 }}>
            {v}
          </Typography.Text>
        ) : null,
    },
    {
      dataIndex: 'created_at',
      title: 'Ngày tạo',
      sorter: true,
      responsive: ['xl'],
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
          <DeleteButton
            hideText
            recordItemId={record.id}
            onSuccess={() => list('sales')}
          />
        </Space>
      ),
    },
  ];

  return (
    <AntdList>
      <ResponsiveTable
        {...tableProps}
        resource="sales"
        columns={columns}
        filters={filters}
        sorters={sorters}
        meta={{
          select: '*,customer:customers(*),sale_items(*,product:products(*))',
        }}
        rowKey="id"
      />
    </AntdList>
  );
};
