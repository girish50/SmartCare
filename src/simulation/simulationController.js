import { generatePatients } from './patientGenerator';
import { runAllocationSimulation } from './allocationEngine';

export function runMonteCarloSim(config) {
   // config: { durationHours, arrivalRate, scenario, doctors, icuBeds, ventilators, erRooms }
   
   const patients = generatePatients(config.durationHours, config.arrivalRate, config.scenario);
   
   const results = runAllocationSimulation(patients, {
     doctors: config.doctors,
     icuBeds: config.icuBeds,
     ventilators: config.ventilators,
     erRooms: config.erRooms
   }, config.durationHours * 60);

   // Aggregate severity distribution for the pie chart
   let severityMap = {
     Critical: 0,
     Severe: 0,
     Moderate: 0,
     Mild: 0,
     Minor: 0
   };

   let conditionMap = {};

   patients.forEach(p => {
     severityMap[p.severityCategory] = (severityMap[p.severityCategory] || 0) + 1;
     conditionMap[p.condition] = (conditionMap[p.condition] || 0) + 1;
   });

   // Format maps for Recharts
   const severityData = Object.keys(severityMap).map(k => ({
     name: k,
     value: severityMap[k]
   }));

   const conditionData = Object.keys(conditionMap).map(k => ({
     name: k,
     value: conditionMap[k]
   }));

   // Generate AI Insights
   let insights = [];
   
   if (results.shortages.icu > 0) {
     insights.push(`Critical ICU Shortage: ${results.shortages.icu} patients waited for intensive care. Recommendation: Add at least ${Math.ceil(results.shortages.icu / 5)} more ICU Beds.`);
   }
   if (results.shortages.ventilator > 0) {
     insights.push(`Ventilator Capacity Reached: ${results.shortages.ventilator} patients needed a ventilator. Recommendation: Acquire ${Math.ceil(results.shortages.ventilator / 2)} more ventilators.`);
   }
   if (results.shortages.doctor > Object.keys(patients).length * 0.2) {
      insights.push(`Doctor Strain: Over 20% of cases delayed by physician availability. Recommend calling in ${Math.ceil(config.doctors * 0.3)} on-call doctors.`);
   } else if (results.avgWaitTime > 30) {
      insights.push(`High Average Wait (${results.avgWaitTime} mins). Recommend opening temporary triage ward to screen Mild/Minor cases faster.`);
   }
   
   if (insights.length === 0) {
     insights.push("ER operating at optimal efficiency. Resources are sufficient for this scenario.");
   }

   return {
     patientsGenerated: patients.length,
     criticalCases: severityMap.Critical + severityMap.Severe,
     patients: results.patientFlow,
     avgWaitTime: results.avgWaitTime,
     maxWaitTime: results.maxWaitTime,
     usageLogs: results.usageLogs,
     severityData,
     conditionData,
     shortages: results.shortages,
     insights
   };
}
