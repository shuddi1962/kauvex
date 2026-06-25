import { insforge } from '@/lib/insforge'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export interface Role {
  id: string
  name: string
  slug: string
  description: string | null
  scope: string
  is_system: boolean
  created_at: string
}

export interface Permission {
  id: string
  resource: string
  action: string
  description: string | null
  created_at: string
}

export interface UserRole {
  user_id: string
  role_id: string
  assigned_by: string | null
  assigned_at: string
}

export interface UserPermission {
  resource: string
  action: string
}

export interface DatabaseClient {
  from: (table: string) => ReturnType<typeof insforge.database.from>
}

export const RESOURCES = {
  products: 'products',
  orders: 'orders',
  vendors: 'vendors',
  storefronts: 'storefronts',
  warehouses: 'warehouses',
  ads: 'ads',
  analytics: 'analytics',
  settings: 'settings',
  users: 'users',
  commissions: 'commissions',
  disputes: 'disputes',
  fulfillment: 'fulfillment',
  marketing: 'marketing',
  reports: 'reports',
  shipping: 'shipping',
  logistics_partners: 'logistics_partners',
  logistics_jobs: 'logistics_jobs',
  express_shipments: 'express_shipments',
  rate_cards: 'rate_cards',
  packaging: 'packaging',
  hs_codes: 'hs_codes',
  insurance_reserve: 'insurance_reserve',
  own_shipping_profiles: 'own_shipping_profiles',
  own_fbk: 'own_fbk',
  own_products: 'own_products',
  own_orders: 'own_orders',
  own_inventory: 'own_inventory',
  own_analytics: 'own_analytics',
  own_store: 'own_store',
  own_ads: 'own_ads',
  own_staff: 'own_staff',
  own_settings: 'own_settings',
  own_payouts: 'own_payouts',
  own_disputes: 'own_disputes',
  own_profile: 'own_profile',
  own_addresses: 'own_addresses',
  own_wishlist: 'own_wishlist',
  own_reviews: 'own_reviews',
} as const

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES]

export const ACTIONS = {
  view: 'view',
  create: 'create',
  edit: 'edit',
  delete: 'delete',
  export: 'export',
  approve: 'approve',
  manage: 'manage',
} as const

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS]

export interface PermissionEntry {
  resource: string
  action: string
}

export interface RoleDefinition {
  name: string
  slug: string
  description: string
  scope: string
  permissions: PermissionEntry[]
}

