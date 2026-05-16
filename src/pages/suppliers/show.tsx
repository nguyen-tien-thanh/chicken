import { Show as AntdShow, ShowButton, useTable } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Button, Card, Descriptions, Space, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router';

import { LocationShowValue } from '@/components';
import { RelativeTime } from '@/components/relative-time';
import type { IPurchase, ISupplier } from '@/types';
import { formatMoney } from '@/utils';

export const Show = () => {
  const { result: record, query } = useShow<ISupplier>({
    resource: 'suppliers',
  });
  const { isLoading } = query;

  const supplier_id = record?.id;

  const { tableProps } = useTable<IPurchase>({
    resource: 'purchases',
    syncWithLocation: false,
    filters: {
      permanent: supplier_id
        ? [{ field: 'supplier_id', operator: 'eq', value: supplier_id }]
        : [],
    },
    sorters: { initial: [{ field: 'purchase_date', order: 'desc' }] },
    queryOptions: { enabled: !!supplier_id },
  });

  return (
    <AntdShow isLoading={isLoading}>
      <Space style={{ marginBottom: 16 }} wrap>
        {supplier_id ? (
          <Link to={`/purchases/create?supplier_id=${supplier_id}`}>
            <Button type="primary">Tạo phiếu nhập</Button>
          </Link>
        ) : null}
        <Link to="/suppliers">
          <Button>Danh sách nhà cung cấp</Button>
        </Link>
      </Space>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Descriptions
          bordered
          column={2}
          size="small"
          styles={{ label: { width: 180, fontWeight: 500 } }}
        >
          <Descriptions.Item label="Mã" span={2}>
            <Typography.Text copyable={!!record?.id}>
              {record?.id ?? '—'}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tên nhà cung cấp">
            {record?.name ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Tên ngân hàng">
            {record?.bank_name ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Điện thoại">
            {record?.phone ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Số tài khoản">
            {record?.bank_account ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {record?.address ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Vị trí" span={2}>
            <LocationShowValue
              latitude={record?.latitude}
              longitude={record?.longitude}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {record?.created_at ? (
              <RelativeTime value={record.created_at} />
            ) : (
              '—'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật">
            {record?.updated_at ? (
              <RelativeTime value={record.updated_at} />
            ) : (
              '—'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Typography.Title level={5} style={{ marginTop: 24 }}>
        Phiếu nhập hàng
      </Typography.Title>
      <Table<IPurchase>
        {...tableProps}
        rowKey="id"
        size="small"
        scroll={{ x: true }}
        columns={[
          {
            dataIndex: 'purchase_date',
            title: 'Ngày nhập',
            sorter: true,
            defaultSortOrder: 'descend',
            render: (v: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
          },
          {
            dataIndex: 'cages_count',
            title: 'Số lồng',
            align: 'right',
            render: (v: number) => (v != null ? `${v} lồng` : '—'),
          },
          {
            dataIndex: 'cages_weight',
            title: 'Tổng trọng lượng lồng',
            align: 'right',
            render: (v: number) => (v != null ? `${v} kg` : '—'),
          },
          {
            dataIndex: 'total_amount',
            title: 'Tổng tiền',
            align: 'right',
            render: (v: number) => (
              <Typography.Text strong>{formatMoney(v)}</Typography.Text>
            ),
          },
          {
            dataIndex: 'average_weight',
            title: 'TB kg/con',
            render: (v: number) => (v != null ? `${v} kg` : '—'),
          },
          {
            dataIndex: 'note',
            title: 'Ghi chú',
            ellipsis: true,
          },
          {
            title: 'Thao tác',
            fixed: 'right',
            render: (_, row: IPurchase) => (
              <ShowButton resource="purchases" recordItemId={row.id} />
            ),
          },
        ]}
      />
    </AntdShow>
  );
};
