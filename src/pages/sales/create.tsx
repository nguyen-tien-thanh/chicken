import { UserAddOutlined } from '@ant-design/icons';
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
  Button,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import {
  VoucherLineItemsEditor,
  VoucherSummaryBox,
  type VoucherLineItem,
} from '@/components';
import type { ICustomer, IProduct } from '@/types';
import type { SaleStatus } from '@/types';
import {
  DATETIME_FORMAT,
  formatVietnamesePhone,
  normalizeVietnamesePhone,
} from '@/utils';

import { SaleDiscountField, SaleNoteField, SaleStatusField } from './form-fields';

type FormValues = {
  customer_id?: string;
  sale_date?: dayjs.Dayjs;
  discount_amount?: number;
  paid_amount?: number;
  status?: SaleStatus;
  note?: string;
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
  const query_customer_id = searchParams.get('customer_id') ?? undefined;

  const [lines, setLines] = useState<VoucherLineItem[]>([newRow()]);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [createCustomerForm] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);

  const { mutate: createCustomer } = useCreate();
  const { mutateAsync: createSale } = useCreate({
    successNotification: false,
  });
  const { mutateAsync: createSaleItems } = useCreateMany({
    successNotification: false,
  });
  const invalidate = useInvalidate();
  const { setWarnWhen } = useWarnAboutChange();

  const { formProps, saveButtonProps, form } = useForm({
    resource: 'sales',
    redirect: 'show',
    defaultFormValues: {
      ...(query_customer_id ? { customer_id: query_customer_id } : {}),
      sale_date: dayjs(),
      discount_amount: 0,
      paid_amount: 0,
      status: 'PENDING' as SaleStatus,
    } as never,
  });

  const {
    options: customerOptions,
    onSearch: onSearchCustomer,
    query: customersQuery,
  } = useSelect({
    resource: 'customers',
    optionLabel: (item: ICustomer) =>
      `${
        item.name ?? formatVietnamesePhone(item.phone)
      } (${formatVietnamesePhone(item.phone)})`,
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

  function handleOpenCreateCustomer() {
    setCustomerSelectOpen(false);
    createCustomerForm.setFieldsValue({ phone: customerSearchText, name: '' });
    setCreateCustomerOpen(true);
  }

  function handleCreateCustomer() {
    createCustomerForm.validateFields().then(values => {
      createCustomer(
        {
          resource: 'customers',
          values: {
            ...values,
            phone: normalizeVietnamesePhone(String(values.phone ?? '')),
          },
        },
        {
          onSuccess: data => {
            form?.setFieldValue('customer_id', data.data.id);
            customersQuery.refetch();
            setCreateCustomerOpen(false);
            setCustomerSelectOpen(false);
            createCustomerForm.resetFields();
          },
        },
      );
    });
  }

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

  const subtotal = lines.reduce((sum, row) => {
    if (!row.product_id) return sum;
    return sum + (row.quantity ?? 0) * row.unit_price;
  }, 0);

  const discountAmount = Number(Form.useWatch('discount_amount', form) ?? 0);
  const total = Math.max(0, subtotal - discountAmount);

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
    const discount_amount = Number(v.discount_amount ?? 0);
    const status = v.status ?? 'PENDING';
    const items = validLines.map(row => {
      const amount = row.quantity! * row.unit_price;
      return {
        product_id: row.product_id!,
        quantity: row.quantity!,
        quantity_unit: row.quantity_unit,
        unit_price: row.unit_price,
        amount,
        note: row.note ?? null,
        cost_amount: 0,
        profit_amount: amount,
      };
    });
    const subtotal_amount = items.reduce((s, row) => s + row.amount, 0);
    const final_amount = Math.max(0, subtotal_amount - discount_amount);
    const paid_amount =
      status === 'PAID' ? Number(v.paid_amount ?? final_amount) : 0;
    const remaining_amount = Math.max(0, final_amount - paid_amount);
    const salePayload = {
      customer_id: v.customer_id,
      sale_date: v.sale_date
        ? dayjs(v.sale_date).toISOString()
        : dayjs().toISOString(),
      note: v.note ?? null,
      discount_amount,
      paid_amount,
      status,
      subtotal_amount,
      final_amount,
      remaining_amount,
    };
    return (async () => {
      setIsSaving(true);
      try {
        const { data: created } = await createSale({
          resource: 'sales',
          values: salePayload,
        });
        const saleId = created?.id as string | undefined;
        if (!saleId) {
          throw new Error('Không lấy được id phiếu bán sau khi tạo');
        }
        await createSaleItems({
          resource: 'sale_items',
          values: items.map(row => ({ ...row, sale_id: saleId })),
        });
        await invalidate({ resource: 'sales', invalidates: ['list'] });
        await invalidate({ resource: 'sale_items', invalidates: ['list'] });
        notification.success({ message: 'Đã tạo phiếu bán' });
        setWarnWhen(false);
        show('sales', saleId);
      } catch (e: unknown) {
        const msg =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message: unknown }).message)
            : 'Không tạo được phiếu bán';
        notification.error({ message: msg });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <AntdCreate
      isLoading={isSaving}
      saveButtonProps={saveButtonProps}
      footerButtons={({ defaultButtons }) => (
        <Flex vertical gap={8}>
          <VoucherSummaryBox label="Tổng tiền:" amount={total} />
          <Flex justify="flex-end" gap={8}>
            {defaultButtons}
          </Flex>
        </Flex>
      )}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Khách hàng"
          name="customer_id"
          rules={[{ required: true, message: 'Chọn khách hàng' }]}
        >
          <Select
            options={customerOptions}
            loading={customersQuery.isFetching}
            showSearch
            open={customerSelectOpen}
            onOpenChange={setCustomerSelectOpen}
            onChange={() => setCustomerSelectOpen(false)}
            onSearch={v => {
              setCustomerSearchText(v);
              onSearchCustomer(v);
            }}
            filterOption={false}
            optionFilterProp="label"
            placeholder="Chọn khách hàng"
            popupRender={menu => (
              <>
                {menu}
                <Divider style={{ margin: '4px 0' }} />
                <Button
                  type="link"
                  icon={<UserAddOutlined />}
                  style={{ width: '100%', textAlign: 'left' }}
                  onMouseDown={e => e.preventDefault()}
                  onClick={handleOpenCreateCustomer}
                >
                  Tạo khách hàng mới
                  {customerSearchText ? ` "${customerSearchText}"` : ''}
                </Button>
              </>
            )}
          />
        </Form.Item>

        <Modal
          title="Tạo khách hàng mới"
          open={createCustomerOpen}
          onCancel={() => setCreateCustomerOpen(false)}
          onOk={handleCreateCustomer}
          okText="Tạo"
          cancelText="Huỷ"
          destroyOnHidden
        >
          <Form form={createCustomerForm} layout="vertical">
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: 'Nhập số điện thoại' }]}
            >
              <Input placeholder="0912345678" />
            </Form.Item>
            <Form.Item label="Tên khách hàng" name="name">
              <Input placeholder="Tuỳ chọn" />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address">
              <Input placeholder="Tuỳ chọn" />
            </Form.Item>
          </Form>
        </Modal>

        <Form.Item
          label="Ngày bán"
          name="sale_date"
          rules={[{ required: true, message: 'Chọn ngày bán' }]}
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            format={DATETIME_FORMAT}
          />
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

        {form ? <SaleDiscountField form={form} /> : null}

        {form ? <SaleStatusField form={form} total={total} /> : null}

        {form ? <SaleNoteField form={form} /> : null}
      </Form>
    </AntdCreate>
  );
};
