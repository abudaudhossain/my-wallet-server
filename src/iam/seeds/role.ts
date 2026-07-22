import { PERMISSIONS, type PermissionKey } from './permission';

export const ROLES = {
  ADMINISTRATOR: 'administrator',
  USER: 'user',
} as const;

export type RoleKey = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LIST: Array<{
  key: RoleKey;
  label: string;
  description: string;
  isSystem: boolean;
  permissions: PermissionKey[];
}> = [
  {
    key: ROLES.ADMINISTRATOR,
    label: 'Administrator',
    description: 'Full system access',
    isSystem: true,
    permissions: Object.values(PERMISSIONS),
  },
  {
    key: ROLES.USER,
    label: 'User',
    description: 'Standard user with limited access',
    isSystem: true,
    permissions: [PERMISSIONS.USER_VIEW],
  },
];
