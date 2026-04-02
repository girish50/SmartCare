export function calculateTriageScore(symptoms) {
  let score = 0;

  if (symptoms.chest_pain) score += 3;
  if (symptoms.breathing_difficulty) score += 2;
  if (symptoms.severe_bleeding) score += 3;
  if (symptoms.fever) score += 1;

  // Add random variance sometimes to simulate realistic edge cases
  if (Math.random() > 0.8) {
     score += 1;
  }

  let category = 'Minor';
  let level = 1;

  if (score >= 5) {
    category = 'Critical';
    level = 5;
  } else if (score === 4) {
    category = 'Severe';
    level = 4;
  } else if (score === 3) {
    category = 'Moderate';
    level = 3;
  } else if (score === 2) {
    category = 'Mild';
    level = 2;
  } else {
    category = 'Minor';
    level = 1;
  }

  return {
    score,
    category,
    level
  };
}
