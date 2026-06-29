import { Create as AntdCreate, useForm } from '@refinedev/antd';
import {
  useCreate,
  useCreateMany,
  useInvalidate,
  useNavigation,
  useSelect,
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
import { useSearchParams } from 'react-router';

import {
  FullScreenSpin,
  VoucherLineItemsEditor,
  VoucherSummaryBox,
  type VoucherLineItem,
} from '@/components';
import type { IProduct, ISupplier } from '@/types';
import { DATE_FORMAT } from '@/utils';

type FormValues = {
  supplier_id?: string;
  purchase_date?: dayjs.Dayjs;
  note?: string;
  average_weight?: number;
  cages_count?: number;
  cages_weight?: number;
};

let nextKey = 1;
function newRow(defaultProductId?: string): VoucherLineItem {
  return {
    key: nextKey++,
    quantity_unit: 'kg',
    quantity: null,
    unit_price: 0,
    ...(defaultProductId ? { product_id: defaultProductId } : {}),
  };
}

export const Create = () => {
  const { notification } = App.useApp();
  const { show } = useNavigation();
  const [searchParams] = useSearchParams();
  const supplier_idFromQuery = searchParams.get('supplier_id') ?? undefined;

  const [lines, setLines] = useState<VoucherLineItem[]>([newRow()]);
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: createPurchase } = useCreate({
    successNotification: false,
  });
  const { mutateAsync: createPurchaseItems } = useCreateMany({
    successNotification: false,
  });
  const invalidate = useInvalidate();
  const { setWarnWhen } = useWarnAboutChange();

  const { formProps, saveButtonProps } = useForm({
    resource: 'purchases',
    redirect: 'show',
    defaultFormValues: {
      ...(supplier_idFromQuery ? { supplier_id: supplier_idFromQuery } : {}),
      purchase_date: dayjs(),
    } as never,
  });

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

  const defaultProductId = productOptions[0]?.value as string | undefined;

  useEffect(() => {
    if (!defaultProductId) return;
    setLines(prev => {
      if (prev.every(row => row.product_id)) return prev;
      return prev.map(row =>
        row.product_id ? row : { ...row, product_id: defaultProductId },
      );
    });
  }, [defaultProductId]);

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
              quantity: null,
            }
          : newRow(defaultProductId),
      ];
    });
  }

  const total = lines.reduce((sum, row) => {
    if (!row.product_id) return sum;
    return sum + (row.quantity ?? 0) * row.unit_price;
  }, 0);

  const onFinish: FormProps['onFinish'] = values => {
    const v = values as FormValues;
    const validLines = lines.filter(row => row.product_id);
    if (validLines.length === 0) {
      notification.warning({
        message: 'Thêm ít nhất một dòng có chọn sản phẩm',
      });
      return Promise.resolve();
    }
    if (validLines.some(row => row.quantity == null)) {
      notification.warning({ message: 'Nhập số lượng cho từng dòng' });
      return Promise.resolve();
    }
    const items = validLines.map(row => ({
      product_id: row.product_id!,
      quantity: row.quantity!,
      quantity_unit: row.quantity_unit,
      unit_price: row.unit_price,
      amount: row.quantity! * row.unit_price,
      note: row.note ?? null,
    }));
    const total_amount = items.reduce((s, row) => s + row.amount, 0);
    const purchasePayload = {
      supplier_id: v.supplier_id,
      purchase_date: v.purchase_date
        ? dayjs(v.purchase_date).toISOString()
        : dayjs().toISOString(),
      note: v.note ?? null,
      average_weight: Number(v.average_weight ?? 0),
      cages_count: Number(v.cages_count ?? 0),
      cages_weight: Number(v.cages_weight ?? 0),
      total_amount,
    };
    return (async () => {
      setIsSaving(true);
      try {
        const { data: created } = await createPurchase({
          resource: 'purchases',
          values: purchasePayload,
        });
        const purchaseId = created?.id as string | undefined;
        if (!purchaseId) {
          throw new Error('Không lấy được id phiếu nhập sau khi tạo');
        }
        await createPurchaseItems({
          resource: 'purchase_items',
          values: items.map(row => ({ ...row, purchase_id: purchaseId })),
        });
        await invalidate({ resource: 'purchases', invalidates: ['list'] });
        await invalidate({ resource: 'purchase_items', invalidates: ['list'] });
        notification.success({ message: 'Đã tạo phiếu nhập' });
        setWarnWhen(false);
        show('purchases', purchaseId);
      } catch (e: unknown) {
        const msg =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message: unknown }).message)
            : 'Không tạo được phiếu nhập';
        notification.error({ message: msg });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  if (suppliersQuery.isLoading || productsQuery.isLoading) {
    return <FullScreenSpin />;
  }

  return (
    <AntdCreate
      isLoading={isSaving}
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
          label="Nhà cung cấp"
          name="supplier_id"
          rules={[{ required: true, message: 'Chọn nhà cung cấp' }]}
        >
          <Select
            options={supplierOptions}
            loading={suppliersQuery.isFetching}
            showSearch
            onSearch={onSearchSupplier}
            filterOption={false}
            optionFilterProp="label"
            placeholder="Chọn nhà cung cấp"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Ngày nhập"
              name="purchase_date"
              rules={[{ required: true, message: 'Chọn ngày nhập' }]}
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
              rules={[
                {
                  required: true,
                  message: 'Nhập Trọng lượng trung bình',
                },
              ]}
            >
              <InputNumber
                suffix="kg/con"
                style={{ width: '100%' }}
                placeholder="Trọng lượng trung bình"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Số lượng lồng"
              name="cages_count"
              rules={[{ required: true, message: 'Nhập số lượng lồng' }]}
            >
              <InputNumber
                suffix="lồng"
                style={{ width: '100%' }}
                placeholder="Số lượng lồng"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tổng trọng lượng lồng"
              name="cages_weight"
              rules={[
                { required: true, message: 'Nhập tổng trọng lượng lồng' },
              ]}
            >
              <InputNumber
                suffix="kg"
                style={{ width: '100%' }}
                placeholder="Tổng trọng lượng lồng"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ghi chú phiếu" name="note">
          <Input.TextArea rows={2} placeholder="Tuỳ chọn" />
        </Form.Item>

        <VoucherLineItemsEditor
          label="Chi tiết hàng nhập"
          lines={lines}
          productOptions={productOptions}
          productsLoading={productsQuery.isFetching}
          onSearchProduct={onSearchProduct}
          onUpdateLine={updateLine}
          onRemoveLine={removeLine}
          onAddLine={addLine}
        />
      </Form>
    </AntdCreate>
  );
};
