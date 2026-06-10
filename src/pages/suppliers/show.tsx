import { QrcodeOutlined } from '@ant-design/icons';
import {
  CreateButton,
  DeleteButton,
  EditButton,
  ListButton,
  useTable,
} from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Button, Descriptions, Image, Modal, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  LocationShowValue,
  MobileShowDetails,
  MobileShowList,
  MobileShowPage,
  MobileShowSection,
} from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { bankOptions, type IPurchase, type ISupplier } from '@/types';
import { buildVietQrImage, DATE_FORMAT, joinDetail, showMoney } from '@/utils';

export const Show = () => {
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);
  const { result: record, query } = useShow<ISupplier>({
    resource: 'suppliers',
  });
  const { isLoading } = query;

  const supplier_id = record?.id;

  const { tableProps } = useTable<IPurchase>({
    resource: 'purchases',
    syncWithLocation: false,
    filters: {
      permanent: supplier_id
        ? [{ field: 'supplier_id', operator: 'eq', value: supplier_id }]
        : [],
    },
    sorters: { initial: [{ field: 'purchase_date', order: 'desc' }] },
    queryOptions: { enabled: !!supplier_id },
  });

  const purchases = tableProps.dataSource ?? [];
  const bank = bankOptions.find(b => b.code === record?.bank_name);
  const qrUrl =
    record?.bank_name && record?.bank_account
      ? buildVietQrImage(record.bank_name, record.bank_account, {
          accountName: record.name,
        })
      : null;

  return (
    <MobileShowPage
      loading={isLoading}
      title={record?.name}
      actions={
        <>
          <ListButton />
          <EditButton />
          <DeleteButton />
          {supplier_id ? <CreateButton /> : null}
          {qrUrl ? (
            <Button icon={<QrcodeOutlined />} onClick={() => setQrOpen(true)}>
              Chuyển khoản
            </Button>
          ) : null}
        </>
      }
    >
      <MobileShowDetails
        items={[
          { label: 'Tên nhà cung cấp', value: record?.name },
          { label: 'Điện thoại', value: record?.phone },
          {
            label: 'Tên ngân hàng',
            value: bankOptions.find(bank => bank.code === record?.bank_name)
              ?.shortName,
          },
          { label: 'Số tài khoản', value: record?.bank_account },
          { label: 'Địa chỉ', value: record?.address },
          {
            label: 'Vị trí',
            value: (
              <LocationShowValue
                latitude={record?.latitude}
                longitude={record?.longitude}
              />
            ),
          },
          {
            label: 'Ngày tạo',
            value: record?.created_at && (
              <RelativeTime value={record.created_at} emptyText="" />
            ),
          },
          {
            label: 'Cập nhật',
            value: record?.updated_at && (
              <RelativeTime value={record.updated_at} emptyText="" />
            ),
          },
        ]}
      />

      <MobileShowSection title="Phiếu nhập hàng">
        <MobileShowList
          dataSource={purchases}
          loading={!!tableProps.loading}
          getKey={row => row.id}
          onItemClick={row => navigate(`/purchases/show/${row.id}`)}
          renderTitle={row =>
            row.purchase_date && dayjs(row.purchase_date).format(DATE_FORMAT)
          }
          renderDescription={row =>
            joinDetail(
              row.cages_count != null && `${row.cages_count} lồng`,
              row.cages_weight != null && `${row.cages_weight} kg`,
              showMoney(row.total_amount),
              row.average_weight != null && `${row.average_weight} kg/con`,
            )
          }
        />
      </MobileShowSection>

      <Modal
        title="Chuyển khoản"
        open={qrOpen}
        onCancel={() => setQrOpen(false)}
        footer={null}
        centered
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Ngân hàng">
            {bank?.shortName}
          </Descriptions.Item>
          <Descriptions.Item label="Số tài khoản">
            <Typography.Text copyable={{ text: record?.bank_account ?? '' }}>
              {record?.bank_account}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Chủ tài khoản">
            {record?.name}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text
            type="secondary"
            style={{ display: 'block', marginBottom: 8 }}
          >
            Quét mã để chuyển khoản
          </Typography.Text>
          <Image
            src={qrUrl ?? undefined}
            alt="QR chuyển khoản"
            width={200}
            preview={false}
          />
        </div>
      </Modal>
    </MobileShowPage>
  );
};
