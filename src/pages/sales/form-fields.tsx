import { Button, Flex, Form, Input, type FormInstance } from 'antd';
import { useEffect, useState } from 'react';

import { InputMoney } from '@/components';
import { SALE_STATUS_OPTIONS, type SaleStatus } from '@/types';

type StatusPillsInputProps = {
  value?: SaleStatus;
  onChange?: (value: SaleStatus) => void;
  form: FormInstance;
  total: number;
};

function StatusPillsInput({
  value,
  onChange,
  form,
  total,
}: StatusPillsInputProps) {
  function selectStatus(next: SaleStatus) {
    onChange?.(next);
    if (next === 'PAID') {
      form.setFieldValue('paid_amount', total);
    } else {
      form.setFieldValue('paid_amount', 0);
    }
  }

  return (
    <Flex gap={8} wrap="wrap">
      {SALE_STATUS_OPTIONS.map(opt => (
        <Button
          key={opt.value}
          type={value === opt.value ? 'primary' : 'default'}
          shape="round"
          onClick={() => selectStatus(opt.value as SaleStatus)}
        >
          {opt.label}
        </Button>
      ))}
    </Flex>
  );
}

type SaleStatusFieldProps = {
  form: FormInstance;
  total: number;
};

export function SaleStatusField({ form, total }: SaleStatusFieldProps) {
  const status = Form.useWatch('status', form) as SaleStatus | undefined;

  return (
    <>
      <Form.Item
        label="Trạng thái phiếu bán"
        name="status"
        rules={[{ required: true, message: 'Chọn trạng thái' }]}
      >
        <StatusPillsInput form={form} total={total} />
      </Form.Item>
      {status === 'PAID' ? (
        <Form.Item label="Đã thanh toán" name="paid_amount">
          <InputMoney style={{ width: '100%' }} />
        </Form.Item>
      ) : null}
    </>
  );
}

type SaleNoteFieldProps = {
  form: FormInstance;
  label?: string;
};

function OptionalFormLink({
  label,
  onOpen,
}: {
  label: string;
  onOpen: () => void;
}) {
  return (
    <Button
      type="link"
      onClick={onOpen}
      style={{ padding: 0, height: 'auto' }}
    >
      + {label}
    </Button>
  );
}

export function SaleDiscountField({
  form,
  label = 'Giảm giá',
}: {
  form: FormInstance;
  label?: string;
}) {
  const discount = Form.useWatch('discount_amount', form);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (Number(discount ?? 0) > 0) setOpen(true);
  }, [discount]);

  if (!open) {
    return <OptionalFormLink label={label} onOpen={() => setOpen(true)} />;
  }

  return (
    <Form.Item label={label} name="discount_amount">
      <InputMoney style={{ width: '100%' }} />
    </Form.Item>
  );
}

export function SaleNoteField({
  form,
  label = 'Ghi chú phiếu',
}: SaleNoteFieldProps) {
  const note = Form.useWatch('note', form) as string | null | undefined;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (note?.trim()) setOpen(true);
  }, [note]);

  if (!open) {
    return <OptionalFormLink label={label} onOpen={() => setOpen(true)} />;
  }

  return (
    <Form.Item label={label} name="note">
      <Input.TextArea rows={2} placeholder="Tuỳ chọn" />
    </Form.Item>
  );
}
