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
} from '@/components';
import { RelativeTime } from '@/components/relative-time';
import type { IPurchase, ISupplier } from '@/types';
import { DATE_FORMAT, joinDetail, showMoney } from '@/utils';

export const Show = () => {
  const navigate = useNavigate();
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

  const purchases = tableProps.dataSource ?? [];

  return (
    <MobileShowPage
      loading={isLoading}
      actions={
        <>
          <ListButton />
          <EditButton />
          <DeleteButton />
          {supplier_id ? <CreateButton /> : null}
        </>
      }
    >
      <MobileShowDetails
        items={[
          { label: 'Tên nhà cung cấp', value: record?.name },
          { label: 'Điện thoại', value: record?.phone },
          { label: 'Tên ngân hàng', value: record?.bank_name },
          { label: 'Số tài khoản', value: record?.bank_account },
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

      <MobileShowSection title="Phiếu nhập hàng">
        <MobileShowList
          dataSource={purchases}
          loading={!!tableProps.loading}
          getKey={row => row.id}
          onItemClick={row => navigate(`/purchases/show/${row.id}`)}
          renderTitle={row =>
            row.purchase_date && dayjs(row.purchase_date).format(DATE_FORMAT)
          }
          renderDescription={row =>
            joinDetail(
              row.cages_count != null && `${row.cages_count} lồng`,
              row.cages_weight != null && `${row.cages_weight} kg`,
              showMoney(row.total_amount),
              row.average_weight != null && `${row.average_weight} kg/con`,
              row.note,
            )
          }
        />
      </MobileShowSection>
    </MobileShowPage>
  );
};
