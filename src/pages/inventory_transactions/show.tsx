import { ListButton } from '@refinedev/antd';
import { useOne, useShow } from '@refinedev/core';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router';

import { MobileShowDetails, MobileShowPage, MobileShowTag } from '@/components';
import { RelativeTime } from '@/components/relative-time';
import {
  INVENTORY_TX_DIRECTION_LABELS,
  INVENTORY_TX_TYPE_LABELS,
  type IInventoryTransaction,
  type InventoryTransactionDirection,
  type InventoryTransactionType,
} from '@/types';
import { DATETIME_FORMAT, showMoney } from '@/utils';

type PurchaseItemLookup = { id: string; purchase_id: string };
type SaleItemLookup = { id: string; sale_id: string };

function RefDocumentButton({ record }: { record: IInventoryTransaction }) {
  const { ref_type, ref_id } = record;
  if (!ref_id) return null;

  const isPurchase = ref_type === 'PURCHASE';
  const isSale = ref_type === 'SALE';

  const purchaseItem = useOne<PurchaseItemLookup>({
    resource: 'purchase_items',
    id: ref_id,
    queryOptions: { enabled: isPurchase },
    meta: { select: '*,purchase:purchases(*)' },
  });

  const saleItem = useOne<SaleItemLookup>({
    resource: 'sale_items',
    id: ref_id,
    queryOptions: { enabled: isSale },
    meta: { select: '*,sale:sales(*)' },
  });

  if (isPurchase) {
    const purchase_id = purchaseItem.result?.purchase_id;
    const loading = purchaseItem.query.isLoading;
    const disabled = !purchase_id || loading;

    return (
      <Link to={purchase_id ? `/purchases/show/${purchase_id}` : '#'}>
        <Button
          type="primary"
          size="small"
          disabled={disabled}
          loading={loading}
        >
          Mở phiếu nhập
        </Button>
      </Link>
    );
  }

  if (isSale) {
    const sale_id = saleItem.result?.sale_id;
    const loading = saleItem.query.isLoading;
    const disabled = !sale_id || loading;

    return (
      <Link to={sale_id ? `/sales/show/${sale_id}` : '#'}>
        <Button
          type="primary"
          size="small"
          disabled={disabled}
          loading={loading}
        >
          Mở phiếu bán
        </Button>
      </Link>
    );
  }

  return null;
}

export const Show = () => {
  const { result: record, query } = useShow<IInventoryTransaction>({
    meta: {
      select: '*,product:products(*)',
    },
  });
  const { isLoading } = query;

  const rt = record?.ref_type as InventoryTransactionType | undefined;
  const dir = record?.direction as InventoryTransactionDirection | undefined;

  return (
    <MobileShowPage loading={isLoading} actions={<ListButton />}>
      <MobileShowDetails
        items={[
          {
            label: 'Ngày giao dịch',
            value:
              record?.transaction_date &&
              dayjs(record.transaction_date).format(DATETIME_FORMAT),
          },
          {
            label: 'Loại tham chiếu',
            value: rt && (
              <MobileShowTag>{INVENTORY_TX_TYPE_LABELS[rt]}</MobileShowTag>
            ),
          },
          {
            label: 'Phiếu liên quan',
            value: record && <RefDocumentButton record={record} />,
            hidden: !record?.ref_id,
          },
          {
            label: 'Chiều',
            value: dir && (
              <MobileShowTag color={dir === 'IN' ? 'success' : 'warning'}>
                {INVENTORY_TX_DIRECTION_LABELS[dir]}
              </MobileShowTag>
            ),
          },
          {
            label: 'Sản phẩm',
            value: record?.product && (
              <Link to={`/products/show/${record.product.id}`}>
                {record.product.name}
              </Link>
            ),
          },
          {
            label: 'Số lượng',
            value: record?.quantity != null ? record.quantity : undefined,
          },
          { label: 'Đơn vị tính', value: record?.quantity_unit },
          { label: 'Giá vốn đơn vị', value: showMoney(record?.unit_cost) },
          { label: 'Tổng giá vốn', value: showMoney(record?.total_cost) },
          { label: 'Ghi chú', value: record?.note },
          {
            label: 'Ghi nhận lúc',
            value: record?.created_at && (
              <RelativeTime value={record.created_at} emptyText="" />
            ),
          },
        ]}
      />
    </MobileShowPage>
  );
};
