// ==============================================================================
// Supabase Browser Client with Automatic Fallback Layer
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import { 
  FALLBACK_ORGANIZATIONS, 
  FALLBACK_BILLS, 
  FALLBACK_EMISSION_FACTORS, 
  FALLBACK_WASTE_LISTINGS, 
  FALLBACK_SYMBIO_MATCHES 
} from './fallback-data';
import { Organization, UtilityBill, EmissionFactor, WasteListing, SymbiosisMatch } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctybhgfawzchcqzboiau.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const getSupabaseBrowserClient = () => supabase;

export async function getOrganizationData(slug: string): Promise<Organization> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const key = slug.includes('sfax') ? 'sfax' : slug.includes('tozeur') ? 'tozeur' : 'benarous';
      return FALLBACK_ORGANIZATIONS[key];
    }
    return data as Organization;
  } catch {
    const key = slug.includes('sfax') ? 'sfax' : slug.includes('tozeur') ? 'tozeur' : 'benarous';
    return FALLBACK_ORGANIZATIONS[key];
  }
}

export async function getLatestBill(orgId: string, slugKey: string): Promise<UtilityBill> {
  try {
    const { data, error } = await supabase
      .from('utility_bills')
      .select('*')
      .eq('org_id', orgId)
      .order('billing_year', { ascending: false })
      .order('billing_month', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return FALLBACK_BILLS[slugKey] || FALLBACK_BILLS.benarous;
    }
    return data as UtilityBill;
  } catch {
    return FALLBACK_BILLS[slugKey] || FALLBACK_BILLS.benarous;
  }
}

export async function getWasteListings(orgId?: string): Promise<WasteListing[]> {
  try {
    let query = supabase.from('waste_listings').select('*');
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return FALLBACK_WASTE_LISTINGS;
    }
    return data as WasteListing[];
  } catch {
    return FALLBACK_WASTE_LISTINGS;
  }
}

export async function getSymbiosisMatches(): Promise<SymbiosisMatch[]> {
  try {
    const { data, error } = await supabase.from('symbiosis_matches').select('*');
    if (error || !data || data.length === 0) {
      return FALLBACK_SYMBIO_MATCHES;
    }
    return data as SymbiosisMatch[];
  } catch {
    return FALLBACK_SYMBIO_MATCHES;
  }
}

