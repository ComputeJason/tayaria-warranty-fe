import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NOT_RECORDED, type DashboardData } from '@/services/dashboardTypes';
import { NOT_RECORDED_COLOR, OTHER_COLOR, SERIES_COLORS } from './format';

const BrandMixChart: React.FC<{ mix: DashboardData['brandMix'] }> = ({ mix }) => {
  const colorFor = (s: string, i: number) =>
    s === NOT_RECORDED ? NOT_RECORDED_COLOR : s === 'Other' ? OTHER_COLOR : SERIES_COLORS[i % SERIES_COLORS.length];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mix.points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#2a2a2a" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#333' }}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#fff', marginBottom: 4, fontWeight: 600 }}
            itemStyle={{ padding: 0 }}
            itemSorter={(item) => -(item.value as number)}
            formatter={(value: number, name: string) => [value, name]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 8 }}
            formatter={(v) => <span style={{ color: '#9CA3AF', fontSize: 12 }}>{v}</span>}
          />
          {mix.series.map((s, i) => (
            <Bar
              key={s}
              dataKey={s}
              stackId="brands"
              fill={colorFor(s, i)}
              maxBarSize={48}
              radius={i === mix.series.length - 1 ? [3, 3, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BrandMixChart;
