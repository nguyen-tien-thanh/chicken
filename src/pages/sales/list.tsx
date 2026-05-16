import {
  List as AntdList,
  DeleteButton,
  EditButton,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import { Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { Link, useSearchParams } from 'react-router';

import { RelativeTime } from '@/components/relative-time';
import { SALE_STATUS_LABELS, type ISale, type SaleStatus } from '@/types';
import { formatMoney } from '@/utils';

const statusColor: Record<SaleStatus, string> = {
  PENDING: 'orange',
  PAID: 'green',
  CANCELLED: 'red',
};

export const List = () => {
  const [searchParams] = useSearchParams();
  const customer_idParam = searchParams.get('customer_id');

  const { tableProps } = useTable<ISale>({
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
  });

  return (
    <AntdList>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Ngày bán"
          sorter
          defaultSortOrder="descend"
          dataIndex="sale_date"
          render={(_, r: ISale) =>
            r.sale_date ? dayjs(r.sale_date).format('DD/MM/YYYY') : '—'
          }
        />
        <Table.Column
          title="Khách hàng"
          dataIndex="customer_id"
          render={(_, r: ISale) =>
            r.customer ? (
              <Link to={`/customers/show/${r.customer.id}`}>
                {r.customer.name ?? r.customer.phone}
              </Link>
            ) : (
              r.customer_id ?? '—'
            )
          }
        />
        <Table.Column
          title="Trạng thái"
          dataIndex="status"
          render={(_, r: ISale) =>
            r.status ? (
              <Tag color={statusColor[r.status]}>
                {SALE_STATUS_LABELS[r.status]}
              </Tag>
            ) : null
          }
        />
        <Table.Column
          title="Thành tiền"
          dataIndex="final_amount"
          align="right"
          render={(_, r: ISale) => (
            <Typography.Text strong>
              {formatMoney(r.final_amount)}
            </Typography.Text>
          )}
        />
        <Table.Column
          title="Đã thanh toán"
          dataIndex="paid_amount"
          align="right"
          render={(_, r: ISale) => formatMoney(r.paid_amount)}
        />
        <Table.Column
          title="Còn lại"
          dataIndex="remaining_amount"
          align="right"
          render={(_, r: ISale) => formatMoney(r.remaining_amount)}
        />
        <Table.Column
          title="Ghi chú"
          dataIndex="note"
          responsive={['xl']}
          render={(v: string) =>
            v ? (
              <Typography.Text ellipsis style={{ maxWidth: 200 }}>
                {v}
              </Typography.Text>
            ) : null
          }
        />
        <Table.Column
          dataIndex="created_at"
          title="Ngày tạo"
          sorter
          responsive={['xl']}
          render={(v: string) => (v ? <RelativeTime value={v} /> : '—')}
        />
        <Table.Column
          title="Thao tác"
          dataIndex="actions"
          fixed="right"
          render={(_, record) => (
            <Space>
              <EditButton hideText recordItemId={record.id} />
              <ShowButton hideText recordItemId={record.id} />
              <DeleteButton hideText recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </AntdList>
  );
};
