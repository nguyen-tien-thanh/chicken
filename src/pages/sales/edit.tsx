import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Edit as AntdEdit, useForm } from "@refinedev/antd";
import {
  useCreate,
  useDelete,
  useInvalidate,
  useSelect,
  useUpdate,
  useWarnAboutChange,
} from "@refinedev/core";
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
import type { ICustomer, IProduct, ISale, ISaleItem } from "@/types";
import { SALE_STATUS_OPTIONS, type SaleStatus } from "@/types";
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
function fromExisting(item: ISaleItem): LineItem {
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
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: updateSale } = useUpdate();
  const { mutateAsync: createItem } = useCreate();
  const { mutateAsync: updateItem } = useUpdate();
  const { mutateAsync: deleteItem } = useDelete();
  const invalidate = useInvalidate();
  const { setWarnWhen } = useWarnAboutChange();

  const { formProps, saveButtonProps, query } = useForm<ISale>({
    resource: "sales",
    meta: {
      select: "*,customer:customers(*),sale_items(*,product:products(*))",
    },
  });

  // Sync line items khi data load xong
  useEffect(() => {
    const data = query?.data?.data;
    if (data?.sale_items && lines.length === 0) {
      setLines(data.sale_items.map(fromExisting));
    }
  }, [query?.data?.data]);

  const {
    options: customerOptions,
    onSearch: onSearchCustomer,
    query: customersQuery,
  } = useSelect({
    resource: "customers",
    optionLabel: (item: ICustomer) =>
      `${item.name ?? item.phone} (${item.phone})`,
    optionValue: (item: ICustomer) => item.id,
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

  const subtotal = lines.reduce((sum, row) => {
    if (!row.product_id) return sum;
    return sum + row.quantity * row.unit_price;
  }, 0);

  const onFinish: FormProps["onFinish"] = (values) => {
    const sale = query?.data?.data;
    const saleId = sale?.id;
    if (!saleId) {
      notification.error({ message: "Chưa có dữ liệu phiếu bán" });
      return Promise.resolve();
    }
    const validLines = lines.filter((row) => row.product_id);
    if (validLines.length === 0) {
      notification.warning({
        message: "Thêm ít nhất một dòng có chọn sản phẩm",
      });
      return Promise.resolve();
    }
    const v = values as Record<string, unknown>;
    const sd = v.sale_date;
    const sale_date =
      sd != null && dayjs.isDayjs(sd)
        ? (sd as dayjs.Dayjs).toISOString()
        : typeof sd === "string"
        ? sd
        : dayjs(sd as string).toISOString();

    const discount_amount = Number(v.discount_amount ?? 0);
    const paid_amount = Number(v.paid_amount ?? 0);
    const subtotal_amount = validLines.reduce(
      (s, row) => s + row.quantity * row.unit_price,
      0
    );
    const final_amount = Math.max(0, subtotal_amount - discount_amount);
    const remaining_amount = Math.max(0, final_amount - paid_amount);

    const salePayload = {
      customer_id: v.customer_id as string,
      sale_date,
      note: (v.note as string | null | undefined) ?? null,
      discount_amount,
      paid_amount,
      status: (v.status as SaleStatus) ?? "PENDING",
      subtotal_amount,
      final_amount,
      remaining_amount,
    };

    return (async () => {
      setIsSaving(true);
      try {
        await updateSale({
          resource: "sales",
          id: saleId,
          values: salePayload,
        });

        const existingIds = new Set((sale.sale_items ?? []).map((i) => i.id));
        const nextIds = new Set(
          validLines.map((r) => r.id).filter(Boolean) as string[]
        );
        for (const id of existingIds) {
          if (!nextIds.has(id)) {
            await deleteItem({ resource: "sale_items", id });
          }
        }

        for (const row of validLines) {
          const amount = row.quantity * row.unit_price;
          const itemValues = {
            product_id: row.product_id!,
            quantity: row.quantity,
            quantity_unit: row.quantity_unit,
            unit_price: row.unit_price,
            amount,
            note: row.note ?? null,
            cost_amount: 0,
            profit_amount: amount,
          };
          if (row.id) {
            await updateItem({
              resource: "sale_items",
              id: row.id,
              values: itemValues,
            });
          } else {
            await createItem({
              resource: "sale_items",
              values: { ...itemValues, sale_id: saleId },
            });
          }
        }

        await invalidate({ resource: "sales", invalidates: ["list"] });
        await invalidate({ resource: "sale_items", invalidates: ["list"] });
        const refetched = await query?.refetch();
        const fresh = refetched?.data?.data as ISale | undefined;
        if (fresh) {
          nextKey = 1;
          setLines((fresh.sale_items ?? []).map(fromExisting));
        }
        setWarnWhen(false);
        notification.success({ message: "Đã cập nhật phiếu bán" });
      } catch (e: unknown) {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message: unknown }).message)
            : "Không cập nhật được phiếu bán";
        notification.error({ message: msg });
      } finally {
        setIsSaving(false);
      }
    })();
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
    <AntdEdit
      saveButtonProps={{
        ...saveButtonProps,
        loading: isSaving,
        disabled: isSaving,
      }}
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
          <Col span={12}>
            <Form.Item
              label="Ngày bán"
              name="sale_date"
              rules={[{ required: true, message: "Chọn ngày bán" }]}
              getValueProps={(value) => ({
                value:
                  value && dayjs(value as string).isValid()
                    ? dayjs(value as string)
                    : undefined,
              })}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
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
          <Col span={12}>
            <Form.Item label="Giảm giá" name="discount_amount">
              <InputMoney style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Đã thanh toán" name="paid_amount">
              <InputMoney style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Chi tiết hàng bán">
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
              onClick={() =>
                setLines((prev) => {
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
                })
              }
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
              {formatMoney(subtotal)}
            </Text>
          </div>
        </Form.Item>
      </Form>
    </AntdEdit>
  );
};
