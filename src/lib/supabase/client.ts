// ==============================================================================
// Supabase Browser Client (Clean Production/Zero-Mock Layer)
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import { Organization, UtilityBill, WasteListing, SymbiosisMatch } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctybhgfawzchcqzboiau.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const getSupabaseBrowserClient = () => supabase;

export async function getOrganizationData(slug: string): Promise<Organization | null> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return data as Organization;
  } catch {
    return null;
  }
}

export async function getLatestBill(orgId: string): Promise<UtilityBill | null> {
  try {
    const { data, error } = await supabase
      .from('utility_bills')
      .select('*')
      .eq('org_id', orgId)
      .order('billing_year', { ascending: false })
      .order('billing_month', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data as UtilityBill;
  } catch {
    return null;
  }
}

export async function getWasteListings(orgId?: string): Promise<WasteListing[]> {
  try {
    let query = supabase.from('waste_listings').select('*');
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data as WasteListing[];
  } catch {
    return [];
  }
}

export async function getSymbiosisMatches(): Promise<SymbiosisMatch[]> {
  try {
    const { data, error } = await supabase.from('symbiosis_matches').select('*');
    if (error || !data) return [];
    return data as SymbiosisMatch[];
  } catch {
    return [];
  }
}
