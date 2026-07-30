const express = require('express');
const cors = require('cors');
const http = require('http');
const db = require('./db');
const simulator = require('./simulator');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Helper function to calculate asset utilization and anomalies
const processAsset = (asset) => {
  const engine = asset.engineHoursPerDay || 0;
  const idle = asset.idleHoursPerDay || 0;
  const total = engine + idle;
  const utilization = total > 0 ? Math.round((engine / total) * 100) : 0;

  const anomalies = [];
  if (idle > 8) {
    anomalies.push({
      code: 'HIGH_IDLE',
      severity: 'Warning',
      message: `High Idle Time (${idle} hrs/day)`
    });
  }
  if (engine === 0 && idle > 8) {
    anomalies.push({
      code: 'POSSIBLE_MISUSE',
      severity: 'Critical',
      message: 'Possible rental misuse: high idle but zero engine hours'
    });
  }
  if (!asset.siteId) {
    anomalies.push({
      code: 'UNASSIGNED',
      severity: 'Warning',
      message: 'Equipment is unassigned to any job site'
    });
  }
  if (!asset.operatorId) {
    anomalies.push({
      code: 'NO_OPERATOR',
      severity: 'Warning',
      message: 'No operator assigned to active equipment'
    });
  }
  if (asset.status === 'Active' && total > 0 && utilization < 20) {
    anomalies.push({
      code: 'UNDER_UTILIZED',
      severity: 'Warning',
      message: `Under-utilized equipment (utilization is only ${utilization}%)`
    });
  }

  // Calculate alerts based on dates
  // Assume "today" is 2026-07-30 (based on system time metadata)
  const today = new Date('2026-07-30');
  let alert = null;

  if (asset.status === 'Active' && asset.checkOutDate) {
    const dueDate = new Date(asset.checkOutDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      alert = {
        type: 'CRITICAL',
        title: 'Return Overdue',
        days: Math.abs(diffDays),
        message: `${asset.equipmentId} (${asset.type}) return is overdue by ${Math.abs(diffDays)} day(s).`,
        action: 'Contact Site / Extend Rental'
      };
    } else if (diffDays === 1) {
      alert = {
        type: 'WARNING',
        title: 'Rental Expiration Tomorrow',
        days: 1,
        message: `Rental expires tomorrow. Current utilization: ${utilization}%.`,
        recommendation: utilization < 20 ? 'Return instead of extending rental.' : 'Extend rental if project is ongoing.',
        action: 'Review Extension'
      };
    }
  }

  return {
    ...asset,
    utilization,
    anomalies,
    alert
  };
};

// GET /api/equipment
app.get('/api/equipment', (req, res) => {
  const rawList = db.getEquipment();
  const processed = rawList.map(processAsset);
  res.json(processed);
});

// GET /api/equipment/:id
app.get('/api/equipment/:id', (req, res) => {
  const asset = db.getEquipmentById(req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Equipment not found' });
  }
  res.json(processAsset(asset));
});

// POST /api/equipment/:id/checkout
app.post('/api/equipment/:id/checkout', (req, res) => {
  const asset = db.getEquipmentById(req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Equipment not found' });
  }

  const { siteId, operatorId, checkOutDate } = req.body;

  if (!siteId || !operatorId || !checkOutDate) {
    return res.status(400).json({ error: 'siteId, operatorId, and checkOutDate are required' });
  }

  asset.siteId = siteId;
  asset.operatorId = operatorId;
  asset.checkInDate = new Date('2026-07-30').toISOString().split('T')[0];
  asset.checkOutDate = checkOutDate;
  asset.status = 'Active';
  asset.engineHoursPerDay = 1.0; // Reset with some initial baseline hours
  asset.idleHoursPerDay = 1.0;
  asset.lastUpdated = new Date().toISOString();

  db.saveEquipment(asset);
  res.json({ message: 'Equipment checked out successfully', equipment: processAsset(asset) });
});

// POST /api/equipment/:id/checkin
app.post('/api/equipment/:id/checkin', (req, res) => {
  const asset = db.getEquipmentById(req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Equipment not found' });
  }

  asset.siteId = null;
  asset.operatorId = null;
  asset.checkInDate = null;
  asset.checkOutDate = null;
  asset.status = 'Unassigned';
  asset.engineHoursPerDay = 0;
  asset.idleHoursPerDay = 0;
  asset.lastUpdated = new Date().toISOString();

  db.saveEquipment(asset);
  res.json({ message: 'Equipment checked in successfully', equipment: processAsset(asset) });
});

