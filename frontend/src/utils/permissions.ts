import { UserRole } from '../types';

// Define permission types
export type Permission = 
  | 'create:jovem'
  | 'read:jovem'
  | 'update:jovem'
  | 'delete:jovem'
  | 'create:oportunidade'
  | 'read:oportunidade'
  | 'update:oportunidade'
  | 'delete:oportunidade'
  | 'recommend:jovem';

// Map roles to permissions
const rolePermissions: Record<UserRole, Permission[]> = {
  'instituicao_ensino': [
    'create:jovem',
    'read:jovem',
    'update:jovem',
    'delete:jovem',
    'read:oportunidade',
    'recommend:jovem'
  ],
  'chefe_empresa': [
    'read:jovem',
    'read:oportunidade',
    'create:oportunidade',
    'update:oportunidade',
    'delete:oportunidade',
    'recommend:jovem'
  ],
  'instituicao_contratante': [
    'read:jovem',
    'read:oportunidade',
    'create:oportunidade',
    'update:oportunidade',
    'delete:oportunidade'
  ]
};

// Check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) || false;
};

// Get all permissions for a role
export const getRolePermissions = (role: UserRole): Permission[] => {
  return rolePermissions[role] || [];
};

// Check if a role has any of the given permissions
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

// Check if a role has all of the given permissions
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
}; 