import { useIsMobile } from '@/hooks';
import { useInvalidate, useResourceParams } from '@refinedev/core';
import { PullToRefresh } from 'antd-mobile';
import React from 'react';

export const MobilePullToRefresh: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isMobile = useIsMobile();
  const invalidate = useInvalidate();
  const { resource, identifier } = useResourceParams();

  if (!isMobile) {
    return <>{children}</>;
  }

  const handleRefresh = async () => {
    const resourceName = resource?.name ?? identifier;
    if (!resourceName) return;

    await invalidate({
      resource: resourceName,
      invalidates: ['list', 'many', 'detail'],
    });
  };

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingText="Kéo xuống để làm mới"
      canReleaseText="Thả để làm mới"
      refreshingText="Đang tải..."
      completeText="Đã làm mới"
    >
      {children}
    </PullToRefresh>
  );
};
