import type { ReactNode } from 'react';
import AreaChart from '../../components/area-chart';
import BarChart from '../../components/bar-chart';
import LineChart from '../../components/line-chart';
import ComposedChart from '../../components/composed-chart';
import PieChart from '../../components/pie-chart';
import RadialChart from '../../components/radial-chart';
import RadarChart from '../../components/radar-chart';
import DemoSection from '../demo-section';

const MONTHLY = [
  { month: 'Jan', revenue: 4200, profit: 2400 },
  { month: 'Feb', revenue: 3800, profit: 1980 },
  { month: 'Mar', revenue: 5100, profit: 3200 },
  { month: 'Apr', revenue: 4700, profit: 2900 },
  { month: 'May', revenue: 6300, profit: 4100 },
  { month: 'Jun', revenue: 5900, profit: 3700 },
];

const AreaChartDemo = () => (
  <DemoSection label="面积图（hover 显示 tooltip）" isColumn>
    <div style={{ width: 520 }}>
      <AreaChart data={MONTHLY} height={220}>
        <defs>
          <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <AreaChart.Grid vertical={false} />
        <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
        <AreaChart.YAxis tickLine={false} axisLine={false} width={40} />
        <AreaChart.Tooltip cursor content={<AreaChart.TooltipContent indicator="dot" />} />
        <AreaChart.Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="var(--chart-3)"
          strokeWidth={2}
          fill="url(#rev-fill)"
          fillOpacity={0.6}
        />
      </AreaChart>
    </div>
  </DemoSection>
);

const BAR_DATA = [
  { month: 'Jan', units: 32 },
  { month: 'Feb', units: 48 },
  { month: 'Mar', units: 41 },
  { month: 'Apr', units: 60 },
  { month: 'May', units: 53 },
  { month: 'Jun', units: 58 },
];

const BarChartDemo = () => (
  <DemoSection label="柱状图（hover 显示 tooltip）" isColumn>
    <div style={{ width: 520 }}>
      <BarChart data={BAR_DATA} height={220}>
        <BarChart.Grid vertical={false} />
        <BarChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
        <BarChart.YAxis tickLine={false} axisLine={false} width={40} />
        <BarChart.Tooltip cursor content={<BarChart.TooltipContent indicator="dot" />} />
        <BarChart.Bar dataKey="units" name="Units" fill="var(--accent)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </div>
  </DemoSection>
);

const LineChartDemo = () => (
  <DemoSection label="折线图（多系列 hover tooltip）" isColumn>
    <div style={{ width: 520 }}>
      <LineChart data={MONTHLY} height={220}>
        <LineChart.Grid vertical={false} />
        <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
        <LineChart.YAxis tickLine={false} axisLine={false} width={40} />
        <LineChart.Tooltip
          cursor={{ strokeDasharray: '4 4' }}
          content={<LineChart.TooltipContent indicator="line" />}
        />
        <LineChart.Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <LineChart.Line
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </div>
  </DemoSection>
);

const COMPOSED_DATA = [
  { month: 'Jan', desktop: 4200, mobile: 2400, trend: 3300 },
  { month: 'Feb', desktop: 3800, mobile: 1980, trend: 2900 },
  { month: 'Mar', desktop: 5100, mobile: 3200, trend: 4150 },
  { month: 'Apr', desktop: 4700, mobile: 2900, trend: 3800 },
  { month: 'May', desktop: 6300, mobile: 4100, trend: 5200 },
  { month: 'Jun', desktop: 5900, mobile: 3700, trend: 4800 },
];

