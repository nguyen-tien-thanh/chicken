import { Show as AntdShow } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Button, Card, Descriptions, Space, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router';

import { RelativeTime } from '@/components/relative-time';
import type { IPurchase, IPurchaseItem } from '@/types';
import { formatMoney } from '@/utils';

export const Show = () => {
  const { result: record, query } = useShow<IPurchase>({
    meta: {
      select: '*,supplier:suppliers(*),purchase_items(*,product:products(*))',
    },
  });
  const { isLoading } = query;

  const items = record?.purchase_items ?? [];

  return (
    <AntdShow isLoading={isLoading}>
      <Space style={{ marginBottom: 16 }} wrap>
        {record?.supplier ? (
          <Link to={`/suppliers/show/${record.supplier.id}`}>
            <Button>Xem nhà cung cấp</Button>
          </Link>
        ) : null}
        <Link to="/purchases">
          <Button>Danh sách phiếu nhập</Button>
        </Link>
      </Space>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Mã phiếu">
            <Typography.Text copyable={!!record?.id}>
              {record?.id ?? '—'}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày nhập">
            {record?.purchase_date
              ? dayjs(record.purchase_date).format('DD/MM/YYYY')
              : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp" span={2}>
            {record?.supplier ? (
              <Link to={`/suppliers/show/${record.supplier.id}`}>
                {record.supplier.name} — {record.supplier.phone}
              </Link>
            ) : (
              record?.supplier_id ?? '—'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Trung bình">
            {record?.average_weight ?? '—'} kg/con
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <Typography.Text strong>
              {formatMoney(record?.total_amount)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng lồng">
            {record?.cages_count ?? '—'} lồng
          </Descriptions.Item>
          <Descriptions.Item label="Tổng trọng lượng lồng">
            {record?.cages_weight ?? '—'} kg
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {record?.note ?? '—'}
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

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Chi tiết hàng nhập
      </Typography.Title>
      <Table<IPurchaseItem>
        rowKey="id"
        dataSource={items}
        pagination={false}
        size="small"
        scroll={{ x: true }}
        columns={[
          {
            title: 'Sản phẩm',
            render: (_, row) =>
              row.product ? (
                <Link to={`/products/show/${row.product.id}`}>
                  {row.product.name}
                </Link>
              ) : (
                row.product_id
              ),
          },
          { dataIndex: 'quantity', title: 'Số lượng' },
          { dataIndex: 'quantity_unit', title: 'Đơn vị' },
          {
            dataIndex: 'unit_price',
            title: 'Đơn giá',
            render: (n: number) => formatMoney(n),
          },
          {
            dataIndex: 'amount',
            title: 'Thành tiền',
            render: (n: number) => formatMoney(n),
          },
          { dataIndex: 'note', title: 'Ghi chú', ellipsis: true },
        ]}
      />
    </AntdShow>
  );
};
