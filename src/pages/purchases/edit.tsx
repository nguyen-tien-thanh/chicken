import { Edit as AntdEdit, useForm } from '@refinedev/antd';
import {
  useCreate,
  useDelete,
  useInvalidate,
  useSelect,
  useUpdate,
  useWarnAboutChange,
} from '@refinedev/core';
import type { FormProps } from 'antd';
import {
  App,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import {
  VoucherLineItemsEditor,
  VoucherSummaryBox,
  type VoucherLineItem,
} from '@/components';
import type { IProduct, IPurchase, IPurchaseItem, ISupplier } from '@/types';
import { DATE_FORMAT } from '@/utils';

let nextKey = 1;
function fromExisting(item: IPurchaseItem): VoucherLineItem {
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
  const [lines, setLines] = useState<VoucherLineItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: updatePurchase } = useUpdate();
  const { mutateAsync: createItem } = useCreate();
  const { mutateAsync: updateItem } = useUpdate();
  const { mutateAsync: deleteItem } = useDelete();
  const invalidate = useInvalidate();
  const { setWarnWhen } = useWarnAboutChange();

  const { formProps, saveButtonProps, query } = useForm<IPurchase>({
    resource: 'purchases',
    meta: {
      select: '*,supplier:suppliers(*),purchase_items(*,product:products(*))',
    },
  });

  useEffect(() => {
    const data = query?.data?.data;
    if (data?.purchase_items && lines.length === 0) {
      setLines(data.purchase_items.map(fromExisting));
    }
  }, [query?.data?.data]);

  const {
    options: supplierOptions,
    onSearch: onSearchSupplier,
    query: suppliersQuery,
  } = useSelect({
    resource: 'suppliers',
    optionLabel: (item: ISupplier) => `${item.name} (${item.phone})`,
    optionValue: (item: ISupplier) => item.id,
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

  const total = lines.reduce((sum, row) => {
    if (!row.product_id) return sum;
    return sum + row.quantity * row.unit_price;
  }, 0);

  const onFinish: FormProps['onFinish'] = values => {
    const purchase = query?.data?.data;
    const purchaseId = purchase?.id;
    if (!purchaseId) {
      notification.error({ message: 'Chưa có dữ liệu phiếu nhập' });
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
    const pd = v.purchase_date;
    const purchase_date =
      pd != null && dayjs.isDayjs(pd)
        ? (pd as dayjs.Dayjs).toISOString()
        : typeof pd === 'string'
        ? pd
        : dayjs(pd as string).toISOString();

    const total_amount = validLines.reduce(
      (s, row) => s + row.quantity * row.unit_price,
      0,
    );
    const purchasePayload = {
      supplier_id: v.supplier_id as string,
      purchase_date,
      note: (v.note as string | null | undefined) ?? null,
      average_weight: Number(v.average_weight ?? 0),
      cages_count: Number(v.cages_count ?? 0),
      cages_weight: Number(v.cages_weight ?? 0),
      total_amount,
    };

    return (async () => {
      setIsSaving(true);
      try {
        await updatePurchase({
          resource: 'purchases',
          id: purchaseId,
          values: purchasePayload,
        });

        const existingIds = new Set(
          (purchase.purchase_items ?? []).map(i => i.id),
        );
        const nextIds = new Set(
          validLines.map(r => r.id).filter(Boolean) as string[],
        );
        for (const id of existingIds) {
          if (!nextIds.has(id)) {
            await deleteItem({ resource: 'purchase_items', id });
          }
        }

        for (const row of validLines) {
          const itemValues = {
            product_id: row.product_id!,
            quantity: row.quantity,
            quantity_unit: row.quantity_unit,
            unit_price: row.unit_price,
            amount: row.quantity * row.unit_price,
            note: row.note ?? null,
          };
          if (row.id) {
            await updateItem({
              resource: 'purchase_items',
              id: row.id,
              values: itemValues,
            });
          } else {
            await createItem({
              resource: 'purchase_items',
              values: { ...itemValues, purchase_id: purchaseId },
            });
          }
        }

        await invalidate({ resource: 'purchases', invalidates: ['list'] });
        await invalidate({ resource: 'purchase_items', invalidates: ['list'] });
        const refetched = await query?.refetch();
        const fresh = refetched?.data?.data as IPurchase | undefined;
        if (fresh) {
          nextKey = 1;
          setLines((fresh.purchase_items ?? []).map(fromExisting));
        }
        setWarnWhen(false);
        notification.success({ message: 'Đã cập nhật phiếu nhập' });
      } catch (e: unknown) {
        const msg =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message: unknown }).message)
            : 'Không cập nhật được phiếu nhập';
        notification.error({ message: msg });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <AntdEdit
      saveButtonProps={{
        ...saveButtonProps,
        loading: isSaving,
        disabled: isSaving,
      }}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Nhà cung cấp"
          name="supplier_id"
          rules={[{ required: true }]}
        >
          <Select
            options={supplierOptions}
            loading={suppliersQuery.isFetching}
            showSearch
            onSearch={onSearchSupplier}
            filterOption={false}
            optionFilterProp="label"
          />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Ngày nhập"
              name="purchase_date"
              rules={[{ required: true, message: 'Chọn ngày nhập' }]}
              getValueProps={value => ({
                value:
                  value && dayjs(value as string).isValid()
                    ? dayjs(value as string)
                    : undefined,
              })}
            >
              <DatePicker
                showTime={false}
                style={{ width: '100%' }}
                format={DATE_FORMAT}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Trọng lượng trung bình (kg/con)"
              name="average_weight"
              rules={[{ required: true }]}
            >
              <InputNumber
                suffix="kg/con"
                min={0}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Số lượng lồng"
              name="cages_count"
              rules={[{ required: true }]}
            >
              <InputNumber suffix="lồng" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tổng trọng lượng lồng"
              name="cages_weight"
              rules={[{ required: true }]}
            >
              <InputNumber
                suffix="kg"
                min={0}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea rows={2} />
        </Form.Item>

        <VoucherLineItemsEditor
          label="Chi tiết hàng nhập"
          lines={lines}
          productOptions={productOptions}
          productsLoading={productsQuery.isFetching}
          onSearchProduct={onSearchProduct}
          onUpdateLine={updateLine}
          onRemoveLine={removeLine}
          onAddLine={() => setLines(prev => [...prev, newRow()])}
        />
        <VoucherSummaryBox label="Tổng thành tiền (ước tính):" amount={total} />
      </Form>
    </AntdEdit>
  );
};
