import {
  CreateButton,
  DeleteButton,
  EditButton,
  ListButton,
  useTable,
} from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';

import {
  LocationShowValue,
  MobileShowDetails,
  MobileShowList,
  MobileShowPage,
  MobileShowSection,
  MobileShowTag,
} from '@/components';
import { RelativeTime } from '@/components/relative-time';
import {
  SALE_STATUS_LABELS,
  type ICustomer,
  type ISale,
  type SaleStatus,
} from '@/types';
import { DATETIME_FORMAT, joinDetail, showMoney } from '@/utils';

const statusColor: Record<
  SaleStatus,
  'warning' | 'success' | 'danger' | 'default'
> = {
  PENDING: 'warning',
  PAID: 'success',
  CANCELLED: 'danger',
};

export const Show = () => {
  const navigate = useNavigate();
  const { result: record, query } = useShow<ICustomer>({
    resource: 'customers',
  });
  const { isLoading } = query;

  const customer_id = record?.id;

  const { tableProps } = useTable<ISale>({
    resource: 'sales',
    syncWithLocation: false,
    filters: {
      permanent: customer_id
        ? [{ field: 'customer_id', operator: 'eq', value: customer_id }]
        : [],
    },
    sorters: { initial: [{ field: 'sale_date', order: 'desc' }] },
    queryOptions: { enabled: !!customer_id },
  });

  const sales = tableProps.dataSource ?? [];

  return (
    <MobileShowPage
      loading={isLoading}
      actions={
        <>
          <ListButton />
          <EditButton />
          <DeleteButton />
          {customer_id ? <CreateButton /> : null}
        </>
      }
    >
      <MobileShowDetails
        items={[
          { label: 'Tên khách hàng', value: record?.name },
          { label: 'Điện thoại', value: record?.phone },
          { label: 'Địa chỉ', value: record?.address },
          {
            label: 'Vị trí',
            value: (
              <LocationShowValue
                latitude={record?.latitude}
                longitude={record?.longitude}
              />
            ),
          },
          {
            label: 'Ngày tạo',
            value: record?.created_at && (
              <RelativeTime value={record.created_at} emptyText="" />
            ),
          },
          {
            label: 'Cập nhật',
            value: record?.updated_at && (
              <RelativeTime value={record.updated_at} emptyText="" />
            ),
          },
        ]}
      />

      <MobileShowSection title="Phiếu bán hàng">
        <MobileShowList
          dataSource={sales}
          loading={!!tableProps.loading}
          getKey={row => row.id}
          onItemClick={row => navigate(`/sales/show/${row.id}`)}
          renderTitle={row =>
            row.sale_date && dayjs(row.sale_date).format(DATETIME_FORMAT)
          }
          renderDescription={row => (
            <>
              {row.status && (
                <MobileShowTag color={statusColor[row.status]}>
                  {SALE_STATUS_LABELS[row.status]}
                </MobileShowTag>
              )}{' '}
              {joinDetail(showMoney(row.final_amount), row.note)}
            </>
          )}
        />
      </MobileShowSection>
    </MobileShowPage>
  );
};
