import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CategoryBreakdown, MonthlyTrendPoint, WeeklyActivityPoint } from '../types';

const CATEGORY_COLORS: { [key: string]: string } = {
  'Plastic': '#0284c7', // Sky Blue
  'Paper & Cardboard': '#d97706', // Amber
  'Glass': '#0d9488', // Teal
  'Metal': '#6366f1', // Indigo
  'Organic / Compost': '#16a34a', // Emerald
  'E-Waste': '#9333ea', // Purple
  'Hazardous': '#e11d48', // Rose
  'Landfill / Residual': '#64748b' // Slate
};

interface StatsChartsProps {
  categories: CategoryBreakdown[];
  monthlyTrends: MonthlyTrendPoint[];
  weeklyActivity: WeeklyActivityPoint[];
}

export const StatsCharts: React.FC<StatsChartsProps> = ({
  categories,
  monthlyTrends,
  weeklyActivity
}) => {
  const chartData = categories.filter((c) => c.count > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Category Breakdown Donut Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
            Waste Stream Composition
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of scanned materials by physical category
          </p>
        </div>

        <div className="h-64 w-full my-4">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No scan data yet. Scan items to view category distribution.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="category"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} scans (${item.payload.percentage}%)`,
                    name
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
            7-Day Activity & Diversion
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Total scans vs items successfully diverted for recycling
          </p>
        </div>

        <div className="h-64 w-full my-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="scans" name="Total Scans" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recycled" name="Recycled Items" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
              Monthly Waste Reduction Trend
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Weight (kg) of recyclable materials preserved from landfills over time
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  name === 'diverted_kg' ? `${val} kg diverted` : val,
                  name === 'diverted_kg' ? 'Weight Diverted' : 'Recycled Count'
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="recycled_count" name="Recycled Items" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="diverted_kg" name="Diverted Weight (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
