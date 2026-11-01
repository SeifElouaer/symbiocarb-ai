-- ==============================================================================
-- SymbioCarb AI - Database Seed Script
-- Realistic Industrial Seed Data for Tunisian SMEs & Agro-Industries
-- Personas: Sfax Huilerie, Tozeur Dattes BioClaira, Ben Arous Mécanique CBAM
-- ==============================================================================

-- 1. Insert 3 Realistic Tunisian Industrial Facilities (Organizations)
insert into organizations (
    id, slug, name_fr, name_en, name_ar, sector, governorate, industrial_zone,
    latitude, longitude, cbam_exposed, steg_tariff_type, preferred_locale, contact_phone, contact_email
) values 
(
    'a1111111-1111-1111-1111-111111111111',
    'huilerie-sfax',
    'Huilerie & Valorisation Agro-Industrielle du Sud',
    'South Olive Oil & Agro-Industrial Valorization',
    'معصرة ومجمع الزيتونة للتثمين الفلاحي صفاقس',
    'olive_oil',
    'Sfax',
    'Zone Industrielle Thyna - Route de Gabès',
    34.6852, 10.6984,
    false,
    'MT_POSTES_HORAIRES',
    'fr',
    '+216 74 450 120',
    'direction@huilerie-sud.tn'
),
(
    'b2222222-2222-2222-2222-222222222222',
    'dattes-tozeur-bioclaira',
    'Société Saharienne de Conditionnement de Dattes & Unité BioClaira',
    'Sahara Dates Conditioning & BioClaira Valorization Unit',
    'الشركة الصحراوية لتكييف التمور وتثمين النوى بتوزر',
    'date_processing',
    'Tozeur',
    'Zone Industrielle Tozeur-Nefta',
    33.9197, 8.1335,
    false,
    'MT_POSTES_HORAIRES',
    'ar-TN',
    '+216 76 452 800',
    'contact@sahara-dates.tn'
),
(
    'c3333333-3333-3333-3333-333333333333',
    'mecanique-ben-arous',
    'Tunisie Usinage & Composants Mécaniques (Export UE)',
    'Tunisia Precision Machining & Mechanical Components (EU Export)',
    'الشركة التونسية للميكانيك الدقيق والتصدير بن عروس',
    'metal_mechanics',
    'Ben Arous',
    'Zone Industrielle El Mghira',
    36.7214, 10.2285,
    true, -- EU CBAM Export exposed!
    'MT_POSTES_HORAIRES',
    'en',
    '+216 71 391 400',
    'compliance@tunisie-usinage.com'
)
on conflict (id) do nothing;

-- 2. Insert STEG Medium Voltage Bills (Utility Bills)
insert into utility_bills (
    id, org_id, billing_month, billing_year, tariff_regime, district_steg,
    kwh_jour, kwh_pointe, kwh_soir, kwh_nuit, kvarh_total, cos_phi, tan_phi,
    reactive_penalty_tnd, p_souscrite_kva, p_max_appelee_kva, power_overrun_penalty_tnd,
    total_ht_tnd, tva_tnd, municipal_taxes_tnd, ftr_tnd, total_ttc_tnd, is_verified
) values
-- Sfax Huilerie: Peak seasonal crushing campaign, heavy pointe load
(
    'd1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    10, 2026, 'MT_POSTES_HORAIRES', 'Sfax Sud',
    42500, 26800, 14200, 19500, -- Total = 103,000 kWh
    68500, 0.832, 0.665,
    648.500, -- Redevance énergie réactive cos φ < 0.85
    350.00, 395.00, 1125.000, -- Dépassement 45 kVA
    28450.000, 5405.500, 320.000, 515.000, 34690.500, true
),
-- Tozeur Dattes: Constant cold storage load (chillers 24/7)
(
    'd2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    10, 2026, 'MT_POSTES_HORAIRES', 'Tozeur',
    65000, 18500, 22000, 38500, -- Total = 144,000 kWh
    72000, 0.895, 0.500,
    0.000, -- Good cos phi
    400.00, 380.00, 0.000,
    37800.000, 7182.000, 410.000, 720.000, 46112.000, true
),
-- Ben Arous Mechanics: Induction furnaces & CNC machining, terrible cos φ = 0.748! Heavy penalties!
(
    'd3333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    10, 2026, 'MT_POSTES_HORAIRES', 'Mghira / Megrine',
    82000, 14500, 16000, 21500, -- Total = 134,000 kWh
    105000, 0.748, 0.784,
    3845.250, -- Massive reactive penalty!
    500.00, 512.00, 300.000,
    41250.000, 7837.500, 450.000, 670.000, 50207.500, true
)
on conflict (id) do nothing;

