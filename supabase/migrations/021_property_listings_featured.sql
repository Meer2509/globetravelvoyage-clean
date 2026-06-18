-- Property marketplace: featured flag for admin curation

alter table property_listings add column if not exists is_featured boolean not null default false;

create index if not exists idx_property_listings_approved_featured
  on property_listings(status, is_featured desc, created_at desc)
  where status = 'approved';
