import { PrinterOutlined } from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Divider,
  Image,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import { supabaseClient } from '@/providers/supabase-client';
import {
  SALE_STATUS_LABELS,
  type ISale,
  type ISaleItem,
  type SaleStatus,
} from '@/types';
import {
  DATETIME_FORMAT,
  formatMoney,
  formatVietnamesePhone,
  buildSaleInvoiceQrPayment,
} from '@/utils';

interface IInvoice extends ISale {
  payment?: {
    sale_id: string;
    amount: number;
    id: string;
    qrUrl: string;
  };
}

const statusColor: Record<SaleStatus, string> = {
  PENDING: 'orange',
  PAID: 'green',
  CANCELLED: 'red',
};

interface Props {
  sale_id: string | undefined;
}

export const SaleInvoiceModal = ({ sale_id }: Props) => {
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [fetching, setFetching] = useState(false);

  async function handleOpen() {
    if (!sale_id) return;
    setFetching(true);
    try {
      const { data, error } = await supabaseClient
        .from('sales')
        .select('*,customer:customers(*),sale_items(*,product:products(*))')
        .eq('id', sale_id)
        .single();

      if (error) {
        message.error(error.message);
        return;
      }
      const sale = data as ISale;
      setInvoice({
        ...sale,
        payment: buildSaleInvoiceQrPayment(sale),
      });
      setOpen(true);
    } finally {
      setFetching(false);
    }
  }

  function handlePrint() {
    if (!invoice) return;

    const items = invoice.sale_items ?? [];
    const rows = items
      .map(
        (item: ISaleItem) => `
        <tr>
          <td>${item.product?.name ?? item.product_id}</td>
          <td>${item.quantity}</td>
          <td>${item.quantity_unit}</td>
          <td style="text-align:right">${formatMoney(item.unit_price)}</td>
          <td style="text-align:right;font-weight:bold">${formatMoney(
            item.amount,
          )}</td>
        </tr>`,
      )
      .join('');

    const summaryLines = `
      <div class="sum-row"><span>Tạm tính</span><span>${formatMoney(
        invoice.subtotal_amount,
      )}</span></div>
      <div class="sum-row"><span>Giảm giá</span><span>${formatMoney(
        invoice.discount_amount,
      )}</span></div>
      <div class="sum-row sum-total"><span>Thành tiền</span><span>${formatMoney(
        invoice.final_amount,
      )}</span></div>
      <div class="sum-row"><span>Đã thanh toán</span><span>${formatMoney(
        invoice.paid_amount,
      )}</span></div>
      <div class="sum-row sum-bold"><span>Còn lại</span><span>${formatMoney(
        invoice.remaining_amount,
      )}</span></div>
    `;

    const qrSection = invoice.payment?.qrUrl
      ? `<div class="qr-box">
          <img src="${invoice.payment.qrUrl}" alt="QR" />
          <div class="qr-label">Quét mã để thanh toán<br/><strong>${formatMoney(
            invoice.payment.amount,
          )}</strong></div>
        </div>`
      : '';

    const customer = invoice.customer
      ? `${invoice.customer.name ?? formatVietnamesePhone(invoice.customer.phone)} — ${formatVietnamesePhone(invoice.customer.phone)}`
      : '';
    const sale_date = invoice.sale_date
      ? dayjs(invoice.sale_date).format(DATETIME_FORMAT)
      : '';
    const statusLabel = invoice.status
      ? SALE_STATUS_LABELS[invoice.status as SaleStatus]
      : '';

    const html = `
      <html><head><title>Hoá đơn</title>
      <style>
        @page { size: A5 portrait; margin: 8mm; }
        * { box-sizing: border-box; }
        body { font-family: sans-serif; padding: 0; color: #000; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin: 6px 0; }
        th, td { border: 1px solid #000; padding: 4px 7px; text-align: left; font-size: 11px; }
        th { background: #eee; font-weight: bold; }
        .meta { font-size: 10px; color: #333; margin-bottom: 6px; }
        .layout { display: flex; gap: 16px; align-items: flex-start; margin-top: 8px; }
        .qr-box { text-align: center; flex-shrink: 0; }
        .qr-box img { width: 160px; display: block; margin: 0 auto 4px; }
        .qr-label { font-size: 10px; color: #333; line-height: 1.4; }
        .summary-wrap { flex: 1; }
        .sum-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #ddd; font-size: 11px; }
        .sum-row:last-child { border-bottom: none; }
        .sum-total { font-weight: bold; font-size: 13px; border-top: 1px solid #000; padding-top: 4px; }
        .sum-bold { font-weight: bold; }
      </style>
      <script>window.onload = function() { window.print(); window.addEventListener('afterprint', function() { window.close(); }); }</script>
      </head><body>
        <div class="meta">Mã: ${invoice.id}</div>
        <table>
          <tr><th>Ngày bán</th><td>${sale_date}</td><th>Trạng thái</th><td>${statusLabel}</td></tr>
          <tr><th>Khách hàng</th><td colspan="3">${customer}</td></tr>
        </table>
        <table>
          <thead><tr><th>Sản phẩm</th><th>SL</th><th>ĐV</th><th style="text-align:right">Đơn giá</th><th style="text-align:right">Thành tiền</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="layout">
          ${qrSection}
          <div class="summary-wrap">${summaryLines}</div>
        </div>
      </body></html>
    `;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'width=560,height=800');
    if (!win) {
      URL.revokeObjectURL(url);
      return;
    }
    win.addEventListener('unload', () => URL.revokeObjectURL(url));
  }

  return (
    <>
      <Button
        icon={<PrinterOutlined />}
        loading={fetching}
        onClick={handleOpen}
        disabled={!sale_id}
      >
        Xuất hoá đơn
      </Button>

      <Modal
        title="Hoá đơn bán hàng"
        open={open}
        onCancel={() => {
          setOpen(false);
          setInvoice(null);
        }}
        width={640}
        footer={
          <Space>
            <Button onClick={() => setOpen(false)}>Đóng</Button>
            <Button
              icon={<PrinterOutlined />}
              type="primary"
              onClick={handlePrint}
            >
              In hoá đơn
            </Button>
          </Space>
        }
      >
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Mã: {invoice?.id}
        </Typography.Text>
        <Divider style={{ margin: '12px 0' }} />
        <Descriptions size="small" bordered>
          <Descriptions.Item label="Ngày bán">
            {invoice?.sale_date &&
              dayjs(invoice.sale_date).format(DATETIME_FORMAT)}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {invoice?.status && (
              <Tag color={statusColor[invoice.status as SaleStatus]}>
                {SALE_STATUS_LABELS[invoice.status as SaleStatus]}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng" span={2}>
            {invoice?.customer &&
              `${invoice.customer.name ?? formatVietnamesePhone(invoice.customer.phone)} — ${formatVietnamesePhone(invoice.customer.phone)}`}
          </Descriptions.Item>
        </Descriptions>

        <Table
          style={{ marginTop: 12 }}
          rowKey="id"
          dataSource={invoice?.sale_items ?? []}
          pagination={false}
          size="small"
          columns={[
            {
              title: 'Sản phẩm',
              render: (_, row: ISaleItem) =>
                row.product?.name ?? row.product_id,
            },
            { dataIndex: 'quantity', title: 'SL' },
            { dataIndex: 'quantity_unit', title: 'ĐV' },
            {
              dataIndex: 'unit_price',
              title: 'Đơn giá',
              render: (n: number) => formatMoney(n),
            },
            {
              dataIndex: 'amount',
              title: 'Thành tiền',
              render: (n: number) => (
                <Typography.Text strong>{formatMoney(n)}</Typography.Text>
              ),
            },
          ]}
        />

        <Descriptions
          size="small"
          column={1}
          style={{ marginTop: 12 }}
          styles={{ label: { width: 160 } }}
        >
          <Descriptions.Item label="Tạm tính">
            {formatMoney(invoice?.subtotal_amount)}
          </Descriptions.Item>
          <Descriptions.Item label="Giảm giá">
            {formatMoney(invoice?.discount_amount)}
          </Descriptions.Item>
          <Descriptions.Item label="Thành tiền">
            <Typography.Text strong style={{ fontSize: 16 }}>
              {formatMoney(invoice?.final_amount)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Đã thanh toán">
            {formatMoney(invoice?.paid_amount)}
          </Descriptions.Item>
          <Descriptions.Item label="Còn lại">
            <Typography.Text
              strong
              type={invoice?.remaining_amount ? 'danger' : 'success'}
            >
              {formatMoney(invoice?.remaining_amount)}
            </Typography.Text>
          </Descriptions.Item>
        </Descriptions>

        {invoice?.payment?.qrUrl && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ textAlign: 'center' }}>
              <Typography.Text
                type="secondary"
                style={{ display: 'block', marginBottom: 8 }}
              >
                Quét mã để thanh toán {formatMoney(invoice.payment.amount)}
              </Typography.Text>
              <Image
                src={invoice.payment.qrUrl}
                alt="QR thanh toán"
                width={200}
                preview={false}
              />
            </div>
          </>
        )}
      </Modal>
    </>
  );
};