-- 3. Multilingual Reference Emission Factors (ANME, ADEME, EU CBAM)
insert into emission_factors (
    code, name_fr, name_en, name_ar, category, cn_code_8, unit, ef_kgco2e_per_unit, scope, source_authority, description
) values
(
    'EF_STEG_GRID_TN',
    'Réseau Électrique STEG Moyenne Tension Tunisie',
    'Tunisian National Grid STEG Medium Voltage',
    'الشبكة الوطنية للكهرباء والغاز الستاغ تونس - جهد متوسط',
    'electricity_grid',
    null,
    'kWh',
    0.473000, -- Facteur officiel ANME / IGES
    2,
    'ANME / Ministère de l''Énergie 2024',
    'Facteur moyen mix électrique tunisien (gaz naturel 97%, EnR 3%)'
),
(
    'EF_NATURAL_GAS_STEG',
    'Gaz Naturel Réseau STEG (PCI)',
    'Natural Gas Grid STEG (LHV)',
    'الغاز الطبيعي - شبكة الستاغ',
    'combustion',
    null,
    'm3',
    2.050000,
    1,
    'ANME / GIEC 2023',
    'Combustion en chaudières industrielles ou fours'
),
(
    'EF_STEEL_COLD_ROLLED',
    'Tôles d''acier laminées à froid (bobines)',
    'Cold-rolled flat steel products (coils)',
    'لفائف حديد وصلب مدرفلة على البارد',
    'raw_materials',
    '7209 16 90',
    'ton',
    2450.000000,
    3,
    'EU CBAM Default JRC 2024',
    'Spécifique CBAM / MACF Annexe IV secteur Sidérurgie'
),
(
    'EF_STEEL_HOT_ROLLED',
    'Aciers alliés ou non laminés à chaud (barres/profilés)',
    'Hot-rolled non-alloy steel bars and rods',
    'قضبان ومقاطع فولاذ مدرفلة على الساخن',
    'raw_materials',
    '7214 20 00',
    'ton',
    2180.000000,
    3,
    'EU CBAM Default JRC 2024',
    'Spécifique CBAM / MACF pour pièces usinées'
),
(
    'EF_ALUMINUM_UNWROUGHT',
    'Aluminium sous forme brute (lingots primaires)',
    'Unwrought aluminum ingots (primary)',
    'سبائك ألمنيوم خام أولي',
    'raw_materials',
    '7601 10 00',
    'ton',
    8600.000000,
    3,
    'EU CBAM Default JRC 2024',
    'Forte intensité carbone due à l''électrolyse primaire'
),
(
    'EF_ALUMINUM_EXTRUDED',
    'Barres, profilés et tubes en alliage d''aluminium',
    'Aluminum alloy bars, rods and extruded profiles',
    'مقاطع وقضبان ألمنيوم مشكّلة بالبثق',
    'raw_materials',
    '7604 21 00',
    'ton',
    9200.000000,
    3,
    'EU CBAM Default JRC 2024',
    'Profilés d''usinage mécanique exportés vers l''UE'
),
(
    'EF_FERTILIZER_UREA',
    'Engrais azotés minéraux ou chimiques (Urée)',
    'Nitrogenous mineral fertilizers (Urea)',
    'أسمدة نيتروجينية معدنية أو كيميائية (اليوريا)',
    'raw_materials',
    '3102 10 10',
    'ton',
    2100.000000,
    3,
    'EU CBAM Default JRC 2024',
    'Secteur fertilisants GCT / exportation'
),
(
    'EF_FREIGHT_MARITIME_MED',
    'Fret Maritime RORO Tunisie (Radès) - Marseille / Gênes',
    'Maritime RORO Freight Tunisia (Rades) - Marseille / Genoa',
    'الشحن البحري رادس - مرسيليا / جنوة',
    'freight',
    null,
    't.km',
    0.045000,
    3,
    'ADEME Base Empreinte 2024',
    'Navire cargo roulier méditerranéen'
),
(
    'EF_DATE_PITS_RAW',
    'Noyaux de dattes bruts (résidu agricole déshydraté)',
    'Raw date pits (dehydrated agricultural residue)',
    'نوى التمور الخام (مخلفات فلاحية مجففة)',
    'bio_waste',
    null,
    'ton',
    12.000000,
    1,
    'BioClaira / ANME Research 2024',
    'Empreinte de collecte et broyage primaire'
),
(
    'EF_OLIVE_POMACE_GRIGNONS',
    'Grignons d''olive humides (45-50% humidité)',
    'Wet olive pomace (45-50% moisture)',
    'فيتور الزيتون الرطب (مخلفات المعاصر)',
    'bio_waste',
    null,
    'ton',
    15.000000,
    1,
    'BioClaira / ANME Research 2024',
    'Empreinte de manutention et extraction'
),
(
    'EF_ACTIVATED_CARBON_FOSSIL_SUBST',
    'Charbon actif importé à base de houille fossile (Évité)',
    'Imported fossil coal-based activated carbon (Avoided)',
    'الكربون المنشط الأحفوري المستورد من الفحم الحجري (تم تجنبه)',
    'bio_waste',
    '3802 10 00',
    'ton',
    -4200.000000, -- Facteur négatif (émissions évitées!)
    3,
    'Ecoinvent 3.9 / BioClaira LCA',
    'Émissions du cycle de vie évitées en substituant le charbon actif minéral'
)
on conflict (code) do nothing;

