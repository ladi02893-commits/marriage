CREATE TABLE IF NOT EXISTS public.marriage_bureaus (
  id TEXT PRIMARY KEY,
  bureau_code TEXT NOT NULL UNIQUE,
  owner_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  country TEXT NOT NULL DEFAULT 'Pakistan',
  state_province TEXT,
  city TEXT NOT NULL,
  service_cities TEXT[] DEFAULT '{}',
  address TEXT NOT NULL,
  registration_number TEXT,
  description TEXT,
  specializations TEXT[] DEFAULT '{}',
  rishta_scope TEXT NOT NULL DEFAULT 'ALL_PLATFORM',
  approval_status TEXT NOT NULL DEFAULT 'PENDING',
  reviewer_notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT marriage_bureaus_scope_valid CHECK (rishta_scope IN ('ALL_PLATFORM', 'BUREAU_PRIORITY')),
  CONSTRAINT marriage_bureaus_status_valid CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'))
);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bureau_id TEXT,
  ADD COLUMN IF NOT EXISTS created_by_bureau BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.matrimonial_profiles
  ADD COLUMN IF NOT EXISTS bureau_id TEXT,
  ADD COLUMN IF NOT EXISTS created_by_bureau BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS marriage_bureaus_city_status_idx ON public.marriage_bureaus (lower(city), approval_status);
CREATE INDEX IF NOT EXISTS users_bureau_idx ON public.users (bureau_id);
CREATE INDEX IF NOT EXISTS matrimonial_profiles_bureau_idx ON public.matrimonial_profiles (bureau_id);

