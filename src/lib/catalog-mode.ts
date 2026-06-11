import { createAdminClient } from './supabase/admin'

export interface CatalogModeConfig {
  enabled: boolean
  hide_prices: boolean
  disable_cart: boolean
  disable_checkout: boolean
  show_contact_button: boolean
  contact_url: string | null
  custom_message: string | null
}

const DEFAULT_CONFIG: CatalogModeConfig = {
  enabled: false,
  hide_prices: false,
  disable_cart: false,
  disable_checkout: false,
  show_contact_button: true,
  contact_url: null,
  custom_message: null,
}

export async function isCatalogMode(storefrontId: string): Promise<boolean> {
  const db = createAdminClient()

  const { data, error } = await db
    .from('catalog_settings')
    .select('enabled')
    .eq('storefront_id', storefrontId)
    .single()

  if (error || !data) {
    return false
  }

  return data.enabled === true
}

export async function getCatalogModeConfig(
  storefrontId: string
): Promise<CatalogModeConfig> {
  const db = createAdminClient()

  const { data, error } = await db
    .from('catalog_settings')
    .select('*')
    .eq('storefront_id', storefrontId)
    .single()

  if (error || !data) {
    return DEFAULT_CONFIG
  }

  return {
    enabled: data.enabled ?? false,
    hide_prices: data.hide_prices ?? false,
    disable_cart: data.disable_cart ?? false,
    disable_checkout: data.disable_checkout ?? false,
    show_contact_button: data.show_contact_button ?? true,
    contact_url: data.contact_url ?? null,
    custom_message: data.custom_message ?? null,
  }
}

export async function setCatalogModeConfig(
  storefrontId: string,
  config: Partial<CatalogModeConfig>
): Promise<boolean> {
  const db = createAdminClient()

  const { data: existing } = await db
    .from('catalog_settings')
    .select('id')
    .eq('storefront_id', storefrontId)
    .single()

  if (existing) {
    const { error } = await db
      .from('catalog_settings')
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) {
      console.error('[CatalogMode] Failed to update config:', error.message)
      return false
    }
  } else {
    const { error } = await db
      .from('catalog_settings')
      .insert({ storefront_id: storefrontId, ...config })

    if (error) {
      console.error('[CatalogMode] Failed to create config:', error.message)
      return false
    }
  }

  return true
}
