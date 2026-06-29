import {
  CreateButton,
  DeleteButton,
  EditButton,
  ListButton,
} from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import dayjs from 'dayjs';
import { Link } from 'react-router';

import {
  MobileShowDetails,
  MobileShowList,
  MobileShowPage,
  MobileShowSection,
  MobileShowTag,
} from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { SALE_STATUS_LABELS, type ISale, type SaleStatus } from '@/types';
import { DATETIME_FORMAT, joinDetail, showMoney } from '@/utils';

import { SaleInvoiceModal } from './invoice-modal';

const statusColor: Record<
  SaleStatus,
  'warning' | 'success' | 'danger' | 'default'
> = {
  PENDING: 'warning',
  PAID: 'success',
  CANCELLED: 'danger',
};

export const Show = () => {
  const { result: record, query } = useShow<ISale>({
    meta: {
      select: '*,customer:customers(*),sale_items(*,product:products(*))',
    },
  });
  const { isLoading } = query;

  const items = record?.sale_items ?? [];

  return (
    <MobileShowPage
      loading={isLoading}
      actions={
        <>
          <ListButton />
          <EditButton />
          <DeleteButton />
          {record?.id ? <CreateButton /> : null}
          <SaleInvoiceModal sale_id={record?.id} />
        </>
      }
    >
      <MobileShowDetails
        items={[
          {
            label: 'Ngày bán',
            value:
              record?.sale_date &&
              dayjs(record.sale_date).format(DATETIME_FORMAT),
          },
          {
            label: 'Khách hàng',
            value: record?.customer && (
              <Link to={`/customers/show/${record.customer.id}`}>
                {(record.customer.name ?? record.customer.phone) +
                  ' — ' +
                  record.customer.phone}
              </Link>
            ),
          },
          {
            label: 'Trạng thái',
            value: record?.status && (
              <MobileShowTag color={statusColor[record.status]}>
                {SALE_STATUS_LABELS[record.status]}
              </MobileShowTag>
            ),
          },
          { label: 'Tạm tính', value: showMoney(record?.subtotal_amount) },
          { label: 'Giảm giá', value: showMoney(record?.discount_amount) },
          { label: 'Thành tiền', value: showMoney(record?.final_amount) },
          { label: 'Đã thanh toán', value: showMoney(record?.paid_amount) },
          { label: 'Còn lại', value: showMoney(record?.remaining_amount) },
          { label: 'Ghi chú', value: record?.note, hidden: !record?.note },
          {
            label: 'Ngày tạo',
            value: record?.created_at && (
              <RelativeTime value={record.created_at} emptyText="" />
            ),
          },
        ]}
      />

      <MobileShowSection title="Chi tiết hàng bán">
        <MobileShowList
          dataSource={items}
          getKey={row => row.id}
          renderTitle={row =>
            row.product && (
              <Link to={`/products/show/${row.product.id}`}>
                {row.product.name}
              </Link>
            )
          }
          renderDescription={row =>
            joinDetail(
              row.quantity != null &&
                `${row.quantity} ${row.quantity_unit ?? ''}`.trim(),
              showMoney(row.amount),
              row.profit_amount != null && `LN ${showMoney(row.profit_amount)}`,
              row.note,
            )
          }
        />
      </MobileShowSection>
    </MobileShowPage>
  );
};
