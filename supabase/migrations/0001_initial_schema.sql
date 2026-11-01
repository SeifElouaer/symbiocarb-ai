-- ==============================================================================
-- SymbioCarb AI - Supabase Migration 0001: Initial Industrial Schema & pgvector
-- Target: Tunisian Industrial SMEs, STEG MT/HT, EU CBAM, BioClaira Symbiosis
-- ==============================================================================

-- 1. Enable pgvector extension for multilingual semantic search
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- 2. Organizations / Industrial Facilities
create table if not exists organizations (
    id uuid primary key default uuid_generate_v4(),
    slug text unique not null,
    name_fr text not null,
    name_en text not null,
    name_ar text not null,
    sector text not null, -- 'agro_industry', 'metal_mechanics', 'date_processing', 'olive_oil', 'textile', 'chemicals'
    governorate text not null, -- 'Sfax', 'Tozeur', 'Ben Arous', 'Bizerte', 'Sousse', 'Gabès', 'Nabeul'
    industrial_zone text not null, -- 'Thyna / Agareb', 'Beni Khalled / Tozeur', 'Mghira / Ben Arous', etc.
    latitude double precision not null,
    longitude double precision not null,
    cbam_exposed boolean default false,
    steg_tariff_type text not null default 'MT_POSTES_HORAIRES', -- 'MT_POSTES_HORAIRES', 'MT_UNIFORME', 'HT'
    preferred_locale text not null default 'fr', -- 'fr', 'en', 'ar-TN'
    contact_phone text,
    contact_email text,
    created_at timestamp with time zone default now()
);

-- 3. Utility Bills (STEG Moyenne/Haute Tension & SONEDE Water Bills)
create table if not exists utility_bills (
    id uuid primary key default uuid_generate_v4(),
    org_id uuid references organizations(id) on delete cascade not null,
    billing_month integer not null check (billing_month between 1 and 12),
    billing_year integer not null check (billing_year between 2020 and 2030),
    tariff_regime text not null default 'MT_POSTES_HORAIRES',
    district_steg text not null,
    
    -- Energy consumption per time slot (kWh)
    kwh_jour numeric(12, 2) not null default 0,      -- 07h-19h (winter) / 08h-20h (summer)
    kwh_pointe numeric(12, 2) not null default 0,    -- 19h-22h (winter) / 20h-23h (summer)
    kwh_soir numeric(12, 2) not null default 0,      -- 22h-24h
    kwh_nuit numeric(12, 2) not null default 0,      -- 00h-07h
    kwh_total numeric(12, 2) generated always as (kwh_jour + kwh_pointe + kwh_soir + kwh_nuit) stored,
    
    -- Reactive power & Power factor
    kvarh_total numeric(12, 2) not null default 0,
    cos_phi numeric(4, 3) not null default 0.850,    -- cos φ
    tan_phi numeric(4, 3) not null default 0.620,    -- tan φ
    reactive_penalty_tnd numeric(10, 3) not null default 0,
    
    -- Contracted Power (Puissance Souscrite) vs Max Demand
    p_souscrite_kva numeric(10, 2) not null,
    p_max_appelee_kva numeric(10, 2) not null,
    power_overrun_penalty_tnd numeric(10, 3) not null default 0,
    
    -- Financials in Tunisian Dinars (TND)
    total_ht_tnd numeric(12, 3) not null,
    tva_tnd numeric(12, 3) not null default 0,
    municipal_taxes_tnd numeric(10, 3) not null default 0,
    ftr_tnd numeric(10, 3) not null default 0, -- Fonds de Transition Energétique
    total_ttc_tnd numeric(12, 3) not null,
    
    -- Storage & OCR traceability
    raw_file_url text,
    extracted_json jsonb default '{}'::jsonb,
    is_verified boolean default false,
    created_at timestamp with time zone default now()
);

-- 4. Multilingual Reference Emission Factors (with pgvector 768d)
create table if not exists emission_factors (
    id uuid primary key default uuid_generate_v4(),
    code text unique not null,
    name_fr text not null,
    name_en text not null,
    name_ar text not null,
    category text not null, -- 'electricity_grid', 'combustion', 'raw_materials', 'freight', 'bio_waste'
    cn_code_8 text,         -- European Customs Code (Code douanier 8 chiffres pour CBAM)
    unit text not null,     -- 'kWh', 'kg', 'ton', 't.km', 'm3'
    ef_kgco2e_per_unit numeric(12, 6) not null, -- Scope 1, 2 or 3 upstream emission factor
    scope integer not null check (scope in (1, 2, 3)),
    source_authority text not null, -- 'ANME / IGES 2024', 'ADEME Base Empreinte', 'EU CBAM Default JRC 2024'
    description text,
    embedding vector(768),  -- text-embedding-004
    created_at timestamp with time zone default now()
);

