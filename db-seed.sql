-- Cleanup
TRUNCATE TABLE player_weapons;
TRUNCATE TABLE players;
TRUNCATE TABLE weapons;

-- Set a specific seed for reproducibility
SELECT setseed(0.42);


--=={{ Generate players }}==---

-- First, insert the specific players mentioned
INSERT INTO players (name, level) VALUES
    ('Alicia', floor(random() * 50 + 1)),
    ('Barbara', floor(random() * 50 + 1)),
    ('Ciara', floor(random() * 50 + 1)),
    ('Diana', floor(random() * 50 + 1)),
    ('Emilia', floor(random() * 50 + 1));

-- Insert Felicia as soft-deleted
INSERT INTO players (name, level, deletion_date) VALUES
    ('Felicia', floor(random() * 50 + 1), CURRENT_TIMESTAMP);

-- Generate 99994 random player names to have 100000 total players
WITH RECURSIVE names AS (
    SELECT 1 as id, 
           chr(floor(random() * 26 + 65)::integer) || 
           lower(chr(floor(random() * 26 + 97)::integer)) ||
           lower(chr(floor(random() * 26 + 97)::integer)) ||
           lower(chr(floor(random() * 26 + 97)::integer)) ||
           lower(chr(floor(random() * 26 + 97)::integer)) as name
    UNION ALL
    SELECT id + 1,
           chr(floor(random() * 26 + 65)::integer) || 
           lower(chr(floor(random() * 26 + 97)::integer)) ||
           lower(chr(floor(random() * 26 + 97)::integer)) ||
           lower(chr(floor(random() * 26 + 97)::integer)) ||
           lower(chr(floor(random() * 26 + 97)::integer))
    FROM names WHERE id < 99994
)
INSERT INTO players (name, level)
SELECT name, floor(random() * 50 + 1)
FROM names;

-- Create weapon name components for generation
CREATE TEMPORARY TABLE weapon_prefixes (prefix TEXT UNIQUE);
INSERT INTO weapon_prefixes VALUES
    ('Cursed'),
    ('Epic'), ('Legendary'), ('Mythical'), ('Radiant'),
    ('Ancient'), ('Mystic'), ('Dragon'), ('Holy'), ('Demonic'),
    ('Celestial'), ('Dark'), ('Blazing'), ('Frozen'), ('Storm'),
    ('Crystal'), ('Shadow'), ('Light'), ('Chaos'), ('Divine');

CREATE TEMPORARY TABLE weapon_types (type TEXT UNIQUE);
INSERT INTO weapon_types VALUES
    ('Katana'),
    ('Kunai'), ('Sai'), ('Saber'), ('Mace'),
    ('Sword'), ('Bow'), ('Staff'), ('Dagger'), ('Axe'),
    ('Spear'), ('Wand'), ('Hammer'), ('Blade'), ('Scythe');


--=={{ Generate weapons }}==---

INSERT INTO weapons (
    name, type, rarity, attack_power, element,
    crit_rate, crit_damage, effect_description, level, upgrade_cost
)
SELECT 
    prefix || ' ' || type as name,
    type,
    floor(random() * 5 + 1) as rarity,
    floor(random() * 1000 + 100) as attack_power,
    (ARRAY['Fire', 'Water', 'Wind', 'Earth', 'Lightning', 'Ice', 'Dark', 'Light'])[floor(random() * 8 + 1)] as element,
    round((random() * 0.5)::numeric, 2) as crit_rate,
    round((1 + random())::numeric, 2) as crit_damage,
    'Effect #' || floor(random() * 20 + 1)::text as effect_description,
    floor(random() * 20 + 1) as level,
    floor(random() * 10000 + 1000) as upgrade_cost
FROM (
    SELECT prefix, type
    FROM weapon_prefixes
    CROSS JOIN weapon_types
    CROSS JOIN generate_series(1, 50) -- This will generate ~5100 weapons (prefixes * types * 50)
) subq;


--=={{ Generate player-weapon relationships }}==---

-- Insert a specific relationship for Alicia with the weapon 'Cursed Katana'
INSERT INTO player_weapons (player_id, weapon_id)
SELECT 
    (SELECT id FROM players WHERE name = 'Alicia' LIMIT 1) as player_id,
    (SELECT id FROM weapons WHERE name = 'Cursed Katana' LIMIT 1) as weapon_id;

-- Generate random player-weapon relationships
INSERT INTO player_weapons (player_id, weapon_id)
    SELECT DISTINCT
        floor(random() * (SELECT max(id) FROM players) + 1)::integer as player_id,
        floor(random() * (SELECT max(id) FROM weapons) + 1)::integer as weapon_id
    FROM generate_series(1, 10_000_000) 
ON CONFLICT DO NOTHING;

-- Finalize

-- Drop temporary tables
DROP TABLE weapon_prefixes;
DROP TABLE weapon_types;

-- Analyze tables for better query planning
ANALYZE players;
ANALYZE weapons;
ANALYZE player_weapons;
