-- Create the missing event record for wwwId 'AFWYTLX'
-- This will fix the "Event not found" error

INSERT INTO events (
    id,
    www_id,
    title,
    couple_names,
    wedding_date,
    venue_name,
    venue_address,
    organizer_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'AFWYTLX',
    'Wedding - Astor & Canon',
    'Astor & Canon',
    '2024-12-25',
    'Sample Venue',
    '123 Wedding Street, City, State',
    (SELECT id FROM auth.users LIMIT 1), -- Use the first user as organizer
    NOW(),
    NOW()
) ON CONFLICT (www_id) DO NOTHING;

-- Verify the event was created
SELECT id, www_id, title, couple_names FROM events WHERE www_id = 'AFWYTLX';