export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'Full system access with all permissions',
    scope: 'admin',
    permissions: [],
  },
  ADMIN: {
    name: 'Admin',
    slug: 'admin',
    description: 'Administrative access to manage the marketplace',
    scope: 'admin',
    permissions: [
      { resource: 'products', action: 'view' },
      { resource: 'products', action: 'create' },
      { resource: 'products', action: 'edit' },
      { resource: 'products', action: 'delete' },
      { resource: 'products', action: 'export' },
      { resource: 'orders', action: 'view' },
      { resource: 'orders', action: 'create' },
      { resource: 'orders', action: 'edit' },
      { resource: 'orders', action: 'delete' },
      { resource: 'orders', action: 'export' },
      { resource: 'vendors', action: 'view' },
      { resource: 'vendors', action: 'create' },
      { resource: 'vendors', action: 'edit' },
      { resource: 'vendors', action: 'delete' },
      { resource: 'vendors', action: 'approve' },
      { resource: 'vendors', action: 'manage' },
      { resource: 'storefronts', action: 'view' },
      { resource: 'storefronts', action: 'create' },
      { resource: 'storefronts', action: 'edit' },
      { resource: 'storefronts', action: 'delete' },
      { resource: 'storefronts', action: 'manage' },
      { resource: 'warehouses', action: 'view' },
      { resource: 'warehouses', action: 'create' },
      { resource: 'warehouses', action: 'edit' },
      { resource: 'warehouses', action: 'delete' },
      { resource: 'warehouses', action: 'manage' },
      { resource: 'ads', action: 'view' },
      { resource: 'ads', action: 'create' },
      { resource: 'ads', action: 'edit' },
      { resource: 'ads', action: 'delete' },
      { resource: 'ads', action: 'approve' },
      { resource: 'ads', action: 'manage' },
      { resource: 'analytics', action: 'view' },
      { resource: 'analytics', action: 'export' },
      { resource: 'settings', action: 'view' },
      { resource: 'settings', action: 'edit' },
      { resource: 'settings', action: 'manage' },
      { resource: 'users', action: 'view' },
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'edit' },
      { resource: 'users', action: 'delete' },
      { resource: 'users', action: 'manage' },
      { resource: 'commissions', action: 'view' },
      { resource: 'commissions', action: 'edit' },
      { resource: 'commissions', action: 'manage' },
      { resource: 'disputes', action: 'view' },
      { resource: 'disputes', action: 'edit' },
      { resource: 'disputes', action: 'manage' },
      { resource: 'disputes', action: 'approve' },
      { resource: 'fulfillment', action: 'view' },
      { resource: 'fulfillment', action: 'create' },
      { resource: 'fulfillment', action: 'edit' },
      { resource: 'fulfillment', action: 'manage' },
      { resource: 'shipping', action: 'view' },
      { resource: 'shipping', action: 'create' },
      { resource: 'shipping', action: 'edit' },
      { resource: 'shipping', action: 'manage' },
      { resource: 'logistics_partners', action: 'view' },
      { resource: 'logistics_partners', action: 'create' },
      { resource: 'logistics_partners', action: 'edit' },
      { resource: 'logistics_partners', action: 'manage' },
      { resource: 'logistics_partners', action: 'approve' },
      { resource: 'logistics_jobs', action: 'view' },
      { resource: 'logistics_jobs', action: 'edit' },
      { resource: 'logistics_jobs', action: 'manage' },
      { resource: 'express_shipments', action: 'view' },
      { resource: 'express_shipments', action: 'edit' },
      { resource: 'express_shipments', action: 'manage' },
      { resource: 'rate_cards', action: 'view' },
      { resource: 'rate_cards', action: 'create' },
      { resource: 'rate_cards', action: 'edit' },
      { resource: 'rate_cards', action: 'manage' },
      { resource: 'packaging', action: 'view' },
      { resource: 'packaging', action: 'create' },
      { resource: 'packaging', action: 'edit' },
      { resource: 'packaging', action: 'manage' },
      { resource: 'hs_codes', action: 'view' },
      { resource: 'hs_codes', action: 'create' },
      { resource: 'hs_codes', action: 'edit' },
      { resource: 'hs_codes', action: 'manage' },
      { resource: 'insurance_reserve', action: 'view' },
      { resource: 'insurance_reserve', action: 'edit' },
      { resource: 'insurance_reserve', action: 'manage' },
      { resource: 'marketing', action: 'view' },
      { resource: 'marketing', action: 'create' },
      { resource: 'marketing', action: 'edit' },
      { resource: 'marketing', action: 'delete' },
      { resource: 'marketing', action: 'manage' },
      { resource: 'reports', action: 'view' },
      { resource: 'reports', action: 'export' },
    ],
  },
  FINANCE_ADMIN: {
    name: 'Finance Admin',
    slug: 'finance-admin',
    description: 'Financial operations and reporting',
    scope: 'admin',
    permissions: [
      { resource: 'orders', action: 'view' },
      { resource: 'orders', action: 'export' },
      { resource: 'commissions', action: 'view' },
      { resource: 'commissions', action: 'edit' },
      { resource: 'commissions', action: 'manage' },
      { resource: 'commissions', action: 'export' },
      { resource: 'reports', action: 'view' },
      { resource: 'reports', action: 'export' },
      { resource: 'analytics', action: 'view' },
      { resource: 'analytics', action: 'export' },
      { resource: 'vendors', action: 'view' },
    ],
  },
  SUPPORT_ADMIN: {
    name: 'Support Admin',
    slug: 'support-admin',
    description: 'Customer support and dispute resolution',
    scope: 'admin',
    permissions: [
      { resource: 'orders', action: 'view' },
      { resource: 'orders', action: 'edit' },
      { resource: 'disputes', action: 'view' },
      { resource: 'disputes', action: 'edit' },
      { resource: 'disputes', action: 'manage' },
      { resource: 'users', action: 'view' },
      { resource: 'users', action: 'edit' },
      { resource: 'products', action: 'view' },
      { resource: 'vendors', action: 'view' },
    ],
  },
  VENDOR_OWNER: {
    name: 'Vendor Owner',
    slug: 'vendor-owner',
    description: 'Full vendor account owner access',
    scope: 'vendor',
    permissions: [
      { resource: 'own_shipping_profiles', action: 'view' },
      { resource: 'own_shipping_profiles', action: 'create' },
      { resource: 'own_shipping_profiles', action: 'edit' },
      { resource: 'own_shipping_profiles', action: 'delete' },
      { resource: 'own_fbk', action: 'view' },
      { resource: 'own_fbk', action: 'manage' },
      { resource: 'own_products', action: 'view' },
      { resource: 'own_products', action: 'create' },
      { resource: 'own_products', action: 'edit' },
      { resource: 'own_products', action: 'delete' },
      { resource: 'own_products', action: 'export' },
      { resource: 'own_orders', action: 'view' },
      { resource: 'own_orders', action: 'edit' },
      { resource: 'own_orders', action: 'export' },
      { resource: 'own_inventory', action: 'view' },
      { resource: 'own_inventory', action: 'create' },
      { resource: 'own_inventory', action: 'edit' },
      { resource: 'own_analytics', action: 'view' },
      { resource: 'own_analytics', action: 'export' },
      { resource: 'own_store', action: 'view' },
      { resource: 'own_store', action: 'create' },
      { resource: 'own_store', action: 'edit' },
      { resource: 'own_store', action: 'manage' },
      { resource: 'own_ads', action: 'view' },
      { resource: 'own_ads', action: 'create' },
      { resource: 'own_ads', action: 'edit' },
      { resource: 'own_ads', action: 'delete' },
      { resource: 'own_staff', action: 'view' },
      { resource: 'own_staff', action: 'create' },
      { resource: 'own_staff', action: 'edit' },
      { resource: 'own_staff', action: 'delete' },
      { resource: 'own_settings', action: 'view' },
      { resource: 'own_settings', action: 'edit' },
      { resource: 'own_payouts', action: 'view' },
      { resource: 'own_payouts', action: 'export' },
      { resource: 'own_disputes', action: 'view' },
      { resource: 'own_disputes', action: 'create' },
      { resource: 'own_disputes', action: 'edit' },
    ],
  },
  VENDOR_MANAGER: {
    name: 'Vendor Manager',
    slug: 'vendor-manager',
    description: 'Vendor staff with management access',
    scope: 'vendor',
    permissions: [
      { resource: 'own_products', action: 'view' },
      { resource: 'own_products', action: 'create' },
      { resource: 'own_products', action: 'edit' },
      { resource: 'own_orders', action: 'view' },
      { resource: 'own_orders', action: 'edit' },
      { resource: 'own_inventory', action: 'view' },
      { resource: 'own_inventory', action: 'edit' },
      { resource: 'own_analytics', action: 'view' },
      { resource: 'own_store', action: 'view' },
      { resource: 'own_store', action: 'edit' },
    ],
  },
  VENDOR_SUPPORT: {
    name: 'Vendor Support',
    slug: 'vendor-support',
    description: 'Vendor support staff',
    scope: 'vendor',
    permissions: [
      { resource: 'own_orders', action: 'view' },
      { resource: 'own_orders', action: 'edit' },
      { resource: 'own_disputes', action: 'view' },
      { resource: 'own_disputes', action: 'create' },
    ],
  },
  VENDOR_WAREHOUSE: {
    name: 'Vendor Warehouse',
    slug: 'vendor-warehouse',
    description: 'Vendor warehouse and inventory staff',
    scope: 'vendor',
    permissions: [
      { resource: 'own_inventory', action: 'view' },
      { resource: 'own_inventory', action: 'create' },
      { resource: 'own_inventory', action: 'edit' },
      { resource: 'own_orders', action: 'view' },
    ],
  },
  WAREHOUSE_STAFF: {
    name: 'Warehouse Staff',
    slug: 'warehouse-staff',
    description: 'Warehouse staff (manager, picker, packer, receiver)',
    scope: 'warehouse',
    permissions: [
      { resource: 'warehouse_dashboard', action: 'view' },
      { resource: 'warehouse_inbound', action: 'view' },
      { resource: 'warehouse_inbound', action: 'create' },
      { resource: 'warehouse_outbound', action: 'view' },
      { resource: 'warehouse_outbound', action: 'create' },
      { resource: 'warehouse_inventory', action: 'view' },
      { resource: 'warehouse_inventory', action: 'edit' },
      { resource: 'warehouse_packaging', action: 'view' },
      { resource: 'warehouse_packaging', action: 'edit' },
      { resource: 'warehouse_reports', action: 'view' },
    ],
  },
  CUSTOMER: {
    name: 'Customer',
    slug: 'customer',
    description: 'Standard marketplace customer',
    scope: 'customer',
    permissions: [
      { resource: 'own_orders', action: 'view' },
      { resource: 'own_profile', action: 'view' },
      { resource: 'own_profile', action: 'edit' },
      { resource: 'own_addresses', action: 'view' },
      { resource: 'own_addresses', action: 'create' },
      { resource: 'own_addresses', action: 'edit' },
      { resource: 'own_addresses', action: 'delete' },
      { resource: 'own_wishlist', action: 'view' },
      { resource: 'own_wishlist', action: 'create' },
      { resource: 'own_wishlist', action: 'delete' },
      { resource: 'own_reviews', action: 'view' },
      { resource: 'own_reviews', action: 'create' },
      { resource: 'own_reviews', action: 'edit' },
      { resource: 'own_reviews', action: 'delete' },
      { resource: 'own_disputes', action: 'view' },
      { resource: 'own_disputes', action: 'create' },
    ],
  },
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  const { data: userRoles, error: userRolesError } = await insforge.database
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)

  if (userRolesError || !userRoles || userRoles.length === 0) {
    return []
  }

  const roleIds = userRoles.map((ur: any) => ur.role_id)

  const { data: roles, error: rolesError } = await insforge.database
    .from('roles')
    .select('*')
    .in('id', roleIds)

  if (rolesError || !roles) return []

  return roles as Role[]
}

