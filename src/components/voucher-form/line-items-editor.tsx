import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { DefaultOptionType } from 'antd/es/select';
import type { ReactNode } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  theme,
} from 'antd';

import { InputMoney } from '@/components';
import { useIsMobile } from '@/hooks';
import { formatMoney } from '@/utils';

import { QUANTITY_UNIT_OPTIONS, type VoucherLineItem } from './types';

const { Text } = Typography;

type VoucherLineItemsEditorProps = {
  lines: VoucherLineItem[];
  productOptions: DefaultOptionType[];
  productsLoading?: boolean;
  onSearchProduct: (value: string) => void;
  onUpdateLine: <K extends keyof VoucherLineItem>(
    key: number,
    field: K,
    value: VoucherLineItem[K],
  ) => void;
  onRemoveLine: (key: number) => void;
  onAddLine: () => void;
  label?: string;
  hint?: string;
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
      {children}
    </Text>
  );
}

function MobileLineCard({
  row,
  index,
  productOptions,
  productsLoading,
  onSearchProduct,
  onUpdateLine,
  onRemoveLine,
}: {
  row: VoucherLineItem;
  index: number;
  productOptions: DefaultOptionType[];
  productsLoading?: boolean;
  onSearchProduct: (value: string) => void;
  onUpdateLine: VoucherLineItemsEditorProps['onUpdateLine'];
  onRemoveLine: (key: number) => void;
}) {
  const { token } = theme.useToken();
  const lineAmount = row.quantity * row.unit_price;

  return (
    <Card
      size="small"
      style={{ width: '100%' }}
      styles={{ body: { display: 'flex', flexDirection: 'column', gap: token.marginSM } }}
    >
      <Flex justify="space-between" align="center">
        <Text strong>Dòng {index + 1}</Text>
        <Button
          danger
          type="text"
          size="small"
          icon={<MinusCircleOutlined />}
          onClick={() => onRemoveLine(row.key)}
        >
          Xoá
        </Button>
      </Flex>

      <div>
        <FieldLabel>Sản phẩm</FieldLabel>
        <Select
          placeholder="Chọn sản phẩm"
          value={row.product_id}
          options={productOptions}
          loading={productsLoading}
          showSearch
          onSearch={onSearchProduct}
          filterOption={false}
          optionFilterProp="label"
          allowClear
          style={{ width: '100%' }}
          onChange={v => onUpdateLine(row.key, 'product_id', v)}
        />
      </div>

      <Row gutter={8}>
        <Col span={14}>
          <FieldLabel>Số lượng</FieldLabel>
          <InputNumber
            min={0}
            step={0.1}
            style={{ width: '100%' }}
            value={row.quantity}
            onChange={v => onUpdateLine(row.key, 'quantity', v ?? 0)}
          />
        </Col>
        <Col span={10}>
          <FieldLabel>Đơn vị</FieldLabel>
          <Select
            value={row.quantity_unit}
            options={QUANTITY_UNIT_OPTIONS}
            style={{ width: '100%' }}
            onChange={v => onUpdateLine(row.key, 'quantity_unit', v)}
          />
        </Col>
      </Row>

      <div>
        <FieldLabel>Đơn giá</FieldLabel>
        <InputMoney
          value={row.unit_price}
          onChange={v => onUpdateLine(row.key, 'unit_price', (v as number) ?? 0)}
          style={{ width: '100%' }}
        />
      </div>

      <Flex justify="space-between" align="center">
        <Text type="secondary">Thành tiền</Text>
        <Text strong>{formatMoney(lineAmount)}</Text>
      </Flex>

      <div>
        <FieldLabel>Ghi chú</FieldLabel>
        <Input
          placeholder="Tuỳ chọn"
          value={row.note}
          onChange={e => onUpdateLine(row.key, 'note', e.target.value)}
        />
      </div>
    </Card>
  );
}

