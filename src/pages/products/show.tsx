import {
  CreateButton,
  DeleteButton,
  EditButton,
  ListButton,
  useTable,
} from '@refinedev/antd';
import { useNavigation, useShow } from '@refinedev/core';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router';

import {
  MobileShowDetails,
  MobileShowList,
  MobileShowPage,
  MobileShowSection,
  MobileShowTag,
} from '@/components';
import { RelativeTime } from '@/components/relative-time';
import {
  PRODUCT_TYPE_LABELS,
  type IProduct,
  type IPurchaseItem,
  type ISaleItem,
  type ProductType,
} from '@/types';
import {
  DATE_FORMAT,
  DATETIME_FORMAT,
  formatVietnamesePhone,
  joinDetail,
  showMoney,
} from '@/utils';

type PurchaseItemRow = IPurchaseItem & {
  purchase?: {
    id: string;
    purchase_date: string;
    supplier?: { id: string; name: string };
  };
};

type SaleItemRow = ISaleItem & {
  sale?: {
    id: string;
    sale_date: string;
    customer?: { id: string; name?: string | null; phone: string };
  };
};

export const Show = () => {
  const navigate = useNavigate();
  const { list } = useNavigation();
  const { result: record, query } = useShow<IProduct>({
    resource: 'products',
    meta: {
      select: '*,category:product_categories(*)',
    },
  });
  const { isLoading } = query;

  const product_id = record?.id;
  const productType = record?.type as ProductType | undefined;

  const { tableProps: purchaseTableProps } = useTable<PurchaseItemRow>({
    resource: 'purchase_items',
    syncWithLocation: false,
    filters: {
      permanent: product_id
        ? [{ field: 'product_id', operator: 'eq', value: product_id }]
        : [],
    },
    meta: {
      select: '*,purchase:purchases(*,supplier:suppliers(*))',
    },
    sorters: { initial: [{ field: 'created_at', order: 'desc' }] },
    queryOptions: { enabled: !!product_id },
  });

  const { tableProps: saleTableProps } = useTable<SaleItemRow>({
    resource: 'sale_items',
    syncWithLocation: false,
    filters: {
      permanent: product_id
        ? [{ field: 'product_id', operator: 'eq', value: product_id }]
        : [],
    },
    meta: {
      select: '*,sale:sales(*,customer:customers(*))',
    },
    sorters: { initial: [{ field: 'created_at', order: 'desc' }] },
    queryOptions: { enabled: !!product_id },
  });

  const purchaseItems = purchaseTableProps.dataSource ?? [];
  const saleItems = saleTableProps.dataSource ?? [];

  return (
    <MobileShowPage
      loading={isLoading}
      title={record?.name}
      actions={
        <>
          <ListButton />
          <EditButton />
          <DeleteButton onSuccess={() => list('products')} />
          {product_id ? <CreateButton /> : null}
        </>
      }
    >
      <MobileShowDetails
        items={[
          { label: 'Tên sản phẩm', value: record?.name },
          {
            label: 'Loại',
            value: productType && (
              <MobileShowTag>{PRODUCT_TYPE_LABELS[productType]}</MobileShowTag>
            ),
          },
          {
            label: 'Danh mục',
            value: record?.category ? (
              <Link to={`/product_categories/show/${record.category.id}`}>
                {record.category.name}
              </Link>
            ) : (
              record?.category_id
            ),
          },
          {
            label: 'Ngày tạo',
            value: record?.created_at && (
              <RelativeTime value={record.created_at} emptyText="" />
            ),
          },
        ]}
      />

      <MobileShowSection title="Lịch sử nhập hàng">
        <MobileShowList
          dataSource={purchaseItems}
          loading={!!purchaseTableProps.loading}
          getKey={row => row.id}
          onItemClick={row => {
            if (row.purchase?.id) {
              navigate(`/purchases/show/${row.purchase.id}`);
            }
          }}
          renderTitle={row =>
            row.purchase?.purchase_date &&
            dayjs(row.purchase.purchase_date).format(DATE_FORMAT)
          }
          renderDescription={row =>
            joinDetail(
              row.purchase?.supplier?.name,
              row.quantity != null &&
                `${row.quantity} ${row.quantity_unit ?? ''}`.trim(),
              showMoney(row.amount),
              row.note,
            )
          }
        />
      </MobileShowSection>

      <MobileShowSection title="Lịch sử xuất hàng">
        <MobileShowList
          dataSource={saleItems}
          loading={!!saleTableProps.loading}
          getKey={row => row.id}
          onItemClick={row => {
            if (row.sale?.id) {
              navigate(`/sales/show/${row.sale.id}`);
            }
          }}
          renderTitle={row =>
            row.sale?.sale_date &&
            dayjs(row.sale.sale_date).format(DATETIME_FORMAT)
          }
          renderDescription={row =>
            joinDetail(
              row.sale?.customer &&
                (row.sale.customer.name ??
                  formatVietnamesePhone(row.sale.customer.phone)),
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