export async function hasPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    const { data: userRoles, error: userRolesError } = await insforge.database
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)

    if (userRolesError || !userRoles || userRoles.length === 0) {
      return false
    }

    const roleIds = userRoles.map((ur: any) => ur.role_id)

    const { data: roles, error: rolesError } = await insforge.database
      .from('roles')
      .select('slug')
      .in('id', roleIds)

    if (rolesError || !roles) return false

    const slugs = roles.map((r: any) => r.slug)

    if (slugs.includes('super-admin')) return true

    const { data: rolePerms, error: rpError } = await insforge.database
      .from('role_permissions')
      .select('permission_id')
      .in('role_id', roleIds)

    if (rpError || !rolePerms || rolePerms.length === 0) return false

    const permIds = rolePerms.map((rp: any) => rp.permission_id)

    const { data: permissions, error: permError } = await insforge.database
      .from('permissions')
      .select('id')
      .in('id', permIds)
      .eq('resource', resource)
      .eq('action', action)

    if (permError) return false

    return permissions !== null && permissions.length > 0
  } catch {
    return false
  }
}

export async function hasAnyPermission(
  userId: string,
  resource: string,
  actions: string[]
): Promise<boolean> {
  for (const action of actions) {
    if (await hasPermission(userId, resource, action)) return true
  }
  return false
}