export function VoucherLineItemsEditor({
  lines,
  productOptions,
  productsLoading,
  onSearchProduct,
  onUpdateLine,
  onRemoveLine,
  onAddLine,
  label = 'Chi tiết hàng',
  hint = 'Thêm sản phẩm, số lượng, đơn giá. Hệ thống tự tính thành tiền.',
}: VoucherLineItemsEditorProps) {
  const isMobile = useIsMobile();

  const columns = [
    {
      title: '#',
      width: 44,
      render: (_: unknown, _row: VoucherLineItem, index: number) => (
        <Text type="secondary">{index + 1}</Text>
      ),
    },
    {
      title: 'Sản phẩm',
      width: 360,
      render: (_: unknown, row: VoucherLineItem) => (
        <Select
          placeholder="Chọn sản phẩm"
          value={row.product_id}
          options={productOptions}
          loading={productsLoading}
          showSearch
          onSearch={onSearchProduct}
          filterOption={false}
          optionFilterProp="label"
          allowClear
          style={{ width: '100%' }}
          onChange={v => onUpdateLine(row.key, 'product_id', v)}
        />
      ),
    },
    {
      title: 'Số lượng',
      width: 120,
      render: (_: unknown, row: VoucherLineItem) => (
        <InputNumber
          min={0}
          step={0.1}
          style={{ width: '100%' }}
          value={row.quantity}
          onChange={v => onUpdateLine(row.key, 'quantity', v ?? 0)}
        />
      ),
    },
    {
      title: 'Đơn vị',
      width: 110,
      render: (_: unknown, row: VoucherLineItem) => (
        <Select
          value={row.quantity_unit}
          options={QUANTITY_UNIT_OPTIONS}
          style={{ width: '100%' }}
          onChange={v => onUpdateLine(row.key, 'quantity_unit', v)}
        />
      ),
    },
    {
      title: 'Đơn giá',
      width: 160,
      render: (_: unknown, row: VoucherLineItem) => (
        <InputMoney
          value={row.unit_price}
          onChange={v => onUpdateLine(row.key, 'unit_price', (v as number) ?? 0)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      width: 160,
      render: (_: unknown, row: VoucherLineItem) => (
        <Text strong>{formatMoney(row.quantity * row.unit_price)}</Text>
      ),
    },
    {
      title: 'Ghi chú',
      width: 220,
      render: (_: unknown, row: VoucherLineItem) => (
        <Input
          placeholder="Tuỳ chọn"
          value={row.note}
          onChange={e => onUpdateLine(row.key, 'note', e.target.value)}
        />
      ),
    },
    {
      title: '',
      width: 52,
      fixed: 'right' as const,
      render: (_: unknown, row: VoucherLineItem) => (
        <Tooltip title="Xoá dòng">
          <Button
            danger
            type="text"
            icon={<MinusCircleOutlined />}
            onClick={() => onRemoveLine(row.key)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Form.Item label={label} style={{ marginBottom: 0 }}>
      <Space
        direction="vertical"
        size="small"
        style={{ width: '100%', display: 'flex' }}
      >
        {!isMobile ? (
          <Text type="secondary">{hint}</Text>
        ) : null}

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddLine}
          block={isMobile}
        >
          Thêm dòng
        </Button>

        {isMobile ? (
          lines.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có dòng hàng. Nhấn Thêm dòng để bắt đầu."
            />
          ) : (
            <Flex vertical gap="small">
              {lines.map((row, index) => (
                <MobileLineCard
                  key={row.key}
                  row={row}
                  index={index}
                  productOptions={productOptions}
                  productsLoading={productsLoading}
                  onSearchProduct={onSearchProduct}
                  onUpdateLine={onUpdateLine}
                  onRemoveLine={onRemoveLine}
                />
              ))}
            </Flex>
          )
        ) : (
          <Table
            rowKey="key"
            dataSource={lines}
            columns={columns}
            pagination={false}
            size="small"
            scroll={{ x: true }}
          />
        )}
      </Space>
    </Form.Item>
  );
}
