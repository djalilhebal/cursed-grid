package me.djalilhebal.scrapyard.cursedgrid;

import io.javalin.Javalin;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Main {

        public static void main(String[] args) {
            var app = Javalin.create(/*config*/)
                    .get("/", ctx -> ctx.result("[]"))
                    .start(7070);

            System.out.println("Testing db");
            testDb();
        }

        static void testDb() {
            String url = "jdbc:postgresql://localhost:5432/wonderworks";
            String user = "hatter";
            String password = "123456";

            try {
                Class.forName("org.postgresql.Driver");
            } catch (ClassNotFoundException e) {
                throw new RuntimeException(e);
            }

            try (Connection connection = DriverManager.getConnection(url, user, password)) {
                if (connection != null) {
                    System.out.println("Connected to the database!");
                } else {
                    System.out.println("Failed to make connection!");
                }
            } catch (SQLException e) {
                System.out.println("Connection error: " + e.getMessage());
            }
        }

        static void initTestData() {
            final String DROP_TABLE = "DROP TABLE IF EXISTS weapons;";

            final String CREATE_TABLE = "CREATE TABLE weapons (\n" +
                    "    id SERIAL PRIMARY KEY,\n" +
                    "    name VARCHAR(50) NOT NULL,\n" +
                    "    type VARCHAR(20) NOT NULL,      -- e.g., Sword, Bow, Staff\n" +
                    "    rarity INTEGER CHECK (rarity BETWEEN 1 AND 5),  -- Star rating, 1-5 stars\n" +
                    "    attack_power INTEGER,           -- Base attack power\n" +
                    "    element VARCHAR(20),            -- Fire, Water, Wind, Earth, etc.\n" +
                    "    crit_rate DECIMAL(4, 2),        -- Critical hit rate, e.g., 0.15 for 15%\n" +
                    "    crit_damage DECIMAL(5, 2),      -- Critical damage multiplier, e.g., 1.5 for +50% damage\n" +
                    "    effect_description TEXT,        -- Description of the weapon's special effect\n" +
                    "    level INTEGER DEFAULT 1,        -- Level of the weapon, typically 1-20 or similar\n" +
                    "    upgrade_cost INTEGER,           -- Cost to upgrade the weapon\n" +
                    "    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- When the weapon was added\n" +
                    ");\n";

            final String FILL_TABLE = "INSERT INTO weapons (name, type, rarity, attack_power, element, crit_rate, crit_damage, effect_description, level, upgrade_cost)\n" +
                    "SELECT\n" +
                    "    CONCAT(\n" +
                    "        CASE WHEN random() < 0.5 THEN 'Flame' ELSE 'Aqua' END,\n" +
                    "        CASE WHEN random() < 0.5 THEN ' Edge' ELSE ' Strike' END,\n" +
                    "        CAST(generate_series(1, 10000) AS VARCHAR)  -- Ensures unique name\n" +
                    "    ),\n" +
                    "    (ARRAY['Sword', 'Bow', 'Staff', 'Axe', 'Dagger', 'Spear'])[floor(random() * 6 + 1)::int],\n" +
                    "    floor(random() * 5 + 1)::int,                   -- Rarity from 1 to 5\n" +
                    "    floor(random() * 500 + 300)::int,               -- Attack power between 300 and 800\n" +
                    "    (ARRAY['Fire', 'Water', 'Wind', 'Earth', 'Lightning', 'Dark', 'Holy'])[floor(random() * 7 + 1)::int],\n" +
                    "    round(random() * 0.2, 2),                       -- Crit rate from 0.00 to 0.20\n" +
                    "    round(1.2 + random() * 0.8, 2),                 -- Crit damage multiplier between 1.2 and 2.0\n" +
                    "    (ARRAY[\n" +
                    "        'Increases damage by 10%',\n" +
                    "        'Reduces damage taken by 5%',\n" +
                    "        'Chance to stun the enemy',\n" +
                    "        'Regenerates health over time',\n" +
                    "        'Increases attack speed by 10%',\n" +
                    "        'Boosts elemental damage by 15%',\n" +
                    "        'Deals area damage on crit'\n" +
                    "    ])[floor(random() * 7 + 1)::int],\n" +
                    "    1,                                              -- Starting level\n" +
                    "    floor(random() * 2000 + 500)::int               -- Upgrade cost between 500 and 2500\n" +
                    "FROM 1\n";
        }

}
