import { calculateTriageScore } from './triageEngine';

const CONDITIONS = [
  { name: 'Chest Pain', symptoms: { chest_pain: true, breathing_difficulty: true }, baseProb: 0.15 },
  { name: 'Accident Trauma', symptoms: { severe_bleeding: true, breathing_difficulty: false }, baseProb: 0.10 },
  { name: 'Stroke', symptoms: { breathing_difficulty: true, severe_bleeding: false }, baseProb: 0.05 },
  { name: 'Fever', symptoms: { fever: true }, baseProb: 0.40 },
  { name: 'Minor Injury', symptoms: { }, baseProb: 0.30 }
];

export function generatePatients(durationHours, arrivalRatePerHour, scenario) {
  const totalMinutes = durationHours * 60;
  
  let activeRate = arrivalRatePerHour;
  if (scenario === 'Mass Casualty') {
    activeRate = arrivalRatePerHour * 3; 
  }

  const probPerMinute = activeRate / 60;
  let patients = [];
  let patientCounter = 1;

  for (let minute = 0; minute < totalMinutes; minute++) {
    if (Math.random() < probPerMinute) {
      
      let conditionPool = CONDITIONS;
      if (scenario === 'Mass Casualty' && minute < 120) { 
        conditionPool = [
           { name: 'Accident Trauma', symptoms: { severe_bleeding: true, breathing_difficulty: true }, baseProb: 0.8 },
           { name: 'Minor Injury', symptoms: { }, baseProb: 0.2 }
        ];
      }

      let rand = Math.random();
      let selectedCondition = conditionPool[conditionPool.length - 1];
      let cumulative = 0;
      for (let cond of conditionPool) {
        cumulative += cond.baseProb;
        if (rand < cumulative) {
          selectedCondition = cond;
          break;
        }
      }

      const id = `P${String(patientCounter).padStart(3, '0')}`;
      patientCounter++;

      const severity = calculateTriageScore(selectedCondition.symptoms);
      
      // format arrival time as HH:MM e.g., 10:05
      const hour = Math.floor(minute / 60) + 8; // start at 8 AM
      const mins = minute % 60;
      const timeStr = `${String(hour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

      patients.push({
        id,
        condition: selectedCondition.name,
        symptoms: selectedCondition.symptoms,
        arrivalTime: minute, // numerical for math
        displayTime: timeStr,
        severityScore: severity.score,
        severityCategory: severity.category,
        severityLevel: severity.level,
      });
    }
  }

  return patients;
}
