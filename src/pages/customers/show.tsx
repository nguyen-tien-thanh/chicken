import { Show as AntdShow, ShowButton, useTable } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import {
  Button,
  Card,
  Descriptions,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { Link } from "react-router";

import { RelativeTime } from "@/components/relative-time";
import {
  SALE_STATUS_LABELS,
  type ICustomer,
  type ISale,
  type SaleStatus,
} from "@/types";
import { formatMoney } from "@/utils";

const statusColor: Record<SaleStatus, string> = {
  PENDING: "orange",
  PAID: "green",
  CANCELLED: "red",
};

export const Show = () => {
  const { result: record, query } = useShow<ICustomer>({
    resource: "customers",
  });
  const { isLoading } = query;

  const customer_id = record?.id;

  const { tableProps } = useTable<ISale>({
    resource: "sales",
    syncWithLocation: false,
    filters: {
      permanent: customer_id
        ? [{ field: "customer_id", operator: "eq", value: customer_id }]
        : [],
    },
    sorters: { initial: [{ field: "sale_date", order: "desc" }] },
    queryOptions: { enabled: !!customer_id },
  });

  return (
    <AntdShow isLoading={isLoading}>
      <Space style={{ marginBottom: 16 }} wrap>
        {customer_id ? (
          <Link to={`/sales/create?customer_id=${customer_id}`}>
            <Button type="primary">Tạo phiếu bán</Button>
          </Link>
        ) : null}
        <Link to="/customers">
          <Button>Danh sách khách hàng</Button>
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
              {record?.id ?? "—"}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tên khách hàng">
            {record?.name ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Điện thoại">
            {record?.phone ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {record?.address ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {record?.created_at ? (
              <RelativeTime value={record.created_at} />
            ) : (
              "—"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật">
            {record?.updated_at ? (
              <RelativeTime value={record.updated_at} />
            ) : (
              "—"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Typography.Title level={5} style={{ marginTop: 24 }}>
        Phiếu bán hàng
      </Typography.Title>
      <Table<ISale>
        {...tableProps}
        rowKey="id"
        size="small"
        scroll={{ x: true }}
        columns={[
          {
            dataIndex: "sale_date",
            title: "Ngày bán",
            sorter: true,
            defaultSortOrder: "descend",
            render: (v: string) =>
              v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—",
          },
          {
            dataIndex: "status",
            title: "Trạng thái",
            render: (v: SaleStatus) =>
              v ? (
                <Tag color={statusColor[v]}>{SALE_STATUS_LABELS[v]}</Tag>
              ) : (
                "—"
              ),
          },
          {
            dataIndex: "final_amount",
            title: "Thành tiền",
            render: (v: number) => (
              <Typography.Text strong>{formatMoney(v)}</Typography.Text>
            ),
          },
          {
            dataIndex: "paid_amount",
            title: "Đã thanh toán",
            render: (v: number) => formatMoney(v),
          },
          {
            dataIndex: "remaining_amount",
            title: "Còn lại",
            render: (v: number) => formatMoney(v),
          },
          {
            dataIndex: "note",
            title: "Ghi chú",
            ellipsis: true,
          },
          {
            title: "Thao tác",
            fixed: "right",
            render: (_, row: ISale) => (
              <ShowButton resource="sales" recordItemId={row.id} />
            ),
          },
        ]}
      />
    </AntdShow>
  );
};
