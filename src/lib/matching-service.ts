import { MatrimonialProfile, CompatibilityBreakdown } from './types';

export class MatchingService {
  /**
   * Calculates a weighted compatibility score between a user's preferences / profile and a candidate profile.
   */
  static calculateCompatibility(
    userProfile: MatrimonialProfile,
    candidate: MatrimonialProfile,
    weights = {
      age: 0.15,
      location: 0.15,
      education: 0.15,
      profession: 0.15,
      lifestyle: 0.15,
      family: 0.15,
      religion: 0.10,
    }
  ): CompatibilityBreakdown {
    const prefs = userProfile.partnerPreferences;
    const matchReasons: string[] = [];
    const improvementTips: string[] = [];

    // 1. Age Score (15%)
    let ageScore = 50;
    if (prefs?.ageRange) {
      if (candidate.age >= prefs.ageRange.min && candidate.age <= prefs.ageRange.max) {
        ageScore = 100;
        matchReasons.push(`Age (${candidate.age}) aligns perfectly with your preference (${prefs.ageRange.min} - ${prefs.ageRange.max} yrs)`);
      } else {
        const diff = Math.min(
          Math.abs(candidate.age - prefs.ageRange.min),
          Math.abs(candidate.age - prefs.ageRange.max)
        );
        ageScore = Math.max(20, 100 - diff * 15);
      }
    } else {
      ageScore = 80;
    }

    // 2. Location Score (15%)
    let locationScore = 40;
    if (userProfile.city.toLowerCase() === candidate.city.toLowerCase()) {
      locationScore = 100;
      matchReasons.push(`Located in the same city (${candidate.city})`);
    } else if (userProfile.country.toLowerCase() === candidate.country.toLowerCase()) {
      locationScore = 80;
      matchReasons.push(`Located in the same country (${candidate.country})`);
    } else if (prefs?.preferredLocations?.some((loc) => loc.toLowerCase() === candidate.city.toLowerCase() || loc.toLowerCase() === candidate.country.toLowerCase())) {
      locationScore = 90;
      matchReasons.push(`Located in your preferred region (${candidate.city}, ${candidate.country})`);
    } else {
      locationScore = 50;
    }

    // 3. Education Score (15%)
    let educationScore = 60;
    const candEdu = candidate.educationCareer?.highestDegree?.toLowerCase() || '';
    if (prefs?.educationLevels?.some((lvl) => candEdu.includes(lvl.toLowerCase()))) {
      educationScore = 100;
      matchReasons.push(`Education level (${candidate.educationCareer?.highestDegree}) matches criteria`);
    } else if (candidate.educationCareer?.highestDegree) {
      educationScore = 80;
    }

    // 4. Profession Score (15%)
    let professionScore = 60;
    const candProf = candidate.educationCareer?.profession?.toLowerCase() || '';
    if (prefs?.professions?.some((p) => candProf.includes(p.toLowerCase()))) {
      professionScore = 100;
      matchReasons.push(`Career profile (${candidate.educationCareer?.profession}) matches preferences`);
    } else {
      professionScore = 75;
    }

    // 5. Lifestyle & Diet Score (15%)
    let lifestyleScore = 70;
    if (candidate.lifestyle?.diet && userProfile.lifestyle?.diet === candidate.lifestyle.diet) {
      lifestyleScore += 15;
      matchReasons.push(`Shared dietary values (${candidate.lifestyle.diet.replace('_', ' ')})`);
    }
    if (userProfile.lifestyle?.smoking === candidate.lifestyle?.smoking) {
      lifestyleScore += 15;
    }
    lifestyleScore = Math.min(100, lifestyleScore);

    // 6. Family Values Score (15%)
    let familyScore = 70;
    if (candidate.familyInfo?.familyValues && userProfile.familyInfo?.familyValues === candidate.familyInfo.familyValues) {
      familyScore = 95;
      matchReasons.push(`Similar ${candidate.familyInfo.familyValues.toLowerCase()} family values`);
    } else {
      familyScore = 65;
    }

    // 7. Religion & Community (10%)
    let maritalScore = 80;
    if (userProfile.religion === candidate.religion) {
      maritalScore = 100;
      matchReasons.push(`Shared religious background (${candidate.religion})`);
    } else if (prefs?.religions?.includes(candidate.religion)) {
      maritalScore = 90;
    } else {
      maritalScore = 40;
    }

    // Weighted calculation
    const overallScore = Math.round(
      ageScore * weights.age +
      locationScore * weights.location +
      educationScore * weights.education +
      professionScore * weights.profession +
      lifestyleScore * weights.lifestyle +
      familyScore * weights.family +
      maritalScore * weights.religion
    );

    if (matchReasons.length === 0) {
      matchReasons.push('Good overall profile alignment and family background');
    }

    return {
      overallScore: Math.min(99, Math.max(50, overallScore)),
      ageScore,
      locationScore,
      educationScore,
      professionScore,
      lifestyleScore,
      familyScore,
      maritalScore,
      matchReasons,
      improvementTips,
    };
  }
}
