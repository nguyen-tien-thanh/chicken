import type { BaseRecord } from "@refinedev/core";

import type { IRole } from "./role";

export interface IUser extends BaseRecord {
  id: string;
  email: string;
  name: string;
  roleId: string;
  /** Chỉ có khi tạo/cập nhật; API list/show thường không trả về. */
  password?: string;
  created_at: string;
  updated_at: string;
  role?: Pick<IRole, "id" | "name" | "description">;
}
