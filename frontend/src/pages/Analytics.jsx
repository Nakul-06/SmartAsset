import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { Clock, TrendingUp, Cpu, Award } from 'lucide-react';

export default function Analytics({ analytics, equipment }) {
  const usageHistory = analytics?.historicalUsage || [];

  // Group historical data by date for Recharts
  // Output format: [ { date: '2026-07-01', Excavator: 65, Bulldozer: 80, ... }, ... ]
  const getChartData = () => {
    const dataMap = {};
    usageHistory.forEach(item => {
      if (!dataMap[item.date]) {
        dataMap[item.date] = { date: item.date };
      }
      dataMap[item.date][item.equipmentType] = item.avgUtilization;
      dataMap[item.date][`${item.equipmentType}_rentals`] = item.activeRentals;
    });
    // Sort by date ascending
    return Object.values(dataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartData = getChartData();

  // Stats calculation
  const totalOperatingHours = equipment
    .filter(e => e.status === 'Active')
    .reduce((sum, e) => sum + (e.engineHoursPerDay + e.idleHoursPerDay), 0);

  const totalEngineHours = equipment
    .filter(e => e.status === 'Active')
    .reduce((sum, e) => sum + e.engineHoursPerDay, 0);

  const fleetIdleRatio = totalOperatingHours > 0 
    ? Math.round(((totalOperatingHours - totalEngineHours) / totalOperatingHours) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. ANALYTICS STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cat-card border border-cat-border p-5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cat-yellow/10 border border-cat-yellow/20 flex items-center justify-center text-cat-yellow shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-cat-gray font-bold uppercase">Total Daily Fleet Hours</p>
            <h4 className="text-xl font-extrabold text-cat-text mt-0.5">{totalOperatingHours.toFixed(1)} hrs</h4>
          </div>
        </div>

        <div className="bg-cat-card border border-cat-border p-5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-cat-gray font-bold uppercase">Overall Idle Fleet Ratio</p>
            <h4 className="text-xl font-extrabold text-amber-500 mt-0.5">{fleetIdleRatio}% Idle Time</h4>
          </div>
        </div>

        <div className="bg-cat-card border border-cat-border p-5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] text-cat-gray font-bold uppercase">Target Efficiency Rating</p>
            <h4 className="text-xl font-extrabold text-emerald-400 mt-0.5">Grade B (Good)</h4>
          </div>
        </div>
      </div>

      {/* 2. CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Fleet Utilization Trends */}
        <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-4">
          <div>
            <h3 className="font-bold text-cat-text text-sm uppercase tracking-wider">30-Day Fleet Utilization Trends (%)</h3>
            <p className="text-[10px] text-cat-gray mt-0.5">Average running telemetry vs idle statistics</p>
          </div>
          
          <div className="h-72 w-full text-xs">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExcavator" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFCD00" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FFCD00" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBulldozer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2C2C2E" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#8E8E93" />
                  <YAxis stroke="#8E8E93" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', color: '#F2F2F7' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" dataKey="Excavator" name="Excavator %" stroke="#FFCD00" fillOpacity={1} fill="url(#colorExcavator)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Bulldozer" name="Bulldozer %" stroke="#10B981" fillOpacity={1} fill="url(#colorBulldozer)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-cat-gray">Loading historical data...</div>
            )}
          </div>
        </div>

        {/* Chart B: Category Running Hours */}
        <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-4">
          <div>
            <h3 className="font-bold text-cat-text text-sm uppercase tracking-wider">30-Day Category Utilization Breakdown (%)</h3>
            <p className="text-[10px] text-cat-gray mt-0.5">Running comparison for Crane and Grader assets</p>
          </div>

          <div className="h-72 w-full text-xs">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#2C2C2E" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#8E8E93" />
                  <YAxis stroke="#8E8E93" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', color: '#F2F2F7' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" dataKey="Crane" name="Crane %" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Grader" name="Grader %" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-cat-gray">Loading historical data...</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. HISTORICAL LEASE VOLUME */}
      <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-4">
        <div>
          <h3 className="font-bold text-cat-text text-sm uppercase tracking-wider">Leased Assets Volume per Category</h3>
          <p className="text-[10px] text-cat-gray mt-0.5">Daily lease allocations active across all sites</p>
        </div>

        <div className="h-64 w-full text-xs">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#2C2C2E" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#8E8E93" />
                <YAxis stroke="#8E8E93" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', color: '#F2F2F7' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Bar dataKey="Excavator_rentals" name="Excavator Active" fill="#FFCD00" stackId="a" />
                <Bar dataKey="Bulldozer_rentals" name="Bulldozer Active" fill="#10B981" stackId="a" />
                <Bar dataKey="Crane_rentals" name="Crane Active" fill="#3b82f6" stackId="a" />
                <Bar dataKey="Grader_rentals" name="Grader Active" fill="#a855f7" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-cat-gray">Loading data...</div>
          )}
        </div>
      </div>
    </div>
  );
}
