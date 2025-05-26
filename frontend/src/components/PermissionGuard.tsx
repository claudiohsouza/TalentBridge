import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback as React.ReactElement;
  }

  // Single permission check
  if (permission && !hasPermission(user.papel, permission)) {
    return fallback as React.ReactElement;
  }

  // Multiple permissions check
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(user.papel, permissions)
      : hasAnyPermission(user.papel, permissions);

    if (!hasAccess) {
      return fallback as React.ReactElement;
    }
  }

  return <>{children}</>;
};

export default PermissionGuard; 