-- Vector indexing for sub-second cosine distance search
create index if not exists ef_embedding_idx on emission_factors using ivfflat (embedding vector_cosine_ops) with (lists = 20);

-- 5. Bill of Materials (BOM) Entries for EU CBAM Reporting
create table if not exists bom_entries (
    id uuid primary key default uuid_generate_v4(),
    org_id uuid references organizations(id) on delete cascade not null,
    raw_description text not null,
    quantity numeric(12, 4) not null,
    unit text not null default 'ton',
    matched_ef_id uuid references emission_factors(id),
    similarity_score numeric(4, 3),
    scope integer not null default 3,
    total_tco2e numeric(12, 4) not null default 0,
    created_at timestamp with time zone default now()
);

-- 6. Waste Listings & BioClaira Valorization Potentials
create table if not exists waste_listings (
    id uuid primary key default uuid_generate_v4(),
    org_id uuid references organizations(id) on delete cascade not null,
    waste_type text not null, -- 'date_pits', 'olive_pomace', 'margines', 'metal_shavings', 'textile_scraps', 'hdpe_plastic'
    title_fr text not null,
    title_en text not null,
    title_ar text not null,
    annual_tonnage numeric(10, 2) not null,
    moisture_pct numeric(5, 2) not null default 15.0,
    current_disposal_method text not null, -- 'landfill', 'open_dumping', 'low_value_boiler', 'uncontrolled_drainage'
    current_disposal_cost_tnd numeric(10, 2) not null default 0,
    
    -- BioClaira Simulator Output Cache
    bioclaira_model text, -- 'pyrolysis_activated_carbon', 'biochar_soil', 'briquette_fuel', 'anaerobic_biogas'
    simulated_outputs_json jsonb default '{}'::jsonb,
    potential_annual_revenue_tnd numeric(12, 2) default 0,
    avoided_tco2e_per_year numeric(10, 2) default 0,
    status text not null default 'available', -- 'available', 'matched', 'contracted'
    created_at timestamp with time zone default now()
);

-- 7. Industrial Symbiosis Matches
create table if not exists symbiosis_matches (
    id uuid primary key default uuid_generate_v4(),
    producer_org_id uuid references organizations(id) on delete cascade not null,
    consumer_org_id uuid references organizations(id) on delete cascade not null,
    waste_listing_id uuid references waste_listings(id) on delete cascade not null,
    road_distance_km numeric(8, 2) not null,
    transport_cost_tnd numeric(10, 2) not null,
    net_economic_gain_tnd numeric(12, 2) not null,
    net_tco2e_saved numeric(10, 2) not null,
    match_score numeric(4, 3) not null, -- 0.000 to 1.000 based on distance, compatibility & volume
    status text not null default 'suggested', -- 'suggested', 'in_discussion', 'active'
    created_at timestamp with time zone default now()
);

-- 8. Telegram Bot Logs & Darija Field Interactions
create table if not exists telegram_logs (
    id uuid primary key default uuid_generate_v4(),
    org_id uuid references organizations(id) on delete set null,
    telegram_chat_id text not null,
    telegram_update_id bigint,
    direction text not null check (direction in ('inbound', 'outbound')),
    media_type text not null default 'text', -- 'text', 'voice', 'photo', 'document'
    raw_text text,
    translated_text text,
    detected_locale text default 'ar-TN',
    extracted_action_json jsonb default '{}'::jsonb,
    delivery_status text default 'sent',
    created_at timestamp with time zone default now()
);

-- ==============================================================================
-- 9. RPC FUNCTION: Multilingual Vector Matcher for Emission Factors
-- ==============================================================================
create or replace function match_emission_factors (
    query_embedding vector(768),
    match_threshold double precision default 0.45,
    match_count integer default 5,
    filter_category text default null
)
returns table (
    id uuid,
    code text,
    name_fr text,
    name_en text,
    name_ar text,
    category text,
    cn_code_8 text,
    unit text,
    ef_kgco2e_per_unit numeric,
    scope integer,
    source_authority text,
    similarity double precision
)
language plpgsql
as $$
begin
    return query
    select
        ef.id,
        ef.code,
        ef.name_fr,
        ef.name_en,
        ef.name_ar,
        ef.category,
        ef.cn_code_8,
        ef.unit,
        ef.ef_kgco2e_per_unit,
        ef.scope,
        ef.source_authority,
        1 - (ef.embedding <=> query_embedding) as similarity
    from emission_factors ef
    where 
        (filter_category is null or ef.category = filter_category)
        and (ef.embedding is not null)
        and (1 - (ef.embedding <=> query_embedding)) >= match_threshold
    order by ef.embedding <=> query_embedding
    limit match_count;
end;
$$;