export async function getUserPermissions(userId: string): Promise<UserPermission[]> {
  try {
    const { data: userRoles, error: userRolesError } = await insforge.database
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)

    if (userRolesError || !userRoles || userRoles.length === 0) {
      return []
    }

    const roleIds = userRoles.map((ur: any) => ur.role_id)

    const { data: roles, error: rolesError } = await insforge.database
      .from('roles')
      .select('slug')
      .in('id', roleIds)

    if (rolesError || !roles) return []

    const slugs = roles.map((r: any) => r.slug)

    if (slugs.includes('super-admin')) {
      const allResources = Object.values(RESOURCES)
      const allActions = Object.values(ACTIONS)
      return allResources.flatMap((resource) =>
        allActions.map((action) => ({ resource, action }))
      )
    }

    const { data: rolePerms, error: rpError } = await insforge.database
      .from('role_permissions')
      .select('permission_id')
      .in('role_id', roleIds)

    if (rpError || !rolePerms || rolePerms.length === 0) return []

    const permIds = rolePerms.map((rp: any) => rp.permission_id)

    const { data: permissions, error: permError } = await insforge.database
      .from('permissions')
      .select('resource, action')
      .in('id', permIds)

    if (permError || !permissions) return []

    return permissions.map((p: any) => ({
      resource: p.resource,
      action: p.action,
    }))
  } catch {
    return []
  }
}

