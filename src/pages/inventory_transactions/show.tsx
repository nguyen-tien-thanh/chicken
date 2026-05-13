import { Show as AntdShow } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import {
  Button,
  Card,
  Descriptions,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
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

type PurchaseItemLookup = { id: string; purchase_id: string };
type SaleItemLookup = { id: string; sale_id: string };

function RefDocumentButton({ record }: { record: IInventoryTransaction }) {
  const { ref_type, ref_id } = record;
  if (!ref_id) return null;

  const isPurchase = ref_type === "PURCHASE";
  const isSale = ref_type === "SALE";

  const purchaseItem = useOne<PurchaseItemLookup>({
    resource: "purchase_items",
    id: ref_id,
    queryOptions: { enabled: isPurchase },
    meta: { select: "*,purchase:purchases(*)" },
  });

  const saleItem = useOne<SaleItemLookup>({
    resource: "sale_items",
    id: ref_id,
    queryOptions: { enabled: isSale },
    meta: { select: "*,sale:sales(*)" },
  });

  if (isPurchase) {
    const purchase_id = purchaseItem.result?.purchase_id;
    const loading = purchaseItem.query.isLoading;
    const disabled = !purchase_id || loading;
    return (
      <Tooltip
        title={
          loading
            ? "Đang tải phiếu tham chiếu…"
            : disabled
            ? "Không tìm thấy phiếu nhập từ refId"
            : "Mở phiếu nhập"
        }
      >
        <Link to={purchase_id ? `/purchases/show/${purchase_id}` : "#"}>
          <Button type="primary" size="small" disabled={disabled}>
            Mở phiếu nhập
          </Button>
        </Link>
      </Tooltip>
    );
  }

  if (isSale) {
    const sale_id = saleItem.result?.sale_id;
    const loading = saleItem.query.isLoading;
    const disabled = !sale_id || loading;
    return (
      <Tooltip
        title={
          loading
            ? "Đang tải phiếu tham chiếu…"
            : disabled
            ? "Không tìm thấy phiếu bán từ refId"
            : "Mở phiếu bán"
        }
      >
        <Link to={sale_id ? `/sales/show/${sale_id}` : "#"}>
          <Button type="primary" size="small" disabled={disabled}>
            Mở phiếu bán
          </Button>
        </Link>
      </Tooltip>
    );
  }

  return null;
}

export const Show = () => {
  const { result: record, query } = useShow<IInventoryTransaction>({
    meta: {
      select: "*,product:products(*)",
    },
  });
  const { isLoading } = query;

  const rt = record?.ref_type as InventoryTransactionType | undefined;
  const dir = record?.direction as InventoryTransactionDirection | undefined;

  return (
    <AntdShow isLoading={isLoading}>
      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Descriptions
          bordered
          column={2}
          size="small"
          styles={{ label: { width: 160, fontWeight: 500 } }}
        >
          <Descriptions.Item label="Mã giao dịch">
            <Typography.Text copyable={!!record?.id}>
              {record?.id}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày giao dịch">
            {record?.transaction_date
              ? dayjs(record.transaction_date).format("DD/MM/YYYY HH:mm")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Loại tham chiếu">
            {rt ? (
              <Tag>{INVENTORY_TX_TYPE_LABELS[rt]}</Tag>
            ) : (
              (record?.ref_type as string) ?? "—"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Mã tham chiếu">
            <Space wrap align="center">
              <Typography.Text code>{record?.ref_id ?? "—"}</Typography.Text>
              {record ? <RefDocumentButton record={record} /> : null}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Chiều">
            {dir ? (
              <Tag color={dir === "IN" ? "green" : "orange"}>
                {INVENTORY_TX_DIRECTION_LABELS[dir]}
              </Tag>
            ) : (
              "—"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Sản phẩm">
            {record?.product ? (
              <Link to={`/products/show/${record.product.id}`}>
                {record.product.name}
              </Link>
            ) : (
              record?.product_id ?? "—"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng">
            {record?.quantity != null ? record.quantity : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị tính">
            {record?.quantity_unit ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Giá vốn đơn vị">
            {formatMoney(record?.unit_cost)}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng giá vốn">
            {formatMoney(record?.total_cost)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            {record?.note ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi nhận lúc">
            {record?.created_at ? (
              <RelativeTime value={record.created_at} />
            ) : (
              "—"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </AntdShow>
  );
};