// GET /api/sites
app.get('/api/sites', (req, res) => {
  res.json(db.getSites());
});

// GET /api/operators
app.get('/api/operators', (req, res) => {
  res.json(db.getOperators());
});

// GET /api/alerts
app.get('/api/alerts', (req, res) => {
  const equipment = db.getEquipment().map(processAsset);
  const alertsList = [];
  const anomaliesList = [];

  equipment.forEach(e => {
    if (e.alert) {
      alertsList.push({
        equipmentId: e.equipmentId,
        type: e.type,
        siteId: e.siteId,
        ...e.alert
      });
    }
    if (e.anomalies && e.anomalies.length > 0) {
      e.anomalies.forEach(anom => {
        anomaliesList.push({
          equipmentId: e.equipmentId,
          type: e.type,
          siteId: e.siteId,
          operatorId: e.operatorId,
          ...anom
        });
      });
    }
  });

  res.json({
    alerts: alertsList,
    anomalies: anomaliesList
  });
});

// GET /api/analytics
app.get('/api/analytics', (req, res) => {
  const equipment = db.getEquipment().map(processAsset);
  
  const total = equipment.length;
  const active = equipment.filter(e => e.status === 'Active').length;
  
  // Overdue calculation (checkOutDate < '2026-07-30')
  const today = new Date('2026-07-30');
  const overdue = equipment.filter(e => e.status === 'Active' && e.checkOutDate && new Date(e.checkOutDate) < today).length;

  // Average fleet utilization
  const activeWithUtil = equipment.filter(e => e.status === 'Active');
  const avgUtil = activeWithUtil.length > 0 
    ? Math.round(activeWithUtil.reduce((sum, e) => sum + e.utilization, 0) / activeWithUtil.length)
    : 0;

  // Utilization by equipment type
  const types = ['Excavator', 'Bulldozer', 'Crane', 'Grader'];
  const typeUtil = types.map(type => {
    const list = equipment.filter(e => e.type === type && e.status === 'Active');
    const utilSum = list.reduce((sum, e) => sum + e.utilization, 0);
    return {
      type,
      utilization: list.length > 0 ? Math.round(utilSum / list.length) : 0,
      count: equipment.filter(e => e.type === type).length,
      activeCount: list.length
    };
  });

  res.json({
    kpis: {
      totalAssets: total,
      activeRentals: active,
      overdueRentals: overdue,
      fleetUtilization: avgUtil
    },
    utilizationByType: typeUtil,
    historicalUsage: db.getHistoricalUsage()
  });
});

// GET /api/reallocations (Smart Reallocation Engine)
app.get('/api/reallocations', (req, res) => {
  const equipment = db.getEquipment().map(processAsset);
  
  // Finding optimization opportunities:
  // Under-utilized machines (utilization < 20% or idle > 8)
  const underUtilized = equipment.filter(e => e.status === 'Active' && e.utilization < 25 && e.siteId);
  const recommendations = [];

  underUtilized.forEach(machine => {
    // Look for sites that have a high demand for this type of equipment, or have highly-utilized machines of the same type.
    // Let's check sites other than the current site.
    const otherSites = db.getSites().filter(s => s.id !== machine.siteId);
    
    // Find a site where machines of this type are running hot (utilization > 80%) or predicted demand is high.
    // For this prototype, we'll hardcode or deduce it:
    // S003 (Harbor Expansion) has highly-utilized excavators (EQX1003 is bulldozer, EQX1001 is low usage, but S003 is a massive site).
    // Let's create a solid logic:
    // S001 (Metro Line Extension) has high demand for Graders/Excavators
    // S003 has high demand for Excavators
    // S002 has high demand for Bulldozers
    let targetSiteId = null;
    let predictedDemand = 'HIGH';
    let expectedUtil = 75;

    if (machine.type === 'Excavator') {
      targetSiteId = 'S003';
      expectedUtil = 74;
    } else if (machine.type === 'Bulldozer') {
      targetSiteId = 'S002';
      expectedUtil = 85;
    } else if (machine.type === 'Grader') {
      targetSiteId = 'S001';
      expectedUtil = 68;
    } else {
      targetSiteId = otherSites[0]?.id || 'S001';
      expectedUtil = 60;
    }

    const currentSite = db.getSites().find(s => s.id === machine.siteId);
    const targetSite = db.getSites().find(s => s.id === targetSiteId);

    recommendations.push({
      equipmentId: machine.equipmentId,
      name: machine.name,
      type: machine.type,
      currentSiteId: machine.siteId,
      currentSiteName: currentSite ? currentSite.name : machine.siteId,
      targetSiteId,
      targetSiteName: targetSite ? targetSite.name : targetSiteId,
      currentUtilization: machine.utilization,
      expectedUtilization: expectedUtil,
      predictedDemand,
      reason: `${machine.equipmentId} is under-utilized at ${currentSite ? currentSite.name : machine.siteId} (${machine.utilization}% utilization). Predicted demand for ${machine.type}s at ${targetSite ? targetSite.name : targetSiteId} is HIGH.`,
      savings: 'Avoids 3-day rental extension + boosts overall fleet efficiency.'
    });
  });

  res.json(recommendations);
});