export function requirePermission(resource: string, action: string) {
  return async (_req: NextRequest): Promise<NextResponse | null> => {
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.getUser()

      if (authError || !data?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const hasAccess = await hasPermission(data.user.id, resource, action)

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Forbidden: insufficient permissions' },
          { status: 403 }
        )
      }

      return null
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

function getAllUniquePermissions(): PermissionEntry[] {
  const seen = new Set<string>()
  const result: PermissionEntry[] = []

  for (const def of Object.values(ROLE_DEFINITIONS)) {
    for (const perm of def.permissions) {
      const key = `${perm.resource}:${perm.action}`
      if (!seen.has(key)) {
        seen.add(key)
        result.push(perm)
      }
    }
  }

  return result
}

export async function seedRolesAndPermissions(
  db: DatabaseClient = insforge.database
): Promise<{ success: boolean; error?: string }> {
  const permissionMap = new Map<string, string>()

  try {
    const permissions = getAllUniquePermissions()

    for (const perm of permissions) {
      const key = `${perm.resource}:${perm.action}`
      const { data: existing } = await db
        .from('permissions')
        .select('id')
        .eq('resource', perm.resource)
        .eq('action', perm.action)
        .maybeSingle()

      if (existing) {
        permissionMap.set(key, existing.id)
      } else {
        const { data, error } = await db
          .from('permissions')
          .insert({
            resource: perm.resource,
            action: perm.action,
            description: `Allows ${perm.action} on ${perm.resource}`,
          })
          .select('id')
          .single()

        if (error) {
          return { success: false, error: `Failed to create permission ${key}: ${error.message}` }
        }

        permissionMap.set(key, data.id)
      }
    }

    for (const roleDef of Object.values(ROLE_DEFINITIONS)) {
      const { data: existingRole } = await db
        .from('roles')
        .select('id')
        .eq('slug', roleDef.slug)
        .maybeSingle()

      let roleId: string

      if (existingRole) {
        roleId = existingRole.id
      } else {
        const { data, error } = await db
          .from('roles')
          .insert({
            name: roleDef.name,
            slug: roleDef.slug,
            description: roleDef.description,
            scope: roleDef.scope,
            is_system: true,
          })
          .select('id')
          .single()

        if (error) {
          return { success: false, error: `Failed to create role ${roleDef.slug}: ${error.message}` }
        }

        roleId = data.id
      }

      if (roleDef.slug !== 'super-admin') {
        for (const perm of roleDef.permissions) {
          const permKey = `${perm.resource}:${perm.action}`
          const permId = permissionMap.get(permKey)

          if (!permId) continue

          const { error: linkError } = await db
            .from('role_permissions')
            .insert({
              role_id: roleId,
              permission_id: permId,
            })
            .maybeSingle()

          if (linkError && !linkError.message.includes('duplicate key')) {
            return {
              success: false,
              error: `Failed to link permission ${permKey} to role ${roleDef.slug}: ${linkError.message}`,
            }
          }
        }
      }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during role seeding'
    return { success: false, error: message }
  }
}
