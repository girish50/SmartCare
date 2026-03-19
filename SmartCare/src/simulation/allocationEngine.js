export function runAllocationSimulation(patients, resources, totalMinutes) {
  const sortedPatients = [...patients].sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  let doctorsBusyUntil = Array(resources.doctors).fill(0);
  let icuBedsBusyUntil = Array(resources.icuBeds).fill(0);
  let ventilatorsBusyUntil = Array(resources.ventilators).fill(0);
  let erRoomsBusyUntil = Array(resources.erRooms).fill(0);

  let waitTimes = [];
  let usageLogs = [];
  let shortages = {
    icu: 0,
    ventilator: 0,
    doctor: 0,
    erRoom: 0
  };

  let patientFlow = [];
  let queue = [];
  let patientIndex = 0;

  for (let currentMinute = 0; currentMinute <= totalMinutes; currentMinute++) {
    
    // arrivals
    while(patientIndex < sortedPatients.length && sortedPatients[patientIndex].arrivalTime === currentMinute) {
      queue.push({...sortedPatients[patientIndex], waitStart: currentMinute});
      patientIndex++;
    }

    // sort queue: severity first, then longest wait time
    queue.sort((a, b) => {
      if (b.severityLevel !== a.severityLevel) {
        return b.severityLevel - a.severityLevel;
      }
      return a.waitStart - b.waitStart;
    });

    let remainingQueue = [];
    for (let p of queue) {
      let allocated = false;
      
      const needsICU = p.severityLevel >= 4;
      const needsVentilator = p.symptoms.breathing_difficulty && p.severityLevel >= 4;
      
      let availableDocIdx = doctorsBusyUntil.findIndex(time => time <= currentMinute);
      
      if (needsICU) {
        let availableIcuIdx = icuBedsBusyUntil.findIndex(time => time <= currentMinute);
        if (availableIcuIdx !== -1 && availableDocIdx !== -1) {
          let assignVent = false;
          let availableVentIdx = -1;
          if (needsVentilator) {
             availableVentIdx = ventilatorsBusyUntil.findIndex(time => time <= currentMinute);
             if (availableVentIdx !== -1) {
               assignVent = true;
             } else {
               shortages.ventilator++;
             }
          }

          if (!needsVentilator || assignVent) {
            const duration = Math.floor(Math.random() * 120) + 60; // 1-3 hours
            icuBedsBusyUntil[availableIcuIdx] = currentMinute + duration;
            doctorsBusyUntil[availableDocIdx] = currentMinute + (duration / 2); 
            if (assignVent) ventilatorsBusyUntil[availableVentIdx] = currentMinute + duration;
            
            allocated = true;
            patientFlow.push({...p, waitEnd: currentMinute, waitTime: currentMinute - p.waitStart, treatedIn: 'ICU/Vent'});
            waitTimes.push(currentMinute - p.waitStart);
          } else {
            shortages.icu++; 
          }
        } else {
          shortages.icu++; 
        }
      } else {
        // Normal ER Room
        let availableErIdx = erRoomsBusyUntil.findIndex(time => time <= currentMinute);
        if (availableErIdx !== -1 && availableDocIdx !== -1) {
          const duration = Math.floor(Math.random() * 45) + 15; // 15-60 mins
          erRoomsBusyUntil[availableErIdx] = currentMinute + duration;
          doctorsBusyUntil[availableDocIdx] = currentMinute + duration;
          allocated = true;
          patientFlow.push({...p, waitEnd: currentMinute, waitTime: currentMinute - p.waitStart, treatedIn: 'ER Room'});
          waitTimes.push(currentMinute - p.waitStart);
        } else {
           if (availableDocIdx === -1) shortages.doctor++;
           if (availableErIdx === -1) shortages.erRoom++;
        }
      }

      if (!allocated) {
        remainingQueue.push(p);
      }
    }

    queue = remainingQueue;

    // Log util every 30 mins for the charts
    if (currentMinute % 30 === 0 && currentMinute > 0) {
      // Use display time
      const hour = Math.floor(currentMinute / 60) + 8;
      const mins = currentMinute % 60;
      const timeStr = `${String(hour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

      let docsBusy = doctorsBusyUntil.filter(t => t > currentMinute).length;
      let icuBusy = icuBedsBusyUntil.filter(t => t > currentMinute).length;
      let ventsBusy = ventilatorsBusyUntil.filter(t => t > currentMinute).length;
      
      usageLogs.push({
        time: timeStr,
        minute: currentMinute, // raw min
        doctors: resources.doctors > 0 ? Math.round((docsBusy / resources.doctors) * 100) : 0,
        icuBeds: resources.icuBeds > 0 ? Math.round((icuBusy / resources.icuBeds) * 100) : 0,
        ventilators: resources.ventilators > 0 ? Math.round((ventsBusy / resources.ventilators) * 100) : 0,
        patientLoad: patientFlow.filter(p => p.arrivalTime <= currentMinute && p.waitEnd >= currentMinute).length + queue.length,
        queueLength: queue.length
      });
    }
  }

  // Those still in queue at end of sim
  for (let p of queue) {
    patientFlow.push({...p, waitEnd: totalMinutes, waitTime: totalMinutes - p.waitStart, treatedIn: 'None'});
    waitTimes.push(totalMinutes - p.waitStart);
  }

  const avgWaitTime = waitTimes.length > 0 ? waitTimes.reduce((a,b)=>a+b, 0) / waitTimes.length : 0;
  const maxWaitTime = waitTimes.length > 0 ? Math.max(...waitTimes) : 0;

  return {
    patientFlow: patientFlow.sort((a,b) => a.arrivalTime - b.arrivalTime),
    avgWaitTime: Math.round(avgWaitTime),
    maxWaitTime,
    usageLogs,
    shortages
  };
}
