import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Collapse,
  Empty,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { InputMoney, InputQuantity } from '@/components';
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
    <Text
      type="secondary"
      style={{ fontSize: 12, display: 'block', marginBottom: 4 }}
    >
      {children}
    </Text>
  );
}

function MobileLineFields({
  row,
  productOptions,
  productsLoading,
  onSearchProduct,
  onUpdateLine,
}: {
  row: VoucherLineItem;
  productOptions: DefaultOptionType[];
  productsLoading?: boolean;
  onSearchProduct: (value: string) => void;
  onUpdateLine: VoucherLineItemsEditorProps['onUpdateLine'];
}) {
  const { token } = theme.useToken();
  const lineAmount = (row.quantity ?? 0) * row.unit_price;

  return (
    <Flex vertical gap={token.marginSM}>
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
          <InputQuantity
            value={row.quantity}
            onChange={v => onUpdateLine(row.key, 'quantity', v)}
          />
        </Col>
        <Col span={10}>
          <FieldLabel>Đơn vị</FieldLabel>
          <Select
            value={row.quantity_unit}
            options={QUANTITY_UNIT_OPTIONS}
            style={{ width: '100%', height: '36px' }}
            onChange={v => onUpdateLine(row.key, 'quantity_unit', v)}
          />
        </Col>
      </Row>

      <div>
        <FieldLabel>Đơn giá</FieldLabel>
        <InputMoney
          value={row.unit_price}
          onChange={v =>
            onUpdateLine(row.key, 'unit_price', (v as number) ?? 0)
          }
          style={{ width: '100%' }}
        />
      </div>

      <Flex justify="space-between" align="center">
        <Text type="secondary">Thành tiền</Text>
        <Text strong>{formatMoney(lineAmount)}</Text>
      </Flex>
    </Flex>
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
  const lineKeys = lines.map(row => String(row.key));
  const [activeLineKeys, setActiveLineKeys] = useState(lineKeys);
  const prevLineKeysRef = useRef(lineKeys);

  useEffect(() => {
    const prevKeys = prevLineKeysRef.current;
    const addedKeys = lineKeys.filter(key => !prevKeys.includes(key));
    const removedKeys = prevKeys.filter(key => !lineKeys.includes(key));

    if (addedKeys.length === 1 && prevKeys.length > 0) {
      setActiveLineKeys(addedKeys);
    } else if (addedKeys.length > 0 && prevKeys.length === 0) {
      setActiveLineKeys(lineKeys);
    } else if (removedKeys.length > 0) {
      setActiveLineKeys(prev => prev.filter(key => lineKeys.includes(key)));
    }

    prevLineKeysRef.current = lineKeys;
  }, [lineKeys.join(',')]);

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
        <InputQuantity
          value={row.quantity}
          onChange={v => onUpdateLine(row.key, 'quantity', v)}
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
          onChange={v =>
            onUpdateLine(row.key, 'unit_price', (v as number) ?? 0)
          }
        />
      ),
    },
    {
      title: 'Thành tiền',
      width: 160,
      render: (_: unknown, row: VoucherLineItem) => (
        <Text strong>{formatMoney((row.quantity ?? 0) * row.unit_price)}</Text>
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
    <Form.Item label={label}>
      <Space
        direction="vertical"
        size="small"
        style={{ width: '100%', display: 'flex' }}
      >
        {!isMobile ? <Text type="secondary">{hint}</Text> : null}

        {isMobile ? (
          lines.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có dòng hàng. Nhấn Thêm dòng để bắt đầu."
            />
          ) : (
            <Collapse
              activeKey={activeLineKeys}
              onChange={keys =>
                setActiveLineKeys(Array.isArray(keys) ? keys : [keys])
              }
              items={lines.map((row, index) => {
                const productLabel = productOptions.find(
                  o => o.value === row.product_id,
                )?.label;
                const lineAmount = (row.quantity ?? 0) * row.unit_price;

                const titleDetail = [
                  `#${index + 1}`,
                  productLabel,
                  row.quantity != null
                    ? `${row.quantity} ${row.quantity_unit}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return {
                  key: String(row.key),
                  label: (
                    <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Text ellipsis type="secondary">
                        {titleDetail}
                      </Text>
                      <Text strong>{formatMoney(lineAmount)}</Text>
                    </Flex>
                  ),
                  extra: (
                    <Button
                      danger
                      size="small"
                      icon={<MinusCircleOutlined />}
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveLine(row.key);
                      }}
                    >
                      Xoá
                    </Button>
                  ),
                  children: (
                    <MobileLineFields
                      row={row}
                      productOptions={productOptions}
                      productsLoading={productsLoading}
                      onSearchProduct={onSearchProduct}
                      onUpdateLine={onUpdateLine}
                    />
                  ),
                };
              })}
            />
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

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddLine}
          block={isMobile}
        >
          Thêm dòng
        </Button>
      </Space>
    </Form.Item>
  );
}
