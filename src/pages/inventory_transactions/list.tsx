import { List as AntdList, ShowButton, useTable } from '@refinedev/antd';
import { useOne } from '@refinedev/core';
import { Button, Space, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router';

import { ResponsiveTable, type ResponsiveColumnType } from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { MEDIA_MD_DOWN, useMediaQuery } from '@/hooks';
import {
  INVENTORY_TX_DIRECTION_LABELS,
  INVENTORY_TX_TYPE_LABELS,
  type IInventoryTransaction,
  type InventoryTransactionDirection,
  type InventoryTransactionType,
} from '@/types';
import { DATETIME_FORMAT, formatMoney } from '@/utils';

function RefLink({
  type,
  ref_id,
}: {
  type: InventoryTransactionType;
  ref_id: string;
}) {
  const isPurchase = type === 'PURCHASE';

  const { result, query } = useOne<{
    id: string;
    purchase_id?: string;
    sale_id?: string;
  }>({
    resource: isPurchase ? 'purchase_items' : 'sale_items',
    id: ref_id,
    meta: {
      select: isPurchase ? 'id,purchase_id' : 'id,sale_id',
    },
  });

  const parent_id = isPurchase ? result?.purchase_id : result?.sale_id;
  const isLoading = query.isLoading;
  const label = INVENTORY_TX_TYPE_LABELS[type] ?? type;

  if (isLoading) return <span>{label}</span>;
  if (!parent_id)
    return (
      <Tooltip title="Không tìm thấy phiếu tham chiếu">
        <span>{label}</span>
      </Tooltip>
    );

  return (
    <Link to={`/${isPurchase ? 'purchases' : 'sales'}/show/${parent_id}`}>
      <Button type="link" size="small" style={{ padding: 0 }}>
        {label}
      </Button>
    </Link>
  );
}

export const List = () => {
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);

  const { tableProps, filters, sorters } = useTable<IInventoryTransaction>({
    syncWithLocation: true,
    resource: 'inventory_transactions',
    meta: {
      select: '*,product:products(*)',
    },
    sorters: { initial: [{ field: 'transaction_date', order: 'desc' }] },
    queryOptions: { enabled: !isMobile },
  });

  const columns: ResponsiveColumnType<IInventoryTransaction>[] = [
    {
      dataIndex: 'transaction_date',
      title: 'Ngày giao dịch',
      sorter: true,
      defaultSortOrder: 'descend',
      mobileRole: 'title',
      render: (v: string) => v && dayjs(v).format(DATETIME_FORMAT),
    },
    {
      key: 'product',
      title: 'Sản phẩm',
      mobileRole: 'subtitle',
      render: (_, r) =>
        r.product ? (
          <Link to={`/products/show/${r.product.id}`}>{r.product.name}</Link>
        ) : null,
    },
    {
      dataIndex: 'ref_type',
      title: 'Loại tham chiếu',
      render: (t: InventoryTransactionType, record) => (
        <RefLink type={t} ref_id={record.ref_id} />
      ),
    },
    {
      dataIndex: 'direction',
      title: 'Chiều',
      render: (d: InventoryTransactionDirection) => (
        <Tag color={d === 'IN' ? 'green' : 'orange'}>
          {INVENTORY_TX_DIRECTION_LABELS[d] ?? d}
        </Tag>
      ),
    },
    {
      dataIndex: 'quantity',
      title: 'Số lượng',
      align: 'right',
      render: (quantity: number, record) =>
        `${quantity} ${record.quantity_unit}`,
    },
    {
      dataIndex: 'total_cost',
      title: 'Tổng giá vốn',
      align: 'right',
      render: (n: number) => n != null && formatMoney(n),
    },
    {
      dataIndex: 'created_at',
      title: 'Ghi nhận',
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
          <ShowButton hideText recordItemId={record.id} />
        </Space>
      ),
    },
  ];

  return (
    <AntdList>
      <ResponsiveTable
        {...tableProps}
        resource="inventory_transactions"
        columns={columns}
        filters={filters}
        sorters={sorters}
        meta={{ select: '*,product:products(*)' }}
        rowKey="id"
        scroll={{ x: true }}
      />
    </AntdList>
  );
};
