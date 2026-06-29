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
} from '@/components';
import { RelativeTime } from '@/components/relative-time';
import type { IPurchase } from '@/types';
import { DATE_FORMAT, joinDetail, showMoney } from '@/utils';

export const Show = () => {
  const { result: record, query } = useShow<IPurchase>({
    meta: {
      select: '*,supplier:suppliers(*),purchase_items(*,product:products(*))',
    },
  });
  const { isLoading } = query;

  const items = record?.purchase_items ?? [];

  return (
    <MobileShowPage
      loading={isLoading}
      actions={
        <>
          <ListButton />
          <EditButton />
          <DeleteButton />
          {record?.id ? <CreateButton /> : null}
        </>
      }
    >
      <MobileShowDetails
        items={[
          {
            label: 'Ngày nhập',
            value:
              record?.purchase_date &&
              dayjs(record.purchase_date).format(DATE_FORMAT),
          },
          {
            label: 'Nhà cung cấp',
            value: record?.supplier && (
              <Link to={`/suppliers/show/${record.supplier.id}`}>
                {record.supplier.name} — {record.supplier.phone}
              </Link>
            ),
          },
          {
            label: 'Trung bình',
            value:
              record?.average_weight != null &&
              `${record.average_weight} kg/con`,
          },
          { label: 'Tổng tiền', value: showMoney(record?.total_amount) },
          {
            label: 'Số lượng lồng',
            value: record?.cages_count != null && `${record.cages_count} lồng`,
          },
          {
            label: 'Tổng trọng lượng lồng',
            value: record?.cages_weight != null && `${record.cages_weight} kg`,
          },
          { label: 'Ghi chú', value: record?.note },
          {
            label: 'Ngày tạo',
            value: record?.created_at && (
              <RelativeTime value={record.created_at} emptyText="" />
            ),
          },
        ]}
      />

      <MobileShowSection title="Chi tiết hàng nhập">
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
              row.note,
            )
          }
        />
      </MobileShowSection>
    </MobileShowPage>
  );
};
