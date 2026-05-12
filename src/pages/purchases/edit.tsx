import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Edit as AntdEdit, useForm } from "@refinedev/antd";
import { useSelect } from "@refinedev/core";
import type { FormProps } from "antd";
import {
  App,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { InputMoney } from "@/components";
import type { IProduct, IPurchase, IPurchaseItem, ISupplier } from "@/types";
import { formatMoney } from "@/utils";

const { Text } = Typography;

type LineItem = {
  key: number;
  id?: string;
  product_id?: string;
  quantity: number;
  quantity_unit: "kg" | "con";
  unit_price: number;
  note?: string;
};

let nextKey = 1;
function fromExisting(item: IPurchaseItem): LineItem {
  return {
    key: nextKey++,
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    quantity_unit: item.quantity_unit as "kg" | "con",
    unit_price: item.unit_price,
    note: item.note ?? undefined,
  };
}
function newRow(): LineItem {
  return {
    key: nextKey++,
    quantity_unit: "kg",
    quantity: 1,
    unit_price: 0,
  };
}

export const Edit = () => {
  const { notification } = App.useApp();
  const [lines, setLines] = useState<LineItem[]>([]);

  const { formProps, saveButtonProps, query } = useForm<IPurchase>({
    resource: "purchases",
    meta: {
      include: {
        supplier: { select: { id: true, name: true, phone: true } },
        purchase_items: {
          include: {
            product: { select: { id: true, name: true, type: true } },
          },
        },
      },
    },
  });

  // Sync line items khi data load xong
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
    resource: "suppliers",
    optionLabel: (item: ISupplier) => `${item.name} (${item.phone})`,
    optionValue: (item: ISupplier) => item.id,
  });

  const {
    options: productOptions,
    onSearch: onSearchProduct,
    query: productsQuery,
  } = useSelect({
    resource: "products",
    optionLabel: (item: IProduct) => item.name,
    optionValue: (item: IProduct) => item.id,
  });

  function updateLine<K extends keyof LineItem>(
    key: number,
    field: K,
    value: LineItem[K]
  ) {
    setLines((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  }

  function removeLine(key: number) {
    setLines((prev) => prev.filter((row) => row.key !== key));
  }

  const total = lines.reduce((sum, row) => {
    if (!row.product_id) return sum;
    return sum + row.quantity * row.unit_price;
  }, 0);

  const onFinish: FormProps["onFinish"] = (values) => {
    const next = { ...(values as Record<string, unknown>) };
    delete next.purchase_items;
    delete next.total_amount;
    const pd = next.purchase_date;
    if (pd != null && dayjs.isDayjs(pd)) {
      next.purchase_date = (pd as dayjs.Dayjs).toISOString();
    }
    const validLines = lines.filter((row) => row.product_id);
    if (validLines.length === 0) {
      notification.warning({
        message: "Thêm ít nhất một dòng có chọn sản phẩm",
      });
      return Promise.resolve();
    }
    next.items = validLines.map((row) => ({
      ...(row.id ? { id: row.id } : {}),
      product_id: row.product_id!,
      quantity: row.quantity,
      quantity_unit: row.quantity_unit,
      unit_price: row.unit_price,
      amount: row.quantity * row.unit_price,
      note: row.note ?? null,
    }));
    return formProps.onFinish?.(next as never);
  };

  const columns = [
    {
      title: "#",
      width: 44,
      render: (_: unknown, _row: LineItem, index: number) => (
        <Text type="secondary">{index + 1}</Text>
      ),
    },
    {
      title: "Sản phẩm",
      width: 360,
      render: (_: unknown, row: LineItem) => (
        <Select
          placeholder="Chọn sản phẩm"
          value={row.product_id}
          options={productOptions}
          loading={productsQuery.isFetching}
          showSearch
          onSearch={onSearchProduct}
          filterOption={false}
          optionFilterProp="label"
          allowClear
          style={{ width: "100%" }}
          onChange={(v) => updateLine(row.key, "product_id", v)}
        />
      ),
    },
    {
      title: "Số lượng",
      width: 120,
      render: (_: unknown, row: LineItem) => (
        <InputNumber
          min={0}
          step={0.1}
          style={{ width: "100%" }}
          value={row.quantity}
          onChange={(v) => updateLine(row.key, "quantity", v ?? 0)}
        />
      ),
    },
    {
      title: "Đơn vị",
      width: 110,
      render: (_: unknown, row: LineItem) => (
        <Select
          value={row.quantity_unit}
          options={[
            { value: "kg", label: "kg" },
            { value: "con", label: "con" },
          ]}
          style={{ width: "100%" }}
          onChange={(v) => updateLine(row.key, "quantity_unit", v)}
        />
      ),
    },
    {
      title: "Đơn giá",
      width: 160,
      render: (_: unknown, row: LineItem) => (
        <InputMoney
          value={row.unit_price}
          onChange={(v) =>
            updateLine(row.key, "unit_price", (v as number) ?? 0)
          }
        />
      ),
    },
    {
      title: "Thành tiền",
      width: 160,
      render: (_: unknown, row: LineItem) => (
        <Text strong>{formatMoney(row.quantity * row.unit_price)}</Text>
      ),
    },
    {
      title: "Ghi chú",
      width: 220,
      render: (_: unknown, row: LineItem) => (
        <Input
          placeholder="Tuỳ chọn"
          value={row.note}
          onChange={(e) => updateLine(row.key, "note", e.target.value)}
        />
      ),
    },
    {
      title: "",
      width: 52,
      fixed: "right" as const,
      render: (_: unknown, row: LineItem) => (
        <Tooltip title="Xoá dòng">
          <Button
            danger
            type="text"
            icon={<MinusCircleOutlined />}
            onClick={() => removeLine(row.key)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <AntdEdit saveButtonProps={saveButtonProps}>
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
          <Col span={12}>
            <Form.Item
              label="Ngày nhập"
              name="purchase_date"
              rules={[{ required: true, message: "Chọn ngày nhập" }]}
              getValueProps={(value) => ({
                value:
                  value && dayjs(value as string).isValid()
                    ? dayjs(value as string)
                    : undefined,
              })}
            >
              <DatePicker
                showTime={false}
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trọng lượng trung bình (kg/con)"
              name="average_weight"
              rules={[{ required: true }]}
            >
              <InputNumber
                suffix="kg/con"
                min={0}
                step={0.1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số lượng lồng"
              name="cages_count"
              rules={[{ required: true }]}
            >
              <InputNumber suffix="lồng" min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tổng trọng lượng lồng"
              name="cages_weight"
              rules={[{ required: true }]}
            >
              <InputNumber
                suffix="kg"
                min={0}
                step={0.1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Chi tiết hàng nhập">
          <Space
            style={{
              width: "100%",
              marginBottom: 8,
              justifyContent: "space-between",
            }}
            wrap
          >
            <Text type="secondary">
              Thêm sản phẩm, số lượng, đơn giá. Hệ thống tự tính thành tiền.
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setLines((prev) => [...prev, newRow()])}
            >
              Thêm dòng
            </Button>
          </Space>
          <Table
            rowKey="key"
            dataSource={lines}
            columns={columns}
            pagination={false}
            size="small"
            scroll={{ x: true }}
          />
          <div
            style={{
              marginTop: 8,
              padding: "12px 16px",
              background: "var(--ant-color-fill-quaternary)",
              borderRadius: 8,
              textAlign: "right",
            }}
          >
            <Text type="secondary">Tổng thành tiền (ước tính): </Text>
            <Text strong style={{ fontSize: 16 }}>
              {formatMoney(total)}
            </Text>
          </div>
        </Form.Item>
      </Form>
    </AntdEdit>
  );
};