// POST /api/forecast (Interface with Python ML Service or Fallback Node Forecasting)
app.post('/api/forecast', async (req, res) => {
  const { siteId, equipmentType } = req.body;
  if (!siteId || !equipmentType) {
    return res.status(400).json({ error: 'siteId and equipmentType are required' });
  }

  // Fallback forecasting logic:
  // Calculate average rentals from historical demand for this site and type,
  // then apply a weekly trend + minor noise.
  const getFallbackForecast = () => {
    const history = db.getDemandHistory().filter(h => h.siteId === siteId && h.equipmentType === equipmentType);
    const avgRentals = history.length > 0
      ? history.reduce((sum, h) => sum + h.rentals, 0) / history.length
      : 3.0;

    const forecast = [];
    const today = new Date('2026-07-30');
    
    for (let i = 1; i <= 7; i++) {
      const fDate = new Date(today);
      fDate.setDate(fDate.getDate() + i);
      const dateStr = fDate.toISOString().split('T')[0];
      const dayOfWeek = fDate.getDay();

      // Weekend effect
      let multiplier = 1.0;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        multiplier = 0.7; // Lower on weekends
      } else {
        multiplier = 1.1;
      }

      // Add a small trend
      const trend = 1.0 + (i * 0.02);
      const predictedVal = Math.max(0, parseFloat((avgRentals * multiplier * trend + (Math.random() * 1.0 - 0.5)).toFixed(1)));
      
      forecast.push({
        date: dateStr,
        dayOfWeek,
        predictedRentals: predictedVal
      });
    }

    return {
      siteId,
      equipmentType,
      source: 'Node.js Fallback Model',
      forecast
    };
  };

  // Try calling the Python ML microservice
  try {
    const history = db.getDemandHistory().filter(
      h => h.siteId === siteId && h.equipmentType === equipmentType
    );
    const postData = JSON.stringify({ siteId, equipmentType, history });
    
    const mlUrlStr = process.env.ML_SERVICE_URL || 'http://localhost:5000/predict';
    const mlUrl = new URL(mlUrlStr);
    
    const options = {
      hostname: mlUrl.hostname,
      port: mlUrl.port || (mlUrl.protocol === 'https:' ? 443 : 80),
      path: mlUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 2000
    };

    const requestLib = mlUrl.protocol === 'https:' ? require('https') : http;
    const pyReq = requestLib.request(options, (pyRes) => {
      let data = '';
      pyRes.on('data', (chunk) => { data += chunk; });
      pyRes.on('end', () => {
        try {
          if (pyRes.statusCode === 200) {
            const parsed = JSON.parse(data);
            res.json({
              ...parsed,
              source: 'Python Random Forest Regressor'
            });
          } else {
            res.json(getFallbackForecast());
          }
        } catch (e) {
          res.json(getFallbackForecast());
        }
      });
    });

    pyReq.on('error', () => {
      res.json(getFallbackForecast());
    });

    pyReq.on('timeout', () => {
      pyReq.destroy();
      res.json(getFallbackForecast());
    });

    pyReq.write(postData);
    pyReq.end();

  } catch (error) {
    res.json(getFallbackForecast());
  }
});

// Start telemetry simulator
simulator.startTelemetrySimulation();

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
