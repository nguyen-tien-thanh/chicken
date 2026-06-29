import { Edit as AntdEdit, useForm } from '@refinedev/antd';
import {
  useCreate,
  useDeleteMany,
  useInvalidate,
  useNavigation,
  useSelect,
  useUpdate,
  useWarnAboutChange,
} from '@refinedev/core';
import type { FormProps } from 'antd';
import { App, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import {
  InputMoney,
  VoucherLineItemsEditor,
  VoucherSummaryBox,
  type VoucherLineItem,
} from '@/components';
import type { ICustomer, IProduct, ISale, ISaleItem } from '@/types';
import { SALE_STATUS_OPTIONS, type SaleStatus } from '@/types';
import { DATETIME_FORMAT } from '@/utils';

let nextKey = 1;
function fromExisting(item: ISaleItem): VoucherLineItem {
  return {
    key: nextKey++,
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    quantity_unit: item.quantity_unit as 'kg' | 'con',
    unit_price: item.unit_price,
    note: item.note ?? undefined,
  };
}
function newRow(): VoucherLineItem {
  return {
    key: nextKey++,
    quantity_unit: 'kg',
    quantity: 1,
    unit_price: 0,
  };
}

export const Edit = () => {
  const { notification } = App.useApp();
  const { show } = useNavigation();
  const [lines, setLines] = useState<VoucherLineItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: updateSale } = useUpdate({
    successNotification: false,
  });
  const { mutateAsync: createItem } = useCreate({
    successNotification: false,
  });
  const { mutateAsync: updateItem } = useUpdate({
    successNotification: false,
  });
  const { mutateAsync: deleteItems } = useDeleteMany();
  const invalidate = useInvalidate();
  const { setWarnWhen } = useWarnAboutChange();

  const { formProps, saveButtonProps, query, form } = useForm<ISale>({
    resource: 'sales',
    redirect: 'show',
    meta: {
      select: '*,customer:customers(*),sale_items(*,product:products(*))',
    },
  });

  useEffect(() => {
    const data = query?.data?.data;
    if (data?.sale_items && lines.length === 0) {
      setLines(data.sale_items.map(fromExisting));
    }
  }, [query?.data?.data]);

  const customerId = query?.data?.data?.customer_id;

  const {
    options: customerOptions,
    onSearch: onSearchCustomer,
    query: customersQuery,
  } = useSelect({
    resource: 'customers',
    ...(customerId ? { defaultValue: customerId } : {}),
    optionLabel: (item: ICustomer) =>
      `${item.name ?? item.phone} (${item.phone})`,
    optionValue: (item: ICustomer) => item.id,
    onSearch: value => {
      const q = value.trim();
      if (!q) return [];
      return [
        {
          operator: 'or',
          value: [
            { field: 'name', operator: 'contains', value: q },
            { field: 'phone', operator: 'contains', value: q },
          ],
        },
      ];
    },
  });

  const {
    options: productOptions,
    onSearch: onSearchProduct,
    query: productsQuery,
  } = useSelect({
    resource: 'products',
    optionLabel: (item: IProduct) => item.name,
    optionValue: (item: IProduct) => item.id,
  });

  function updateLine<K extends keyof VoucherLineItem>(
    key: number,
    field: K,
    value: VoucherLineItem[K],
  ) {
    setLines(prev =>
      prev.map(row => (row.key === key ? { ...row, [field]: value } : row)),
    );
  }

  function removeLine(key: number) {
    setLines(prev => prev.filter(row => row.key !== key));
  }

  function addLine() {
    setLines(prev => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        last
          ? {
              key: nextKey++,
              product_id: last.product_id,
              quantity_unit: last.quantity_unit,
              unit_price: last.unit_price,
              quantity: 1,
            }
          : newRow(),
      ];
    });
  }

  const subtotal = lines.reduce((sum, row) => {
    if (!row.product_id) return sum;
    return sum + (row.quantity ?? 0) * row.unit_price;
  }, 0);

  const discountAmount = Number(Form.useWatch('discount_amount', form) ?? 0);
  const total = Math.max(0, subtotal - discountAmount);

  const onFinish: FormProps['onFinish'] = values => {
    const sale = query?.data?.data;
    const saleId = sale?.id;
    if (!saleId) {
      notification.error({ message: 'Chưa có dữ liệu phiếu bán' });
      return Promise.resolve();
    }
    const validLines = lines.filter(row => row.product_id);
    if (validLines.length === 0) {
      notification.warning({
        message: 'Thêm ít nhất một dòng có chọn sản phẩm',
      });
      return Promise.resolve();
    }
    const v = values as Record<string, unknown>;
    const sd = v.sale_date;
    const sale_date =
      sd != null && dayjs.isDayjs(sd)
        ? (sd as dayjs.Dayjs).toISOString()
        : typeof sd === 'string'
        ? sd
        : dayjs(sd as string).toISOString();

    const discount_amount = Number(v.discount_amount ?? 0);
    const paid_amount = Number(v.paid_amount ?? 0);
    const subtotal_amount = validLines.reduce(
      (s, row) => s + (row.quantity ?? 0) * row.unit_price,
      0,
    );
    const final_amount = Math.max(0, subtotal_amount - discount_amount);
    const remaining_amount = Math.max(0, final_amount - paid_amount);

    const salePayload = {
      customer_id: v.customer_id as string,
      sale_date,
      note: (v.note as string | null | undefined) ?? null,
      discount_amount,
      paid_amount,
      status: (v.status as SaleStatus) ?? 'PENDING',
      subtotal_amount,
      final_amount,
      remaining_amount,
    };

    return (async () => {
      setIsSaving(true);
      try {
        await updateSale({
          resource: 'sales',
          id: saleId,
          values: salePayload,
        });

        const existingIds = new Set((sale.sale_items ?? []).map(i => i.id));
        const nextIds = new Set(
          validLines.map(r => r.id).filter(Boolean) as string[],
        );
        const idsToDelete = Array.from(existingIds).filter(
          id => !nextIds.has(id),
        );
        if (idsToDelete.length > 0) {
          await deleteItems({
            resource: 'sale_items',
            ids: idsToDelete,
            successNotification: false,
          });
        }

        for (const row of validLines) {
          const amount = (row.quantity ?? 0) * row.unit_price;
          const itemValues = {
            product_id: row.product_id!,
            quantity: row.quantity!,
            quantity_unit: row.quantity_unit,
            unit_price: row.unit_price,
            amount,
            note: row.note ?? null,
            cost_amount: 0,
            profit_amount: amount,
          };
          if (row.id) {
            await updateItem({
              resource: 'sale_items',
              id: row.id,
              values: itemValues,
            });
          } else {
            await createItem({
              resource: 'sale_items',
              values: { ...itemValues, sale_id: saleId },
            });
          }
        }

        await invalidate({ resource: 'sales', invalidates: ['list'] });
        await invalidate({ resource: 'sale_items', invalidates: ['list'] });
        const refetched = await query?.refetch();
        const fresh = refetched?.data?.data as ISale | undefined;
        if (fresh) {
          nextKey = 1;
          setLines((fresh.sale_items ?? []).map(fromExisting));
        }
        setWarnWhen(false);
        notification.success({ message: 'Đã cập nhật phiếu bán' });
        show('sales', saleId);
      } catch (e: unknown) {
        const msg =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message: unknown }).message)
            : 'Không cập nhật được phiếu bán';
        notification.error({ message: msg });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <AntdEdit
      isLoading={
        isSaving || customersQuery.isFetching || productsQuery.isFetching
      }
      saveButtonProps={saveButtonProps}
      footerButtons={({ defaultButtons }) => (
        <>
          <VoucherSummaryBox label="Tổng tiền:" amount={total} />
          {defaultButtons}
        </>
      )}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Khách hàng"
          name="customer_id"
          rules={[{ required: true }]}
        >
          <Select
            options={customerOptions}
            loading={customersQuery.isFetching}
            showSearch
            onSearch={onSearchCustomer}
            filterOption={false}
            optionFilterProp="label"
          />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Ngày bán"
              name="sale_date"
              rules={[{ required: true, message: 'Chọn ngày bán' }]}
              getValueProps={value => ({
                value:
                  value && dayjs(value as string).isValid()
                    ? dayjs(value as string)
                    : undefined,
              })}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                format={DATETIME_FORMAT}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true }]}
            >
              <Select options={SALE_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Giảm giá" name="discount_amount">
              <InputMoney style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Đã thanh toán" name="paid_amount">
              <InputMoney style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea rows={2} />
        </Form.Item>

        <VoucherLineItemsEditor
          label="Chi tiết hàng bán"
          lines={lines}
          productOptions={productOptions}
          productsLoading={productsQuery.isFetching}
          onSearchProduct={onSearchProduct}
          onUpdateLine={updateLine}
          onRemoveLine={removeLine}
          onAddLine={addLine}
        />
      </Form>
    </AntdEdit>
  );
};
