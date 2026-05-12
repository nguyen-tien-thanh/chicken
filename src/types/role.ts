import type { BaseRecord } from "@refinedev/core";

import type { IRolesPermission } from "./roles-permission";
import type { IUser } from "./user";

export interface IRole extends BaseRecord {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  /** Gửi kèm body create/update role để đồng bộ quyền (API tự xử lý bảng nối). */
  permissionIds?: string[];
  users?: IUser[];
  rolesPermissions?: IRolesPermission[];
}
