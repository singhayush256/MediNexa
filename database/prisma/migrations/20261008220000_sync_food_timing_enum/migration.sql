-- Ensure FoodTiming enum exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FoodTiming') THEN
        CREATE TYPE "FoodTiming" AS ENUM ('BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD', 'NO_RESTRICTION');
    END IF;
END $$;

-- Ensure medication_reminders.food_timing uses FoodTiming enum
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medication_reminders' 
          AND column_name = 'food_timing' 
          AND udt_name != 'FoodTiming'
    ) THEN
        ALTER TABLE "medication_reminders" ALTER COLUMN "food_timing" DROP DEFAULT;
        ALTER TABLE "medication_reminders" ALTER COLUMN "food_timing" TYPE "FoodTiming" USING (
            CASE 
                WHEN "food_timing"::text IN ('BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD', 'NO_RESTRICTION') THEN "food_timing"::"FoodTiming"
                ELSE 'NO_RESTRICTION'::"FoodTiming"
            END
        );
        ALTER TABLE "medication_reminders" ALTER COLUMN "food_timing" SET DEFAULT 'NO_RESTRICTION'::"FoodTiming";
    END IF;
END $$;