INSERT INTO public.marriage_bureaus (
  id, bureau_code, name, owner_name, email, phone, whatsapp_number, country, city,
  service_cities, address, registration_number, description, specializations, rishta_scope,
  approval_status, is_verified
) VALUES
  (
    'bureau-lhr-01', 'MB-LHR-01', 'Al-Meezan Royal Marriage Bureau', 'Haji Tariq Mehmood',
    'lahore@almeezanbureau.pk', '+92 300 4112201', '+92 300 4112201', 'Pakistan', 'Lahore',
    ARRAY['Lahore', 'Kasur', 'Sheikhupura'], 'Suite 14, Gulberg III Main Boulevard, Lahore',
    'REG-LHR-4021', 'Trusted family matchmaking office in Lahore serving educated, professional, and business families since 2012.',
    ARRAY['Doctors & Engineers', 'Business Families', 'Foreign Settled'], 'ALL_PLATFORM', 'APPROVED', true
  ),
  (
    'bureau-lhr-02', 'MB-LHR-02', 'Model Town Nikah & Rishta Daftar', 'Mrs. Samina Khalid',
    'info@modeltownrishta.pk', '+92 321 4458890', '+92 321 4458890', 'Pakistan', 'Lahore',
    ARRAY['Lahore', 'Gujranwala'], 'Bank Square Market, Model Town C-Block, Lahore',
    'REG-LHR-5190', 'Dedicated senior female matchmakers specializing in respectful family introductions across Lahore.',
    ARRAY['Syed & Rajput Families', 'Educated Brides & Grooms'], 'ALL_PLATFORM', 'APPROVED', true
  ),
  (
    'bureau-khi-01', 'MB-KHI-01', 'Clifton Crescent Marriage Bureau', 'Kamran Siddiqui',
    'contact@cliftoncrescent.pk', '+92 300 2234411', '+92 300 2234411', 'Pakistan', 'Karachi',
    ARRAY['Karachi', 'Hyderabad'], '2nd Floor, Zamzama Commercial Lane 4, DHA Phase 5, Karachi',
    'REG-KHI-1182', 'Confidential DHA & Clifton matchmaking consultancy for medical, corporate, and overseas families.',
    ARRAY['DHA / Clifton', 'Corporate & Medical', 'Overseas'], 'ALL_PLATFORM', 'APPROVED', true
  ),
  (
    'bureau-isb-01', 'MB-ISB-01', 'Margalla Nikah Consultants & Bureau', 'Brig (R) Zubair Ahmed',
    'office@margallabureau.pk', '+92 333 5120099', '+92 333 5120099', 'Pakistan', 'Islamabad',
    ARRAY['Islamabad', 'Rawalpindi', 'Wah Cantt', 'Attock'], 'Office 7, Jinnah Super Market, Sector F-7 Markaz, Islamabad',
    'REG-ISB-2094', 'Twin-city Islamabad & Rawalpindi marriage bureau serving civil services, defence, and university families.',
    ARRAY['Civil Services', 'Engineering & Academia', 'Twin Cities'], 'ALL_PLATFORM', 'APPROVED', true
  ),
  (
    'bureau-rwp-01', 'MB-RWP-01', 'Pothohar Heritage Marriage Daftar', 'Chaudhry Aslam Nawaz',
    'desk@pothohardaftar.pk', '+92 315 5543321', '+92 315 5543321', 'Pakistan', 'Rawalpindi',
    ARRAY['Rawalpindi', 'Islamabad', 'Jhelum', 'Chakwal'], 'Commercial Market Plaza, Satellite Town, Rawalpindi',
    'REG-RWP-3302', 'Respectable family rishta office in Rawalpindi with verified home-visit background coordination.',
    ARRAY['Armed Forces & Govt', 'Local Pothohar Families'], 'ALL_PLATFORM', 'APPROVED', true
  ),
  (
    'bureau-fsd-01', 'MB-FSD-01', 'Lyallpur Silk Marriage Bureau', 'Mian Waqas Arain',
    'connect@lyallpurbureau.pk', '+92 301 7788990', '+92 301 7788990', 'Pakistan', 'Faisalabad',
    ARRAY['Faisalabad', 'Chiniot', 'Sargodha'], 'D-Ground Commercial Area, Peoples Colony, Faisalabad',
    'REG-FSD-6105', 'Industrial & educated family matchmaking office serving Faisalabad and central Punjab.',
    ARRAY['Business & Industrialists', 'University Graduates'], 'ALL_PLATFORM', 'APPROVED', true
  ),
  (
    'bureau-mux-01', 'MB-MUX-01', 'Multan Sharif Rishta Center', 'Syed Raza Bukhari',
    'multan@sharifrishta.pk', '+92 300 6311122', '+92 300 6311122', 'Pakistan', 'Multan',
    ARRAY['Multan', 'Bahawalpur', 'Sahiwal', 'Dera Ghazi Khan'], 'Abdali Road near Chowk Kacheri, Multan',
    'REG-MUX-7120', 'South Punjab traditional and professional matchmaking bureau with verified family endorsements.',
    ARRAY['South Punjab Families', 'Medical & Agro Business'], 'ALL_PLATFORM', 'APPROVED', true
  ),
  (
    'bureau-pew-01', 'MB-PEW-01', 'Khyber Aman Marriage Bureau', 'Haji Farooq Afridi',
    'info@khyberamanbureau.pk', '+92 345 9112233', '+92 345 9112233', 'Pakistan', 'Peshawar',
    ARRAY['Peshawar', 'Mardan', 'Swat', 'Abbottabad'], 'University Road, Tehkal Payan, Peshawar',
    'REG-PEW-8102', 'Respected KP matchmaking daftar coordinating traditional & educated family alliances.',
    ARRAY['Pashtun & Hindko Families', 'Doctors & Civil Engineers'], 'ALL_PLATFORM', 'APPROVED', true
  ),
  (
    'bureau-intl-01', 'MB-INTL-01', 'Overseas Diaspora Marriage Bureau', 'Mrs. Nadia Farhan',
    'global@diasporamatrimony.com', '+44 7700 900123', '+44 7700 900123', 'United Kingdom', 'London',
    ARRAY['London', 'Birmingham', 'Manchester', 'Dubai', 'Toronto', 'New York, NY'], '218 Ilford High Road, London (with UAE & North America Desk)',
    'REG-UK-9014', 'Connecting Pakistani diaspora families across the UK, UAE, USA, Canada, and Europe with verified home offices.',
    ARRAY['UK / UAE / US / Canada', 'Second-Generation Professionals'], 'ALL_PLATFORM', 'APPROVED', true
  )
ON CONFLICT (id) DO NOTHING;
