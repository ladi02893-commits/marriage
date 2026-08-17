'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Award,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';

export default function AdminAnalyticsDeepDivePage() {
  const conversionFunnel = [
    { stage: 'Site Visitors', count: 120000 },
    { stage: 'Registrations', count: 18400 },
    { stage: 'Completed Dossiers', count: 14200 },
    { stage: 'ID Verified', count: 11800 },
    { stage: 'Paid VIP Subscribers', count: 3200 },
  ];

  const religionDistribution = [
    { name: 'Islam', value: 48, color: '#e11d48' },
    { name: 'Hinduism', value: 28, color: '#f59e0b' },
    { name: 'Sikhism', value: 12, color: '#3b82f6' },
    { name: 'Christianity', value: 8, color: '#10b981' },
    { name: 'Other', value: 4, color: '#8b5cf6' },
  ];

  const handleExportCSV = () => {
    toast.success('Exporting platform business metrics as CSV...');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Platform SaaS Analytics & Insights</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cohort retention, user acquisition funnel, conversion metrics, and regional demographics.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
        >
          <Download className="h-4 w-4" /> Export CSV Report
        </button>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {conversionFunnel.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-1 text-center">
            <span className="text-[11px] font-semibold text-zinc-400 block">{item.stage}</span>
            <div className="text-xl font-black font-serif text-white">{item.count.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Funnel Bar Chart */}
        <div className="lg:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">User Acquisition & Conversion Funnel</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#ffffff" />
                <XAxis type="number" fontSize={11} stroke="#71717a" />
                <YAxis dataKey="stage" type="category" fontSize={10} stroke="#71717a" width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '12px',
                    fontSize: '11px',
                    borderColor: '#f59e0b',
                    color: '#ffffff',
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Distribution */}
        <div className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Demographic Religious Split (%)</h3>
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={religionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {religionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '12px',
                    fontSize: '11px',
                    borderColor: '#ffffff',
                    color: '#ffffff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
