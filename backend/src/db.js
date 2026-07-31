const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

// Default Seed Data
const getSeedData = () => {
  const equipment = [];
  const sites = [
    { id: 'S001', name: 'Metro Line Extension (North)', location: { latitude: 13.0850, longitude: 80.2720 } },
    { id: 'S002', name: 'Downtown Commercial Center', location: { latitude: 13.0400, longitude: 80.2500 } },
    { id: 'S003', name: 'Harbor Expansion Dock 4', location: { latitude: 13.1200, longitude: 80.3000 } },
    { id: 'S004', name: 'Highway Bypass Section B', location: { latitude: 12.9800, longitude: 80.1800 } },
    { id: 'S005', name: 'Industrial Park Development', location: { latitude: 13.0200, longitude: 80.1200 } }
  ];

  const operators = [
    { id: 'OP101', name: 'John Doe', certification: 'Excavator Level 2' },
    { id: 'OP102', name: 'Sarah Connor', certification: 'Crane Master' },
    { id: 'OP103', name: 'Mike Ross', certification: 'Bulldozer Specialist' },
    { id: 'OP104', name: 'Elena Rostova', certification: 'General Heavy Equipment' },
    { id: 'OP203', name: 'Alex Carter', certification: 'Bulldozer Specialist' },
    { id: 'OP105', name: 'David Smith', certification: 'Excavator Level 1' },
    { id: 'OP106', name: 'James Johnson', certification: 'Grader Specialist' },
    { id: 'OP107', name: 'Robert Williams', certification: 'Crane Master' },
    { id: 'OP108', name: 'Michael Brown', certification: 'Bulldozer Specialist' },
    { id: 'OP109', name: 'William Jones', certification: 'Excavator Level 2' }
  ];

  // Specific machines required by user
  const specialEquipment = [
    {
      equipmentId: 'EQX1001',
      name: 'Cat 320 Excavator',
      type: 'Excavator',
      siteId: 'S003',
      operatorId: 'OP101',
      checkInDate: '2026-07-15',
      checkOutDate: '2026-07-31', // Near expiration (today is July 30)
      engineHoursPerDay: 1.5,
      idleHoursPerDay: 10,
      fuelLevel: 68,
      location: { latitude: 13.0827, longitude: 80.2707 },
      status: 'Active'
    },
    {
      equipmentId: 'EQX1002',
      name: 'Cat M315 Crane',
      type: 'Crane',
      siteId: null,
      operatorId: null,
      checkInDate: null,
      checkOutDate: null,
      engineHoursPerDay: 0,
      idleHoursPerDay: 11,
      fuelLevel: 45,
      location: { latitude: 13.0700, longitude: 80.2300 },
      status: 'Unassigned'
    },
    {
      equipmentId: 'EQX1003',
      name: 'Cat D6 Bulldozer',
      type: 'Bulldozer',
      siteId: 'S002',
      operatorId: 'OP203',
      checkInDate: '2026-07-10',
      checkOutDate: '2026-08-15',
      engineHoursPerDay: 7.5,
      idleHoursPerDay: 0.5,
      fuelLevel: 92,
      location: { latitude: 13.0420, longitude: 80.2480 },
      status: 'Active'
    },
    {
      equipmentId: 'EQX1004',
      name: 'Cat 336 Excavator',
      type: 'Excavator',
      siteId: 'S004',
      operatorId: 'OP104',
      checkInDate: '2026-07-20',
      checkOutDate: '2026-08-05',
      engineHoursPerDay: 1.8,
      idleHoursPerDay: 9.8,
      fuelLevel: 55,
      location: { latitude: 12.9820, longitude: 80.1780 },
      status: 'Active'
    },
    {
      equipmentId: 'EQX1006',
      name: 'Cat 120 Grader',
      type: 'Grader',
      siteId: 'S001',
      operatorId: 'OP103',
      checkInDate: '2026-07-01',
      checkOutDate: '2026-07-28', // Overdue by 2 days (today is July 30)
      engineHoursPerDay: 4.5,
      idleHoursPerDay: 3.5,
      fuelLevel: 38,
      location: { latitude: 13.0860, longitude: 80.2710 },
      status: 'Active'
    },
    {
      equipmentId: 'EQX1007',
      name: 'Cat D8 Bulldozer',
      type: 'Bulldozer',
      siteId: null,
      operatorId: null,
      checkInDate: null,
      checkOutDate: null,
      engineHoursPerDay: 0,
      idleHoursPerDay: 12,
      fuelLevel: 10,
      location: { latitude: 13.0500, longitude: 80.2100 },
      status: 'Unassigned'
    }
  ];

  // Add special equipment first
  equipment.push(...specialEquipment);

  // Generate remaining up to 47 equipment
  const types = ['Excavator', 'Bulldozer', 'Crane', 'Grader'];
  const prefixes = { Excavator: 'EQX', Bulldozer: 'EQB', Crane: 'EQC', Grader: 'EQG' };
  const names = {
    Excavator: ['Cat 320', 'Cat 336', 'Cat 308 Mini'],
    Bulldozer: ['Cat D6', 'Cat D8', 'Cat D5'],
    Crane: ['Cat M315', 'Cat M320'],
    Grader: ['Cat 120', 'Cat 140']
  };

  let idCounter = 1008;
  let operatorCounter = 300;
  const firstNames = ['David', 'James', 'Robert', 'Michael', 'William', 'Thomas', 'Richard', 'Joseph', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Gary', 'Ryan', 'Nicholas', 'Eric', 'Stephen', 'Jacob', 'Larry', 'Jonathan'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young', 'Allen', 'Sanchez', 'Wright', 'King'];

  while (equipment.length < 47) {
    const type = types[Math.floor(Math.random() * types.length)];
    const id = `${prefixes[type]}${idCounter++}`;
    const nameList = names[type];
    const name = nameList[Math.floor(Math.random() * nameList.length)];

    // Determine rental status (approx 70% active, 20% unassigned, 10% overdue/maintenance)
    const rand = Math.random();
    let status = 'Active';
    let siteId = null;
    let operatorId = null;
    let checkInDate = null;
    let checkOutDate = null;
    let engineHoursPerDay = 0;
    let idleHoursPerDay = 0;
    let fuelLevel = Math.floor(Math.random() * 60) + 30; // 30% - 90%
    let lat = 13.0500;
    let lng = 80.2100;

    if (rand < 0.7) {
      status = 'Active';
      siteId = sites[Math.floor(Math.random() * sites.length)].id;
      
      const site = sites.find(s => s.id === siteId);
      lat = site.location.latitude + (Math.random() - 0.5) * 0.008;
      lng = site.location.longitude + (Math.random() - 0.5) * 0.008;

      // Assign one of the 10 seeded operators
      operatorId = operators[Math.floor(Math.random() * operators.length)].id;

      checkInDate = '2026-07-20';
      checkOutDate = `2026-08-${Math.floor(Math.random() * 20) + 10}`;
      engineHoursPerDay = parseFloat((Math.random() * 6 + 2).toFixed(1)); // 2 - 8 hrs
      idleHoursPerDay = parseFloat((Math.random() * 4 + 1).toFixed(1)); // 1 - 5 hrs
    } else if (rand < 0.9) {
      status = 'Unassigned';
      engineHoursPerDay = 0;
      idleHoursPerDay = parseFloat((Math.random() * 2).toFixed(1)); // low idle when unassigned
      fuelLevel = Math.floor(Math.random() * 40) + 10;
      lat = 13.0500 + (Math.random() - 0.5) * 0.008;
      lng = 80.2100 + (Math.random() - 0.5) * 0.008;
    } else {
      // Overdue or maintenance
      status = 'Active';
      siteId = sites[Math.floor(Math.random() * sites.length)].id;

      const site = sites.find(s => s.id === siteId);
      lat = site.location.latitude + (Math.random() - 0.5) * 0.008;
      lng = site.location.longitude + (Math.random() - 0.5) * 0.008;
      
      // Assign one of the 10 seeded operators
      operatorId = operators[Math.floor(Math.random() * operators.length)].id;

      checkInDate = '2026-07-01';
      checkOutDate = `2026-07-${Math.floor(Math.random() * 5) + 20}`; // due before July 30
      engineHoursPerDay = parseFloat((Math.random() * 4 + 1).toFixed(1));
      idleHoursPerDay = parseFloat((Math.random() * 6 + 2).toFixed(1));
    }

    equipment.push({
      equipmentId: id,
      name: `${name} General`,
      type,
      siteId,
      operatorId,
      checkInDate,
      checkOutDate,
      engineHoursPerDay,
      idleHoursPerDay,
      fuelLevel,
      location: { latitude: lat, longitude: lng },
      status
    });
  }

  // Double check that we have exactly 4 overdue assets
  // Overdue assets are active and checkOutDate < '2026-07-30'
  // EQX1006 is one. Let's make sure 3 more are explicitly marked as overdue
  let overdueCount = equipment.filter(e => e.checkOutDate && e.checkOutDate < '2026-07-30').length;
  if (overdueCount < 4) {
    let needed = 4 - overdueCount;
    for (let e of equipment) {
      if (needed <= 0) break;
      if (e.equipmentId !== 'EQX1001' && e.equipmentId !== 'EQX1003' && e.equipmentId !== 'EQX1004' && e.equipmentId !== 'EQX1006' && e.status === 'Active' && e.checkOutDate >= '2026-07-30') {
        e.checkOutDate = '2026-07-25'; // Make it overdue
        needed--;
      }
    }
  }

  // Prepopulate historical usage for analytics (last 30 days)
  const historicalUsage = [];
  const startDay = new Date('2026-07-01');
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDay);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    for (const type of types) {
      historicalUsage.push({
        date: dateStr,
        equipmentType: type,
        avgUtilization: Math.floor(Math.random() * 25) + (type === 'Bulldozer' ? 70 : type === 'Excavator' ? 60 : type === 'Grader' ? 50 : 40),
        activeRentals: Math.floor(Math.random() * 5) + (type === 'Bulldozer' ? 8 : type === 'Excavator' ? 10 : type === 'Grader' ? 4 : 3)
      });
    }
  }

  // Prepopulate demand forecasting historical data
  const demandHistory = [];
  // Generate 60 days of historical demand for model training
  const startHistDate = new Date('2026-06-01');
  for (let i = 0; i < 60; i++) {
    const d = new Date(startHistDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const month = d.getMonth() + 1;
    const dayOfWeek = d.getDay();

    for (const site of sites) {
      for (const type of types) {
        // Create realistic patterns (higher demand at S003 for Excavators, lower at S004)
        let baseDemand = 2;
        if (site.id === 'S003' && type === 'Excavator') baseDemand = 8;
        if (site.id === 'S001' && type === 'Excavator') baseDemand = 6;
        if (site.id === 'S004' && type === 'Excavator') baseDemand = 1;
        if (site.id === 'S002' && type === 'Bulldozer') baseDemand = 7;

        const noise = Math.floor(Math.random() * 3) - 1; // -1 to 1
        const rentals = Math.max(0, baseDemand + noise + (dayOfWeek === 0 || dayOfWeek === 6 ? -1 : 1));

        demandHistory.push({
          date: dateStr,
          month,
          dayOfWeek,
          siteId: site.id,
          equipmentType: type,
          rentals
        });
      }
    }
  }

  return {
    equipment,
    sites,
    operators,
    historicalUsage,
    demandHistory
  };
};

// Load Database
const loadDb = () => {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading db.json, generating new seed data', e);
    }
  }
  const seed = getSeedData();
  saveDb(seed);
  return seed;
};

// Save Database
const saveDb = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const db = loadDb();

module.exports = {
  getEquipment: () => db.equipment,
  getEquipmentById: (id) => db.equipment.find(e => e.equipmentId === id),
  saveEquipment: (updatedEquip) => {
    const idx = db.equipment.findIndex(e => e.equipmentId === updatedEquip.equipmentId);
    if (idx !== -1) {
      db.equipment[idx] = updatedEquip;
    } else {
      db.equipment.push(updatedEquip);
    }
    saveDb(db);
  },
  getSites: () => db.sites,
  getOperators: () => db.operators,
  getHistoricalUsage: () => db.historicalUsage,
  getDemandHistory: () => db.demandHistory,
  saveDb: () => saveDb(db)
};