const ComposedChartDemo = () => (
  <DemoSection label="组合图（面积 + 柱 + 线，hover tooltip）" isColumn>
    <div style={{ width: 520 }}>
      <ComposedChart data={COMPOSED_DATA} height={240}>
        <ComposedChart.Grid vertical={false} />
        <ComposedChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ComposedChart.YAxis tickLine={false} axisLine={false} width={40} />
        <ComposedChart.Tooltip content={<ComposedChart.TooltipContent />} />
        <ComposedChart.Area
          type="monotone"
          dataKey="trend"
          name="Trend"
          fill="var(--chart-3)"
          fillOpacity={0.15}
          stroke="var(--chart-3)"
        />
        <ComposedChart.Bar dataKey="mobile" name="Mobile" fill="var(--chart-2)" radius={[4, 4, 0, 0]} barSize={16} />
        <ComposedChart.Line
          type="monotone"
          dataKey="desktop"
          name="Desktop"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </div>
  </DemoSection>
);

const PIE_DATA = [
  { browser: 'Chrome', visitors: 275, fill: 'var(--chart-4)' },
  { browser: 'Safari', visitors: 200, fill: 'var(--chart-3)' },
  { browser: 'Firefox', visitors: 187, fill: 'var(--chart-2)' },
  { browser: 'Edge', visitors: 173, fill: 'var(--chart-1)' },
];

const PieChartDemo = () => (
  <DemoSection label="饼图 / 甜甜圈（hover 扇区高亮 + tooltip）">
    <PieChart height={240} width={240}>
      <PieChart.Tooltip cursor={false} content={<PieChart.TooltipContent />} />
      <PieChart.Pie data={PIE_DATA} dataKey="visitors" nameKey="browser" stroke="#fff" paddingAngle={2} />
    </PieChart>
    <PieChart height={240} width={240}>
      <PieChart.Tooltip cursor={false} content={<PieChart.TooltipContent />} />
      <PieChart.Pie
        data={PIE_DATA}
        dataKey="visitors"
        nameKey="browser"
        innerRadius={60}
        outerRadius={92}
        paddingAngle={2}
        stroke="#fff"
      />
    </PieChart>
  </DemoSection>
);

const RADIAL_RINGS = [
  { activity: 'Exercise', value: 80, fill: 'var(--chart-4)' },
  { activity: 'Steps', value: 65, fill: 'var(--chart-3)' },
  { activity: 'Calories', value: 50, fill: 'var(--chart-2)' },
];

const RadialChartDemo = () => (
  <DemoSection label="径向条形图（hover tooltip）">
    <RadialChart data={RADIAL_RINGS} height={220} width={220} innerRadius="30%" outerRadius="100%" barSize={12}>
      <RadialChart.Tooltip cursor={false} content={<RadialChart.TooltipContent />} />
      <RadialChart.Bar dataKey="value" background cornerRadius={8}>
        <RadialChart.Cell fill="var(--chart-4)" />
        <RadialChart.Cell fill="var(--chart-3)" />
        <RadialChart.Cell fill="var(--chart-2)" />
      </RadialChart.Bar>
    </RadialChart>
  </DemoSection>
);

const RADAR_DATA = [
  { subject: 'Design', score: 90 },
  { subject: 'Frontend', score: 80 },
  { subject: 'Backend', score: 70 },
  { subject: 'DevOps', score: 60 },
  { subject: 'Testing', score: 85 },
  { subject: 'Docs', score: 75 },
];

const RadarChartDemo = () => (
  <DemoSection label="雷达图（hover tooltip）">
    <RadarChart data={RADAR_DATA} height={280} width={360}>
      <RadarChart.Grid gridType="polygon" />
      <RadarChart.AngleAxis dataKey="subject" />
      <RadarChart.Radar
        name="Score"
        dataKey="score"
        stroke="var(--chart-3)"
        fill="var(--chart-3)"
        fillOpacity={0.15}
        strokeWidth={2}
      />
      <RadarChart.Tooltip content={<RadarChart.TooltipContent />} />
    </RadarChart>
  </DemoSection>
);

export const chartsDemos: Record<string, ReactNode> = {
  'area-chart': <AreaChartDemo />,
  'bar-chart': <BarChartDemo />,
  'line-chart': <LineChartDemo />,
  'composed-chart': <ComposedChartDemo />,
  'pie-chart': <PieChartDemo />,
  'radial-chart': <RadialChartDemo />,
  'radar-chart': <RadarChartDemo />,
};
