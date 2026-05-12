import { List as AntdList, ShowButton, useTable } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import { Button, Space, Table, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router";

import { RelativeTime } from "@/components/relative-time";
import {
  INVENTORY_TX_DIRECTION_LABELS,
  INVENTORY_TX_TYPE_LABELS,
  type IInventoryTransaction,
  type InventoryTransactionDirection,
  type InventoryTransactionType,
} from "@/types";
import { formatMoney } from "@/utils";

function RefLink({
  type,
  ref_id,
}: {
  type: InventoryTransactionType;
  ref_id: string;
}) {
  const isPurchase = type === "PURCHASE";

  const { result, query } = useOne<{
    id: string;
    purchase_id?: string;
    sale_id?: string;
  }>({
    resource: isPurchase ? "purchase-items" : "sale-items",
    id: ref_id,
    meta: {
      select: isPurchase ? "id,purchase_id" : "id,sale_id",
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
    <Link to={`/${isPurchase ? "purchases" : "sales"}/show/${parent_id}`}>
      <Button type="link" size="small" style={{ padding: 0 }}>
        {label}
      </Button>
    </Link>
  );
}

export const List = () => {
  const { tableProps } = useTable<IInventoryTransaction>({
    syncWithLocation: true,
    resource: "inventory_transactions",
    meta: {
      include: {
        product: { select: { id: true, name: true, type: true } },
      },
    },
    filters: {
      initial: [
        { field: "ref_type", operator: "eq", value: undefined },
        { field: "direction", operator: "eq", value: undefined },
      ],
    },
    sorters: { initial: [{ field: "transaction_date", order: "desc" }] },
  });

  return (
    <AntdList>
      <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
        <Table.Column
          dataIndex="transaction_date"
          title="Ngày giao dịch"
          sorter
          defaultSortOrder="descend"
          render={(v: string) =>
            v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"
          }
        />
        <Table.Column
          dataIndex="ref_type"
          title="Loại tham chiếu"
          render={(
            t: InventoryTransactionType,
            record: IInventoryTransaction
          ) => <RefLink type={t} ref_id={record.ref_id} />}
        />
        <Table.Column
          dataIndex="direction"
          title="Chiều"
          render={(d: InventoryTransactionDirection) => (
            <Tag color={d === "IN" ? "green" : "orange"}>
              {INVENTORY_TX_DIRECTION_LABELS[d] ?? d}
            </Tag>
          )}
        />
        <Table.Column
          title="Sản phẩm"
          render={(_, r: IInventoryTransaction) =>
            r.product ? (
              <Link to={`/products/show/${r.product.id}`}>
                {r.product.name}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <Table.Column dataIndex="quantity" title="Số lượng" align="right" />
        <Table.Column dataIndex="quantity_unit" title="Đơn vị" width={80} />
        <Table.Column
          dataIndex="total_cost"
          title="Tổng giá vốn"
          align="right"
          render={(n: number) => (n != null ? formatMoney(n) : "—")}
        />
        <Table.Column
          dataIndex="created_at"
          title="Ghi nhận"
          sorter
          render={(v: string) => (v ? <RelativeTime value={v} /> : "—")}
        />
        <Table.Column
          title="Thao tác"
          dataIndex="actions"
          fixed="right"
          render={(_, record) => (
            <Space>
              <ShowButton hideText recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </AntdList>
  );
};
