const db = require('./db');

let intervalId = null;

const startTelemetrySimulation = () => {
  if (intervalId) return;

  console.log('Telemetry simulation started...');

  intervalId = setInterval(() => {
    const equipmentList = db.getEquipment();

    // Select 3 to 5 active machines to update
    const activeMachines = equipmentList.filter(e => e.status === 'Active');
    if (activeMachines.length === 0) return;

    const numToUpdate = Math.min(activeMachines.length, Math.floor(Math.random() * 3) + 2);
    const indicesToUpdate = new Set();
    while (indicesToUpdate.size < numToUpdate) {
      const idx = Math.floor(Math.random() * activeMachines.length);
      indicesToUpdate.add(idx);
    }

    indicesToUpdate.forEach(idx => {
      const machine = activeMachines[idx];
      
      // 1. Simulate Fuel Burn
      // Burn fuel slowly: 0.1% - 0.4% per tick
      const fuelBurn = parseFloat((Math.random() * 0.3 + 0.1).toFixed(2));
      machine.fuelLevel = Math.max(0, parseFloat((machine.fuelLevel - fuelBurn).toFixed(1)));
      if (machine.fuelLevel <= 5) {
        machine.fuelLevel = 100; // Simulated refuel!
      }

      // 2. Simulate Hours Accumulation
      // Depending on their utilization profile, add to engine hours or idle hours
      // We will look at their current engineHoursPerDay / idleHoursPerDay ratio
      const totalHours = machine.engineHoursPerDay + machine.idleHoursPerDay;
      const utilizationRatio = totalHours > 0 ? machine.engineHoursPerDay / totalHours : 0.5;

      const increment = 0.05; // 3 minutes of work simulated per tick
      if (Math.random() < utilizationRatio) {
        machine.engineHoursPerDay = parseFloat((machine.engineHoursPerDay + increment).toFixed(2));
      } else {
        machine.idleHoursPerDay = parseFloat((machine.idleHoursPerDay + increment).toFixed(2));
      }

      // 3. Simulate GPS Drift (work site movement)
      // Drift slightly: around 0.0001 to 0.0003 degrees (~10-30 meters)
      if (machine.location) {
        const latDrift = (Math.random() - 0.5) * 0.0004;
        const lngDrift = (Math.random() - 0.5) * 0.0004;
        machine.location.latitude = parseFloat((machine.location.latitude + latDrift).toFixed(6));
        machine.location.longitude = parseFloat((machine.location.longitude + lngDrift).toFixed(6));
      }

      // 4. Set dynamic lastUpdated timestamp
      machine.lastUpdated = new Date().toISOString();

      db.saveEquipment(machine);
    });

  }, 3000); // every 3 seconds
};

const stopTelemetrySimulation = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Telemetry simulation stopped.');
  }
};

module.exports = {
  startTelemetrySimulation,
  stopTelemetrySimulation
};
