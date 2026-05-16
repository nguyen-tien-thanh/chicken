import type { ICustomer } from '@/types/customer';
import type { IProduct } from '@/types/product';
import type { IPurchase } from '@/types/purchase';
import type { ISale } from '@/types/sale';
import type { ISupplier } from '@/types/supplier';
import { formatMoney } from '@/utils/formatMoney';
import { normalizeVietnamese } from '@/utils/normalizeVietnamese';
import {
  AppstoreOutlined,
  FallOutlined,
  RiseOutlined,
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useList } from '@refinedev/core';
import { AutoComplete, Input, Typography } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStyles } from './styled';

const { Text } = Typography;

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const norm = normalizeVietnamese(text.toLowerCase());
  const normQ = normalizeVietnamese(query.toLowerCase());
  const idx = norm.indexOf(normQ);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <Text strong style={{ color: 'inherit' }}>
        {text.slice(idx, idx + query.length)}
      </Text>
      {text.slice(idx + query.length)}
    </>
  );
}

interface GroupOption extends DefaultOptionType {
  label: React.ReactNode;
  options: DefaultOptionType[];
}

export const GlobalSearch: React.FC = () => {
  const { styles } = useStyles();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const enabled = query.trim().length >= 1;

  const { result: productsData } = useList<IProduct>({
    resource: 'products',
    pagination: { pageSize: 3 },
    filters: enabled
      ? [{ field: 'name', operator: 'contains', value: query }]
      : [],
    queryOptions: { enabled },
  });

  const { result: customersData } = useList<ICustomer>({
    resource: 'customers',
    pagination: { pageSize: 3 },
    filters: enabled
      ? [{ field: 'name', operator: 'contains', value: query }]
      : [],
    queryOptions: { enabled },
  });

  const { result: suppliersData } = useList<ISupplier>({
    resource: 'suppliers',
    pagination: { pageSize: 3 },
    filters: enabled
      ? [
          {
            operator: 'or',
            value: [
              { field: 'name', operator: 'contains', value: query },
              { field: 'phone', operator: 'contains', value: query },
            ],
          },
        ]
      : [],
    queryOptions: { enabled },
  });

  const { result: salesData } = useList<ISale>({
    resource: 'sales',
    pagination: { pageSize: 3 },
    filters: enabled
      ? [
          {
            operator: 'or',
            value: [
              { field: 'customer.name', operator: 'contains', value: query },
              { field: 'customer.phone', operator: 'contains', value: query },
            ],
          },
        ]
      : [],
    meta: { include: { customer: true } },
    queryOptions: { enabled },
  });

  const { result: purchasesData } = useList<IPurchase>({
    resource: 'purchases',
    pagination: { pageSize: 3 },
    filters: enabled
      ? [{ field: 'supplier.name', operator: 'contains', value: query }]
      : [],
    meta: { include: { supplier: true } },
    queryOptions: { enabled },
  });

  const options = useMemo<GroupOption[]>(() => {
    const groups: GroupOption[] = [];

    const products = productsData?.data ?? [];
    if (products.length > 0) {
      groups.push({
        label: (
          <span>
            <AppstoreOutlined style={{ marginRight: 6 }} />
            Sản phẩm
          </span>
        ),
        options: products.map(p => ({
          value: `products:${p.id}`,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{highlight(p.name, query)}</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {p.category?.name}
              </Text>
            </div>
          ),
        })),
      });
    }

    const customers = customersData?.data ?? [];
    if (customers.length > 0) {
      groups.push({
        label: (
          <span>
            <UserOutlined style={{ marginRight: 6 }} />
            Khách hàng
          </span>
        ),
        options: customers.map(c => ({
          value: `customers:${c.id}`,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{highlight(c.name ?? '', query)}</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {c.phone}
              </Text>
            </div>
          ),
        })),
      });
    }

    const suppliers = suppliersData?.data ?? [];
    if (suppliers.length > 0) {
      groups.push({
        label: (
          <span>
            <ShopOutlined style={{ marginRight: 6 }} />
            Nhà cung cấp
          </span>
        ),
        options: suppliers.map(s => ({
          value: `suppliers:${s.id}`,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{highlight(s.name, query)}</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {s.phone}
              </Text>
            </div>
          ),
        })),
      });
    }

    const sales = salesData?.data ?? [];
    if (sales.length > 0) {
      groups.push({
        label: (
          <span>
            <RiseOutlined style={{ marginRight: 6 }} />
            Phiếu xuất
          </span>
        ),
        options: sales.map(s => ({
          value: `sales:${s.id}`,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {s.customer?.name
                  ? highlight(s.customer.name, query)
                  : `#${s.id}`}
              </span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatMoney(s.final_amount)}
              </Text>
            </div>
          ),
        })),
      });
    }

    const purchases = purchasesData?.data ?? [];
    if (purchases.length > 0) {
      groups.push({
        label: (
          <span>
            <FallOutlined style={{ marginRight: 6 }} />
            Phiếu nhập
          </span>
        ),
        options: purchases.map(p => ({
          value: `purchases:${p.id}`,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {p.supplier?.name
                  ? highlight(p.supplier.name, query)
                  : `#${p.id}`}
              </span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatMoney(p.total_amount)}
              </Text>
            </div>
          ),
        })),
      });
    }

    return groups;
  }, [
    productsData,
    customersData,
    suppliersData,
    salesData,
    purchasesData,
    query,
  ]);

  const handleSelect = (value: string) => {
    const [resource, id] = value.split(':');
    navigate(`/${resource}/show/${id}`);
    setQuery('');
    setOpen(false);
  };

  return (
    <AutoComplete
      style={{ width: '100%', maxWidth: '550px' }}
      options={options}
      value={query}
      open={open && enabled}
      filterOption={false}
      onSearch={val => {
        setQuery(val);
        setOpen(true);
      }}
      onSelect={handleSelect}
      onBlur={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      notFoundContent={enabled ? 'Không tìm thấy kết quả' : null}
    >
      <Input
        size="large"
        placeholder="Tìm kiếm sản phẩm, khách hàng, nhà cung cấp..."
        suffix={<div className={styles.inputSuffix}>/</div>}
        prefix={<SearchOutlined className={styles.inputPrefix} />}
      />
    </AutoComplete>
  );
};
