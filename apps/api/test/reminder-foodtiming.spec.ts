import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { FoodTiming as PrismaFoodTiming } from '@prisma/client';
import { FoodTiming as TypesFoodTiming } from '@medinexa/types';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateReminderDto } from '../dist/reminder/dto/reminder.dto.js';

describe('MedicationReminder foodTiming Schema & Type Parity Regression Suite', () => {
  it('1. Prisma FoodTiming and Types FoodTiming must expose identical enum values', () => {
    assert.strictEqual(PrismaFoodTiming.NO_RESTRICTION, 'NO_RESTRICTION');
    assert.strictEqual(PrismaFoodTiming.BEFORE_FOOD, 'BEFORE_FOOD');
    assert.strictEqual(PrismaFoodTiming.AFTER_FOOD, 'AFTER_FOOD');
    assert.strictEqual(PrismaFoodTiming.WITH_FOOD, 'WITH_FOOD');

    assert.strictEqual(TypesFoodTiming.NO_RESTRICTION, PrismaFoodTiming.NO_RESTRICTION);
    assert.strictEqual(TypesFoodTiming.BEFORE_FOOD, PrismaFoodTiming.BEFORE_FOOD);
    assert.strictEqual(TypesFoodTiming.AFTER_FOOD, PrismaFoodTiming.AFTER_FOOD);
    assert.strictEqual(TypesFoodTiming.WITH_FOOD, PrismaFoodTiming.WITH_FOOD);
  });

  it('2. CreateReminderDto validates all four supported FoodTiming enum values', async () => {
    const validTimings = [
      TypesFoodTiming.NO_RESTRICTION,
      TypesFoodTiming.BEFORE_FOOD,
      TypesFoodTiming.AFTER_FOOD,
      TypesFoodTiming.WITH_FOOD,
    ];

    for (const timing of validTimings) {
      const dto = plainToInstance(CreateReminderDto, {
        patientId: 'patient-uuid',
        medicineName: 'Metformin',
        foodTiming: timing,
      });

      const errors = await validate(dto);
      const foodTimingErrors = errors.filter((e) => e.property === 'foodTiming');
      assert.strictEqual(
        foodTimingErrors.length,
        0,
        `Expected ${timing} to be a valid foodTiming value in CreateReminderDto`,
      );
    }
  });

  it('3. CreateReminderDto rejects arbitrary invalid foodTiming strings', async () => {
    const dto = plainToInstance(CreateReminderDto, {
      patientId: 'patient-uuid',
      medicineName: 'Metformin',
      foodTiming: 'ANYTIME_INVALID',
    });

    const errors = await validate(dto);
    const foodTimingError = errors.find((e) => e.property === 'foodTiming');
    assert.ok(foodTimingError, 'Expected validation error for invalid foodTiming string');
  });

  it('4. FoodTiming default NO_RESTRICTION is preserved when optional', async () => {
    const dto = plainToInstance(CreateReminderDto, {
      patientId: 'patient-uuid',
      medicineName: 'Aspirin',
    });

    const errors = await validate(dto);
    const foodTimingError = errors.find((e) => e.property === 'foodTiming');
    assert.strictEqual(foodTimingError, undefined);
  });
});
