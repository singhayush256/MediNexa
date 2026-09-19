import { Injectable } from '@nestjs/common';
import { HealthCategory } from '@prisma/client';

export interface VitalsInput {
  heartRate?: number | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  spo2?: number | null;
  temperature?: number | null;
  bloodSugar?: number | null;
  bmi?: number | null;
  respiratoryRate?: number | null;
}

export interface AdherenceInput {
  takenDoses: number;
  missedDoses: number;
}

export interface ClinicalFactorsInput {
  isAdmitted?: boolean;
  hasRecentEmergency?: boolean;
  isHighRiskDoctorMarked?: boolean;
  chronicConditionsCount?: number;
  activeChronicConditions?: string[];
  sleepHours?: number | null;
  stepsCount?: number | null;
  doctorAssessmentNotes?: string;
  recentHospitalizationDays?: number;
}

export interface CalculationResult {
  overallScore: number;
  category: HealthCategory;
  categoryLabel: string;
  colorCode: string;
  tier: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  heartHealthScore: number;
  respiratoryScore: number;
  diabetesScore: number;
  activityScore: number;
  medicationScore: number;
  recoveryScore: number;
  mentalWellnessScore: number;
  vitalsSnapshot: VitalsInput;
  summaryNotes: string;
}

@Injectable()
export class HealthScoreCalculatorService {
  /**
   * Evaluates patient health telemetry and returns weighted sub-scores and overall score (0-100)
   */
  calculateScore(
    vitals: VitalsInput,
    adherence: AdherenceInput,
    clinicalFactors: ClinicalFactorsInput = {},
    prevScore?: number,
  ): CalculationResult {
    // 1. Cardiovascular / Heart Health Score (Weight: 25%)
    let heartScore = 90;
    const hr = vitals.heartRate || 74;
    if (hr >= 60 && hr <= 85) {
      heartScore = 95;
    } else if (hr > 85 && hr <= 100) {
      heartScore = 82;
    } else if (hr > 100 && hr <= 120) {
      heartScore = 60;
    } else if (hr > 120 || hr < 50) {
      heartScore = 30;
    }

    const sys = vitals.systolicBp || 120;
    const dia = vitals.diastolicBp || 80;
    if (sys <= 120 && dia <= 80) {
      heartScore = (heartScore + 95) / 2;
    } else if (sys <= 130 && dia <= 85) {
      heartScore = (heartScore + 85) / 2;
    } else if (sys <= 145 || dia <= 95) {
      heartScore = (heartScore + 65) / 2;
    } else {
      heartScore = (heartScore + 35) / 2;
    }

    // 2. Respiratory Score (Weight: 25%)
    let respScore = 92;
    const spo2 = vitals.spo2 || 98;
    if (spo2 >= 96) {
      respScore = 98;
    } else if (spo2 >= 94) {
      respScore = 84;
    } else if (spo2 >= 90) {
      respScore = 58;
    } else if (spo2 >= 85) {
      respScore = 30;
    } else {
      respScore = 15;
    }

    const rr = vitals.respiratoryRate || 16;
    if (rr >= 12 && rr <= 20) {
      respScore = (respScore + 95) / 2;
    } else if (rr > 20 && rr <= 26) {
      respScore = (respScore + 65) / 2;
    } else {
      respScore = (respScore + 40) / 2;
    }

    // 3. Metabolic / Diabetes & Vitals Score (Weight: 15%)
    let metabScore = 88;
    const bs = vitals.bloodSugar || 95;
    if (bs >= 70 && bs <= 110) {
      metabScore = 95;
    } else if (bs > 110 && bs <= 140) {
      metabScore = 80;
    } else if (bs > 140 && bs <= 180) {
      metabScore = 62;
    } else if (bs > 180 || bs < 60) {
      metabScore = 35;
    }

    const bmi = vitals.bmi || 22.5;
    if (bmi >= 18.5 && bmi <= 24.9) {
      metabScore = (metabScore + 95) / 2;
    } else if (bmi >= 25 && bmi <= 29.9) {
      metabScore = (metabScore + 80) / 2;
    } else {
      metabScore = (metabScore + 60) / 2;
    }

    // 4. Medication Adherence Score (Weight: 15%)
    let medScore = 90;
    const totalScheduled = adherence.takenDoses + adherence.missedDoses;
    if (totalScheduled > 0) {
      const adherenceRate = adherence.takenDoses / totalScheduled;
      if (adherenceRate >= 0.95) medScore = 98;
      else if (adherenceRate >= 0.85) medScore = 88;
      else if (adherenceRate >= 0.7) medScore = 68;
      else medScore = Math.max(25, Math.round(adherenceRate * 100));
    }

    // 5. Activity & Lifestyle Score (Weight: 10%)
    const activityScore = 82;

    // 6. Recovery Score (Weight: 5%)
    let recoveryScore = 88;
    if (clinicalFactors.isAdmitted) recoveryScore = 65;
    if (clinicalFactors.hasRecentEmergency) recoveryScore = Math.min(recoveryScore, 45);

    // 7. Mental Wellness & Stress Score (Weight: 5%)
    const mentalScore = 84;

    // Critical Clinical Modifiers
    let clinicalPenalty = 0;
    if (clinicalFactors.isHighRiskDoctorMarked) clinicalPenalty += 15;
    if (clinicalFactors.chronicConditionsCount && clinicalFactors.chronicConditionsCount > 2) {
      clinicalPenalty += Math.min(12, clinicalFactors.chronicConditionsCount * 3);
    }

    // Weighted Overall Score Formula
    const rawOverall =
      heartScore * 0.25 +
      respScore * 0.25 +
      metabScore * 0.15 +
      medScore * 0.15 +
      activityScore * 0.1 +
      recoveryScore * 0.05 +
      mentalScore * 0.05 -
      clinicalPenalty;

    const overallScore = Math.min(100, Math.max(5, Math.round(rawOverall * 10) / 10));

    // Category Resolution
    const { category, categoryLabel, colorCode, tier } = this.resolveCategory(overallScore);

    let summaryNotes = 'Vitals stable. Medication adherence is on track.';
    if (overallScore < 40) {
      summaryNotes = 'Critical health metrics detected. Emergency Guardian threshold triggered.';
    } else if (overallScore < 60) {
      summaryNotes = 'Health parameters indicate elevated risk. Closer clinical monitoring advised.';
    } else if (overallScore < 80) {
      summaryNotes = 'Moderate telemetry values. Maintain prescribed medication schedules.';
    }

    return {
      overallScore,
      category,
      categoryLabel,
      colorCode,
      tier,
      heartHealthScore: Math.round(heartScore),
      respiratoryScore: Math.round(respScore),
      diabetesScore: Math.round(metabScore),
      activityScore: Math.round(activityScore),
      medicationScore: Math.round(medScore),
      recoveryScore: Math.round(recoveryScore),
      mentalWellnessScore: Math.round(mentalScore),
      vitalsSnapshot: {
        heartRate: hr,
        systolicBp: sys,
        diastolicBp: dia,
        spo2,
        temperature: vitals.temperature || 98.4,
        bloodSugar: bs,
        bmi,
        respiratoryRate: rr,
      },
      summaryNotes,
    };
  }

  resolveCategory(score: number): {
    category: HealthCategory;
    categoryLabel: string;
    colorCode: string;
    tier: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  } {
    if (score >= 90) {
      return { category: HealthCategory.EXCELLENT, categoryLabel: 'Excellent', colorCode: '#10b981', tier: 'GREEN' };
    }
    if (score >= 80) {
      return { category: HealthCategory.HEALTHY, categoryLabel: 'Healthy', colorCode: '#059669', tier: 'GREEN' };
    }
    if (score >= 60) {
      return { category: HealthCategory.MONITOR, categoryLabel: 'Moderate Risk', colorCode: '#eab308', tier: 'YELLOW' };
    }
    if (score >= 40) {
      return { category: HealthCategory.WARNING, categoryLabel: 'High Risk', colorCode: '#f97316', tier: 'ORANGE' };
    }
    if (score >= 20) {
      return { category: HealthCategory.HIGH_RISK, categoryLabel: 'Critical', colorCode: '#ef4444', tier: 'RED' };
    }
    return { category: HealthCategory.CRITICAL, categoryLabel: 'Critical Emergency', colorCode: '#991b1b', tier: 'RED' };
  }
}