-- 4. Waste Listings & BioClaira Pyrolysis Valorization Opportunities
insert into waste_listings (
    id, org_id, waste_type, title_fr, title_en, title_ar,
    annual_tonnage, moisture_pct, current_disposal_method, current_disposal_cost_tnd,
    bioclaira_model, potential_annual_revenue_tnd, avoided_tco2e_per_year, status
) values
(
    'w1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'date_pits',
    'Noyaux de Dattes Deglet Nour de Haute Densité (Tozeur)',
    'High-Density Deglet Nour Date Pits (Tozeur)',
    'نوى تمور دقلة النور عالية الكثافة بتوزر',
    650.00, 11.5,
    'landfill', 18500.00,
    'pyrolysis_activated_carbon',
    1430000.00, -- 195t Charbon Actif @ 7,300 TND/t
    1150.00, -- 1,150 tCO2e évitées par an
    'available'
),
(
    'w2222222-2222-2222-2222-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'olive_pomace',
    'Grignons d''olive bruts & pulpes épuisées (Sfax)',
    'Raw olive pomace and exhausted pulps (Sfax)',
    'فيتور الزيتون الخام ومخلفات العصر صفاقس',
    3400.00, 42.0,
    'open_dumping', 42000.00,
    'briquette_fuel',
    510000.00, -- Biocombustible substitut de mazout
    2850.00,
    'available'
),
(
    'w3333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'metal_shavings',
    'Copeaux d''acier et limailles d''usinage CNC propres',
    'Clean CNC steel turnings and machine shavings',
    'مخلفات وشظايا الحديد والصلب الناتجة عن الخراطة الدقيقة',
    180.00, 2.0,
    'low_value_boiler', 0.00,
    'circular_metallurgy_recycling',
    144000.00,
    390.00,
    'available'
)
on conflict (id) do nothing;

-- 5. Symbiosis Matches across Tunisian Industrial Zones
insert into symbiosis_matches (
    id, producer_org_id, consumer_org_id, waste_listing_id,
    road_distance_km, transport_cost_tnd, net_economic_gain_tnd, net_tco2e_saved,
    match_score, status
) values
(
    's1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222', -- Tozeur Date Pits
    'a1111111-1111-1111-1111-111111111111', -- Sfax Off-taker for Wastewater Filtration
    'w1111111-1111-1111-1111-111111111111',
    285.00, 14250.00, 680000.00, 940.00,
    0.915, 'suggested'
),
(
    's2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333', -- Ben Arous Steel scraps
    'a1111111-1111-1111-1111-111111111111',
    270.00, 6500.00, 115000.00, 310.00,
    0.840, 'suggested'
)
on conflict (id) do nothing;

