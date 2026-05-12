import { Navigate, useParams } from 'react-router';

export type ShowRedirectDrawerProps = {
  /** Đường dẫn trang danh sách (vd. `/products`). Route `…/show/:id` chuyển tới `?show=` để mở drawer xem. */
  listPath: string;
};

/**
 * Dùng trong route `show/:id` khi chi tiết được mở bằng drawer trên trang list.
 */
export function ShowRedirectDrawer({ listPath }: ShowRedirectDrawerProps) {
  const { id } = useParams();
  if (!id) return <Navigate to={listPath} replace />;

  const qs = new URLSearchParams({ show: id });
  return <Navigate to={`${listPath}?${qs.toString()}`} replace />;
}
