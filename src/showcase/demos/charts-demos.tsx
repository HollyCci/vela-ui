import { useState, type CSSProperties, type ReactNode } from 'react';
import AreaChart from '../../components/area-chart';
import BarChart from '../../components/bar-chart';
import LineChart from '../../components/line-chart';
import ComposedChart from '../../components/composed-chart';
import PieChart from '../../components/pie-chart';
import RadialChart from '../../components/radial-chart';
import RadarChart from '../../components/radar-chart';
import ChartTooltip from '../../components/chart-tooltip';
import Kpi from '../../components/kpi';
import KpiGroup from '../../components/kpi-group';
import TrendChip from '../../components/trend-chip';
import Widget from '../../components/widget';
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

type AreaVariant =
  | 'custom-tooltip'
  | 'default'
  | 'kpi-with-area-chart'
  | 'multi-area'
  | 'sparkline'
  | 'stacked';

type BarVariant =
  | 'comparison'
  | 'custom-tooltip'
  | 'default'
  | 'grouped'
  | 'horizontal'
  | 'horizontal-stacked'
  | 'kpi-with-bar-chart'
  | 'stacked';

type TooltipVariant =
  | 'auto-content'
  | 'chart-colors'
  | 'custom-formatters'
  | 'default'
  | 'inactive'
  | 'line-indicator'
  | 'no-header';

type ComposedVariant =
  | 'area-with-line'
  | 'bar-with-area'
  | 'default'
  | 'multi-type'
  | 'stacked-bar-with-line';

type LineVariant =
  | 'custom-tooltip'
  | 'dashed-comparison'
  | 'default'
  | 'kpi-with-chart'
  | 'multi-line-chart-colors'
  | 'portfolio'
  | 'sparkline'
  | 'stats-with-chart'
  | 'traffic-source'
  | 'with-dots';

type PieVariant =
  | 'custom-tooltip'
  | 'default'
  | 'donut'
  | 'donut-with-content'
  | 'donut-with-label'
  | 'nested-donut'
  | 'with-breakdown';

type RadarVariant =
  | 'comparison'
  | 'default'
  | 'dots-only'
  | 'multi-series'
  | 'with-radius-axis';

type RadialVariant =
  | 'default'
  | 'gauge'
  | 'gauge-grid'
  | 'progress-ring'
  | 'with-legend';

const TRAFFIC_DATA = [
  { month: 'Jan', direct: 42, search: 58, social: 27, referral: 18 },
  { month: 'Feb', direct: 48, search: 62, social: 31, referral: 21 },
  { month: 'Mar', direct: 46, search: 70, social: 36, referral: 25 },
  { month: 'Apr', direct: 54, search: 74, social: 42, referral: 26 },
  { month: 'May', direct: 61, search: 82, social: 39, referral: 30 },
  { month: 'Jun', direct: 68, search: 88, social: 45, referral: 34 },
];

const STACKED_SERIES_DATA = [
  { month: 'Jan', desktop: 46, mobile: 32, tablet: 14 },
  { month: 'Feb', desktop: 50, mobile: 38, tablet: 16 },
  { month: 'Mar', desktop: 58, mobile: 42, tablet: 18 },
  { month: 'Apr', desktop: 55, mobile: 46, tablet: 20 },
  { month: 'May', desktop: 65, mobile: 51, tablet: 21 },
  { month: 'Jun', desktop: 70, mobile: 55, tablet: 24 },
];

const HORIZONTAL_BAR_DATA = [
  { stage: 'Qualified', value: 86, email: 34, social: 28, search: 24 },
  { stage: 'Proposal', value: 68, email: 28, social: 20, search: 20 },
  { stage: 'Review', value: 52, email: 18, social: 17, search: 17 },
  { stage: 'Closed', value: 41, email: 16, social: 12, search: 13 },
];

const PORTFOLIO_DATA = [
  { month: 'Jan', growth: 108, income: 101, cash: 100 },
  { month: 'Feb', growth: 114, income: 104, cash: 101 },
  { month: 'Mar', growth: 111, income: 108, cash: 101 },
  { month: 'Apr', growth: 126, income: 112, cash: 102 },
  { month: 'May', growth: 132, income: 115, cash: 102 },
  { month: 'Jun', growth: 141, income: 119, cash: 103 },
];

const SOURCE_DATA = [
  { month: 'Jan', organic: 380, paid: 220, email: 140 },
  { month: 'Feb', organic: 420, paid: 240, email: 160 },
  { month: 'Mar', organic: 470, paid: 260, email: 180 },
  { month: 'Apr', organic: 510, paid: 300, email: 210 },
  { month: 'May', organic: 560, paid: 340, email: 230 },
  { month: 'Jun', organic: 610, paid: 390, email: 260 },
];

const PIE_BREAKDOWN_DATA = [
  { channel: 'Product', value: 42, fill: 'var(--chart-4)' },
  { channel: 'Sales', value: 28, fill: 'var(--chart-3)' },
  { channel: 'Success', value: 18, fill: 'var(--chart-2)' },
  { channel: 'Ops', value: 12, fill: 'var(--chart-1)' },
];

const NESTED_PIE_OUTER_DATA = [
  { channel: 'New', value: 46, fill: 'var(--chart-4)' },
  { channel: 'Expansion', value: 32, fill: 'var(--chart-3)' },
  { channel: 'Renewal', value: 22, fill: 'var(--chart-2)' },
];

const NESTED_PIE_INNER_DATA = [
  { channel: 'Self serve', value: 58, fill: 'var(--chart-5)' },
  { channel: 'Assisted', value: 42, fill: 'var(--chart-1)' },
];

const RADAR_COMPARE_DATA = [
  { subject: 'Design', current: 90, previous: 72, target: 95 },
  { subject: 'Frontend', current: 84, previous: 76, target: 92 },
  { subject: 'Backend', current: 78, previous: 70, target: 88 },
  { subject: 'Quality', current: 82, previous: 68, target: 90 },
  { subject: 'Docs', current: 74, previous: 62, target: 86 },
  { subject: 'Ops', current: 70, previous: 66, target: 82 },
];

const RADIAL_PROGRESS_DATA = [
  { label: 'Progress', value: 72, fill: 'var(--chart-4)' },
];

const RADIAL_LEGEND_DATA = [
  { label: 'Activation', value: 88, fill: 'var(--chart-4)' },
  { label: 'Retention', value: 74, fill: 'var(--chart-3)' },
  { label: 'Revenue', value: 62, fill: 'var(--chart-2)' },
  { label: 'Quality', value: 52, fill: 'var(--chart-1)' },
];

const formatNumber = (value: number | string) => Number(value).toLocaleString();
const formatCurrency = (value: number | string) => `$${Number(value).toLocaleString()}`;
const formatPercent = (value: number | string) => `${value}%`;

const ChartBox = ({ width = 520, children }: { width?: number; children: ReactNode }) => (
  <div style={{ width }}>{children}</div>
);

const kpiCardStyle: CSSProperties = { width: 360 };

const toggleLegendKey = (items: Set<string>, key: string) => {
  const next = new Set(items);

  if (next.has(key)) {
    if (next.size > 1) next.delete(key);
    return next;
  }

  next.add(key);
  return next;
};

const legendItemStyle = (active: boolean, highlighted: boolean): CSSProperties => ({
  borderRadius: 999,
  cursor: 'pointer',
  opacity: active ? (highlighted ? 1 : 0.72) : 0.36,
  padding: '2px 4px',
  transform: highlighted ? 'translateY(-1px)' : undefined,
  transition: 'opacity 120ms ease, transform 120ms ease',
});

const InteractiveLegendItem = ({
  active,
  fill,
  highlighted,
  label,
  value,
  onHover,
  onToggle,
}: {
  active: boolean;
  fill: string;
  highlighted: boolean;
  label: string;
  value: number;
  onHover: (label: string | null) => void;
  onToggle: (label: string) => void;
}) => (
  <Widget.LegendItem
    aria-label={`${active ? 'Hide' : 'Show'} ${label}`}
    aria-pressed={active}
    color={fill}
    isPressable
    style={legendItemStyle(active, highlighted)}
    onClick={() => onToggle(label)}
    onFocus={() => onHover(label)}
    onBlur={() => onHover(null)}
    onMouseEnter={() => onHover(label)}
    onMouseLeave={() => onHover(null)}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span>{label}</span>
      <strong style={{ color: 'var(--foreground)', fontWeight: 600 }}>{value}%</strong>
    </span>
  </Widget.LegendItem>
);

const AreaVariantDemo = ({ variant }: { variant: AreaVariant }) => {
  if (variant === 'kpi-with-area-chart') {
    return (
      <DemoSection label="KPI with area chart" isColumn>
        <Kpi style={kpiCardStyle}>
          <Kpi.Header>
            <Kpi.Title>Recurring revenue</Kpi.Title>
          </Kpi.Header>
          <Kpi.Content>
            <Kpi.Value>$62.4k</Kpi.Value>
            <Kpi.Trend>
              <TrendChip trend="up" value="14.2%" suffix="MoM" size="sm" />
            </Kpi.Trend>
          </Kpi.Content>
          <Kpi.Chart>
            <AreaChart data={MONTHLY} height={118} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="area-kpi-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <AreaChart.Tooltip
                cursor={false}
                content={<AreaChart.TooltipContent valueFormatter={formatCurrency} />}
              />
              <AreaChart.Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="var(--chart-4)"
                strokeWidth={2}
                fill="url(#area-kpi-fill)"
                fillOpacity={1}
                dot={false}
              />
            </AreaChart>
          </Kpi.Chart>
        </Kpi>
      </DemoSection>
    );
  }

  if (variant === 'sparkline') {
    return (
      <DemoSection label="Sparkline area" isColumn>
        <ChartBox width={320}>
          <AreaChart data={MONTHLY} height={96} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
            <defs>
              <linearGradient id="area-sparkline-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <AreaChart.Tooltip
              cursor={false}
              content={<AreaChart.TooltipContent valueFormatter={formatCurrency} />}
            />
            <AreaChart.Area
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="var(--chart-3)"
              strokeWidth={2}
              fill="url(#area-sparkline-fill)"
              dot={false}
            />
          </AreaChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'multi-area') {
    return (
      <DemoSection label="Multi area chart" isColumn>
        <ChartBox>
          <AreaChart data={TRAFFIC_DATA} height={240}>
            <AreaChart.Grid vertical={false} />
            <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <AreaChart.YAxis tickLine={false} axisLine={false} width={38} />
            <AreaChart.Tooltip content={<AreaChart.TooltipContent valueFormatter={formatNumber} />} />
            <AreaChart.Area
              type="monotone"
              dataKey="search"
              name="Search"
              stroke="var(--chart-4)"
              fill="var(--chart-4)"
              fillOpacity={0.16}
              dot={false}
            />
            <AreaChart.Area
              type="monotone"
              dataKey="direct"
              name="Direct"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.12}
              dot={false}
            />
          </AreaChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'stacked') {
    return (
      <DemoSection label="Stacked area chart" isColumn>
        <ChartBox>
          <AreaChart data={STACKED_SERIES_DATA} height={240}>
            <AreaChart.Grid vertical={false} />
            <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <AreaChart.YAxis tickLine={false} axisLine={false} width={38} />
            <AreaChart.Tooltip content={<AreaChart.TooltipContent valueFormatter={formatPercent} />} />
            <AreaChart.Area
              type="monotone"
              dataKey="desktop"
              name="Desktop"
              stackId="devices"
              stroke="var(--chart-4)"
              fill="var(--chart-4)"
              fillOpacity={0.5}
            />
            <AreaChart.Area
              type="monotone"
              dataKey="mobile"
              name="Mobile"
              stackId="devices"
              stroke="var(--chart-3)"
              fill="var(--chart-3)"
              fillOpacity={0.45}
            />
            <AreaChart.Area
              type="monotone"
              dataKey="tablet"
              name="Tablet"
              stackId="devices"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.4}
            />
          </AreaChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'custom-tooltip') {
    return (
      <DemoSection label="Area chart custom tooltip" isColumn>
        <ChartBox>
          <AreaChart data={MONTHLY} height={240}>
            <AreaChart.Grid vertical={false} />
            <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <AreaChart.YAxis tickLine={false} axisLine={false} width={42} />
            <AreaChart.Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <AreaChart.TooltipContent
                  indicator="line"
                  labelFormatter={(label) => `Month: ${label}`}
                  valueFormatter={formatCurrency}
                />
              }
            />
            <AreaChart.Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartBox>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="Default area chart" isColumn>
      <ChartBox>
        <AreaChart data={MONTHLY} height={240}>
          <AreaChart.Grid vertical={false} />
          <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
          <AreaChart.YAxis tickLine={false} axisLine={false} width={42} />
          <AreaChart.Tooltip content={<AreaChart.TooltipContent valueFormatter={formatCurrency} />} />
          <AreaChart.Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--chart-3)"
            fill="var(--chart-3)"
            fillOpacity={0.16}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartBox>
    </DemoSection>
  );
};

const BarVariantDemo = ({ variant }: { variant: BarVariant }) => {
  if (variant === 'kpi-with-bar-chart') {
    return (
      <DemoSection label="KPI with bar chart" isColumn>
        <Kpi style={kpiCardStyle}>
          <Kpi.Header>
            <Kpi.Title>Units shipped</Kpi.Title>
          </Kpi.Header>
          <Kpi.Content>
            <Kpi.Value>292k</Kpi.Value>
            <Kpi.Trend>
              <TrendChip trend="up" value="8.6%" suffix="QoQ" size="sm" />
            </Kpi.Trend>
          </Kpi.Content>
          <Kpi.Chart>
            <BarChart data={BAR_DATA} height={118} margin={{ top: 8, right: 2, bottom: 0, left: 2 }}>
              <BarChart.Tooltip
                cursor={false}
                content={<BarChart.TooltipContent valueFormatter={formatNumber} />}
              />
              <BarChart.Bar dataKey="units" name="Units" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </Kpi.Chart>
        </Kpi>
      </DemoSection>
    );
  }

  if (variant === 'horizontal' || variant === 'horizontal-stacked') {
    const isStacked = variant === 'horizontal-stacked';
    return (
      <DemoSection label={isStacked ? 'Horizontal stacked bar chart' : 'Horizontal bar chart'} isColumn>
        <ChartBox>
          <BarChart
            data={HORIZONTAL_BAR_DATA}
            height={240}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
          >
            <BarChart.Grid horizontal={false} />
            <BarChart.XAxis type="number" tickLine={false} axisLine={false} />
            <BarChart.YAxis
              type="category"
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              width={82}
            />
            <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatPercent} />} />
            {isStacked ? (
              <>
                <BarChart.Bar dataKey="email" name="Email" stackId="mix" fill="var(--chart-4)" radius={[0, 0, 0, 0]} />
                <BarChart.Bar dataKey="social" name="Social" stackId="mix" fill="var(--chart-3)" radius={[0, 0, 0, 0]} />
                <BarChart.Bar dataKey="search" name="Search" stackId="mix" fill="var(--chart-2)" radius={[0, 8, 8, 0]} />
              </>
            ) : (
              <BarChart.Bar dataKey="value" name="Conversion" fill="var(--chart-4)" radius={[0, 8, 8, 0]} />
            )}
          </BarChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'grouped' || variant === 'comparison') {
    return (
      <DemoSection label={variant === 'grouped' ? 'Grouped bar chart' : 'Comparison bar chart'} isColumn>
        <ChartBox>
          <BarChart data={STACKED_SERIES_DATA} height={240}>
            <BarChart.Grid vertical={false} />
            <BarChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <BarChart.YAxis tickLine={false} axisLine={false} width={38} />
            <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatPercent} />} />
            <BarChart.Bar dataKey="desktop" name="Desktop" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
            <BarChart.Bar dataKey="mobile" name="Mobile" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
            {variant === 'grouped' && (
              <BarChart.Bar dataKey="tablet" name="Tablet" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'stacked') {
    return (
      <DemoSection label="Stacked bar chart" isColumn>
        <ChartBox>
          <BarChart data={STACKED_SERIES_DATA} height={240}>
            <BarChart.Grid vertical={false} />
            <BarChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <BarChart.YAxis tickLine={false} axisLine={false} width={38} />
            <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatPercent} />} />
            <BarChart.Bar dataKey="desktop" name="Desktop" stackId="devices" fill="var(--chart-4)" radius={[0, 0, 0, 0]} />
            <BarChart.Bar dataKey="mobile" name="Mobile" stackId="devices" fill="var(--chart-3)" radius={[0, 0, 0, 0]} />
            <BarChart.Bar dataKey="tablet" name="Tablet" stackId="devices" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'custom-tooltip') {
    return (
      <DemoSection label="Bar chart custom tooltip" isColumn>
        <ChartBox>
          <BarChart data={BAR_DATA} height={240}>
            <BarChart.Grid vertical={false} />
            <BarChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <BarChart.YAxis tickLine={false} axisLine={false} width={38} />
            <BarChart.Tooltip
              cursor
              content={
                <BarChart.TooltipContent
                  indicator="line"
                  labelFormatter={(label) => `Cycle ${label}`}
                  valueFormatter={(value) => `${formatNumber(value)} units`}
                />
              }
            />
            <BarChart.Bar dataKey="units" name="Shipped" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartBox>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="Default bar chart" isColumn>
      <ChartBox>
        <BarChart data={BAR_DATA} height={240}>
          <BarChart.Grid vertical={false} />
          <BarChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
          <BarChart.YAxis tickLine={false} axisLine={false} width={38} />
          <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatNumber} />} />
          <BarChart.Bar dataKey="units" name="Units" fill="var(--chart-4)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartBox>
    </DemoSection>
  );
};

const ChartTooltipVariantDemo = ({ variant }: { variant: TooltipVariant }) => {
  if (variant === 'auto-content' || variant === 'custom-formatters') {
    return (
      <DemoSection
        label={variant === 'auto-content' ? 'Auto tooltip content' : 'Tooltip custom formatters'}
        isColumn
      >
        <ChartBox>
          <LineChart data={MONTHLY} height={220}>
            <LineChart.Grid vertical={false} />
            <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <LineChart.YAxis tickLine={false} axisLine={false} width={42} />
            <LineChart.Tooltip
              cursor={{ strokeDasharray: '4 4' }}
              content={
                <LineChart.TooltipContent
                  indicator={variant === 'custom-formatters' ? 'line' : 'dot'}
                  labelFormatter={
                    variant === 'custom-formatters' ? (label) => `Report: ${label}` : undefined
                  }
                  formatter={
                    variant === 'custom-formatters'
                      ? (value, name) => `${name}: ${formatCurrency(value)}`
                      : undefined
                  }
                />
              }
            />
            <LineChart.Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="var(--chart-4)"
              strokeWidth={2}
              dot={false}
            />
            <LineChart.Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'chart-colors') {
    return (
      <DemoSection label="Tooltip with chart colors">
        <ChartTooltip>
          <ChartTooltip.Header>June</ChartTooltip.Header>
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-4)" label="Revenue" value="$5,900" />
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-2)" label="Profit" value="$3,700" />
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-1)" label="Churn" value="2.1%" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  if (variant === 'inactive') {
    return (
      <DemoSection label="Inactive tooltip">
        <ChartTooltip aria-hidden="true" style={{ opacity: 0.48 }}>
          <ChartTooltip.Item label="Hover a data point" value="Inactive" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  if (variant === 'line-indicator') {
    return (
      <DemoSection label="Tooltip line indicator">
        <ChartTooltip>
          <ChartTooltip.Header>Traffic</ChartTooltip.Header>
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-4)" label="Search" value="88k" />
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-3)" label="Direct" value="68k" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  if (variant === 'no-header') {
    return (
      <DemoSection label="Tooltip without header">
        <ChartTooltip>
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-4)" label="Completed" value="74%" />
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-2)" label="Remaining" value="26%" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="Default tooltip">
      <ChartTooltip>
        <ChartTooltip.Header>June</ChartTooltip.Header>
        <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-4)" label="Revenue" value="$5,900" />
        <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-2)" label="Profit" value="$3,700" />
      </ChartTooltip>
    </DemoSection>
  );
};

const ComposedVariantDemo = ({ variant }: { variant: ComposedVariant }) => (
  <DemoSection label={`Composed chart ${variant.split('-').join(' ')}`} isColumn>
    <ChartBox>
      <ComposedChart data={COMPOSED_DATA} height={250}>
        <ComposedChart.Grid vertical={false} />
        <ComposedChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ComposedChart.YAxis tickLine={false} axisLine={false} width={42} />
        <ComposedChart.Tooltip content={<ComposedChart.TooltipContent formatter={formatCurrency} />} />
        {(variant === 'area-with-line' || variant === 'bar-with-area' || variant === 'multi-type') && (
          <ComposedChart.Area
            type="monotone"
            dataKey="trend"
            name="Trend"
            fill="var(--chart-3)"
            fillOpacity={0.16}
            stroke="var(--chart-3)"
            strokeWidth={2}
          />
        )}
        {(variant === 'bar-with-area' || variant === 'default' || variant === 'multi-type') && (
          <ComposedChart.Bar
            dataKey="mobile"
            name="Mobile"
            fill="var(--chart-2)"
            radius={[6, 6, 0, 0]}
            barSize={18}
          />
        )}
        {variant === 'stacked-bar-with-line' && (
          <>
            <ComposedChart.Bar dataKey="mobile" name="Mobile" stackId="traffic" fill="var(--chart-3)" radius={[0, 0, 0, 0]} barSize={22} />
            <ComposedChart.Bar dataKey="trend" name="Trend" stackId="traffic" fill="var(--chart-2)" radius={[6, 6, 0, 0]} barSize={22} />
          </>
        )}
        {(variant === 'area-with-line' || variant === 'default' || variant === 'multi-type' || variant === 'stacked-bar-with-line') && (
          <ComposedChart.Line
            type="monotone"
            dataKey="desktop"
            name="Desktop"
            stroke="var(--chart-4)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        )}
      </ComposedChart>
    </ChartBox>
  </DemoSection>
);

const LineVariantDemo = ({ variant }: { variant: LineVariant }) => {
  if (variant === 'kpi-with-chart' || variant === 'sparkline') {
    const isKpi = variant === 'kpi-with-chart';
    const chart = (
      <LineChart data={MONTHLY} height={isKpi ? 118 : 96} margin={{ top: 6, right: 2, bottom: 6, left: 2 }}>
        <LineChart.Tooltip
          cursor={false}
          content={<LineChart.TooltipContent hideLabel formatter={formatCurrency} />}
        />
        <LineChart.Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="var(--chart-4)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    );

    return (
      <DemoSection label={isKpi ? 'KPI with line chart' : 'Sparkline'} isColumn>
        {isKpi ? (
          <Kpi style={kpiCardStyle}>
            <Kpi.Header>
              <Kpi.Title>Net revenue</Kpi.Title>
            </Kpi.Header>
            <Kpi.Content>
              <Kpi.Value>$28.7k</Kpi.Value>
              <Kpi.Trend>
                <TrendChip trend="up" value="11.8%" suffix="MoM" size="sm" />
              </Kpi.Trend>
            </Kpi.Content>
            <Kpi.Chart>{chart}</Kpi.Chart>
          </Kpi>
        ) : (
          <ChartBox width={320}>{chart}</ChartBox>
        )}
      </DemoSection>
    );
  }

  if (variant === 'stats-with-chart') {
    return (
      <DemoSection label="Stats with chart" isColumn>
        <Widget style={{ width: 560 }}>
          <Widget.Header>
            <Widget.Title>Traffic overview</Widget.Title>
            <TrendChip trend="up" value="9.3%" suffix="WoW" size="sm" />
          </Widget.Header>
          <Widget.Content style={{ display: 'grid', gap: 16 }}>
            <KpiGroup orientation="horizontal">
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>Visitors</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>12.8k</Kpi.Value>
                </Kpi.Content>
              </Kpi>
              <KpiGroup.Separator />
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>Conversion</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>7.4%</Kpi.Value>
                </Kpi.Content>
              </Kpi>
            </KpiGroup>
            <LineChart data={TRAFFIC_DATA} height={180}>
              <LineChart.Grid vertical={false} />
              <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <LineChart.YAxis tickLine={false} axisLine={false} width={34} />
              <LineChart.Tooltip content={<LineChart.TooltipContent formatter={formatNumber} />} />
              <LineChart.Line type="monotone" dataKey="search" name="Search" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
            </LineChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'traffic-source') {
    return (
      <DemoSection label="Traffic source lines" isColumn>
        <ChartBox>
          <LineChart data={SOURCE_DATA} height={240}>
            <LineChart.Grid vertical={false} />
            <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <LineChart.YAxis tickLine={false} axisLine={false} width={38} />
            <LineChart.Tooltip content={<LineChart.TooltipContent formatter={formatNumber} />} />
            <LineChart.Line type="monotone" dataKey="organic" name="Organic" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
            <LineChart.Line type="monotone" dataKey="paid" name="Paid" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
            <LineChart.Line type="monotone" dataKey="email" name="Email" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'portfolio') {
    return (
      <DemoSection label="Portfolio index lines" isColumn>
        <ChartBox>
          <LineChart data={PORTFOLIO_DATA} height={240}>
            <LineChart.Grid vertical={false} />
            <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <LineChart.YAxis tickLine={false} axisLine={false} width={38} domain={[95, 145]} />
            <LineChart.Tooltip content={<LineChart.TooltipContent formatter={(value) => `${value} index`} />} />
            <LineChart.Line type="monotone" dataKey="growth" name="Growth" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
            <LineChart.Line type="monotone" dataKey="income" name="Income" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
            <LineChart.Line type="step" dataKey="cash" name="Cash" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'multi-line-chart-colors' || variant === 'dashed-comparison') {
    const dashed = variant === 'dashed-comparison';
    return (
      <DemoSection label={dashed ? 'Dashed comparison line chart' : 'Multi-line chart colors'} isColumn>
        <ChartBox>
          <LineChart data={TRAFFIC_DATA} height={240}>
            <LineChart.Grid vertical={false} />
            <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <LineChart.YAxis tickLine={false} axisLine={false} width={38} />
            <LineChart.Tooltip content={<LineChart.TooltipContent indicator="line" formatter={formatNumber} />} />
            <LineChart.Line type="monotone" dataKey="search" name="Search" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
            <LineChart.Line
              type="monotone"
              dataKey="direct"
              name={dashed ? 'Previous' : 'Direct'}
              stroke="var(--chart-3)"
              strokeWidth={2}
              strokeDasharray={dashed ? '6 5' : undefined}
              dot={false}
            />
            {!dashed && (
              <LineChart.Line type="monotone" dataKey="social" name="Social" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
            )}
          </LineChart>
        </ChartBox>
      </DemoSection>
    );
  }

  if (variant === 'custom-tooltip') {
    return (
      <DemoSection label="Line chart custom tooltip" isColumn>
        <ChartBox>
          <LineChart data={MONTHLY} height={240}>
            <LineChart.Grid vertical={false} />
            <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <LineChart.YAxis tickLine={false} axisLine={false} width={42} />
            <LineChart.Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <LineChart.TooltipContent
                  indicator="line"
                  labelFormatter={(label) => `Month: ${label}`}
                  formatter={(value, name) => `${name} ${formatCurrency(value)}`}
                />
              }
            />
            <LineChart.Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
            <LineChart.Line type="monotone" dataKey="profit" name="Profit" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartBox>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant === 'with-dots' ? 'Line chart with dots' : 'Default line chart'} isColumn>
      <ChartBox>
        <LineChart data={MONTHLY} height={240}>
          <LineChart.Grid vertical={false} />
          <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
          <LineChart.YAxis tickLine={false} axisLine={false} width={42} />
          <LineChart.Tooltip content={<LineChart.TooltipContent formatter={formatCurrency} />} />
          <LineChart.Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--chart-4)"
            strokeWidth={2}
            dot={variant === 'with-dots' ? { r: 3, fill: 'var(--surface)', strokeWidth: 2 } : false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartBox>
    </DemoSection>
  );
};

const PieBreakdownDemo = () => {
  const [enabledChannels, setEnabledChannels] = useState<Set<string>>(
    () => new Set(PIE_BREAKDOWN_DATA.map((item) => item.channel)),
  );
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const visibleData = PIE_BREAKDOWN_DATA.filter((item) => enabledChannels.has(item.channel));
  const visibleTotal = visibleData.reduce((total, item) => total + item.value, 0);
  const highlightedItem =
    (hoveredChannel && visibleData.find((item) => item.channel === hoveredChannel)) ||
    visibleData[0];

  return (
    <DemoSection label="Pie chart with breakdown">
      <Widget style={{ width: 560 }}>
        <Widget.Header>
          <Widget.Title>Revenue mix</Widget.Title>
          <Widget.Legend style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {PIE_BREAKDOWN_DATA.map((item) => (
              <InteractiveLegendItem
                key={item.channel}
                active={enabledChannels.has(item.channel)}
                fill={item.fill}
                highlighted={hoveredChannel === item.channel}
                label={item.channel}
                value={item.value}
                onHover={setHoveredChannel}
                onToggle={(channel) => {
                  setHoveredChannel((current) => (current === channel ? null : current));
                  setEnabledChannels((items) => toggleLegendKey(items, channel));
                }}
              />
            ))}
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content
          style={{
            alignItems: 'center',
            display: 'grid',
            gap: 16,
            gridTemplateColumns: '240px minmax(0, 1fr)',
          }}
        >
          <PieChart height={240} width={240}>
            <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={formatPercent} />} />
            <PieChart.Pie
              data={visibleData}
              dataKey="value"
              nameKey="channel"
              innerRadius={48}
              outerRadius={92}
              paddingAngle={2}
              stroke="var(--surface)"
            >
              {visibleData.map((item) => {
                const isHighlighted = hoveredChannel === item.channel;
                const isDimmed = hoveredChannel !== null && !isHighlighted;

                return (
                  <PieChart.Cell
                    key={item.channel}
                    fill={item.fill}
                    opacity={isDimmed ? 0.42 : 1}
                    strokeWidth={isHighlighted ? 3 : 1}
                  />
                );
              })}
              <PieChart.Label
                value={`${visibleTotal}%`}
                position="center"
                fill="var(--foreground)"
                fontSize={22}
                fontWeight={700}
              />
            </PieChart.Pie>
          </PieChart>
          <div style={{ display: 'grid', gap: 12 }}>
            <KpiGroup orientation="vertical">
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>Visible share</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>{visibleTotal}%</Kpi.Value>
                </Kpi.Content>
              </Kpi>
              <KpiGroup.Separator />
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>Active segments</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>{visibleData.length}</Kpi.Value>
                </Kpi.Content>
              </Kpi>
            </KpiGroup>
            {highlightedItem && (
              <ChartTooltip>
                <ChartTooltip.Header>{highlightedItem.channel}</ChartTooltip.Header>
                <ChartTooltip.Item
                  indicator="dot"
                  indicatorColor={highlightedItem.fill}
                  label="Share"
                  value={`${highlightedItem.value}%`}
                />
                <ChartTooltip.Item label="Visible total" value={`${visibleTotal}%`} />
              </ChartTooltip>
            )}
          </div>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

const PieVariantDemo = ({ variant }: { variant: PieVariant }) => {
  if (variant === 'with-breakdown') {
    return <PieBreakdownDemo />;
  }

  if (variant === 'nested-donut') {
    return (
      <DemoSection label="Nested donut chart">
        <PieChart height={260} width={280}>
          <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={formatPercent} />} />
          <PieChart.Pie data={NESTED_PIE_INNER_DATA} dataKey="value" nameKey="channel" innerRadius={42} outerRadius={66} paddingAngle={2} />
          <PieChart.Pie data={NESTED_PIE_OUTER_DATA} dataKey="value" nameKey="channel" innerRadius={78} outerRadius={108} paddingAngle={2} />
        </PieChart>
      </DemoSection>
    );
  }

  if (variant === 'donut-with-content' || variant === 'donut-with-label') {
    return (
      <DemoSection label={variant === 'donut-with-content' ? 'Donut with center content' : 'Donut with labels'}>
        <PieChart height={260} width={280}>
          <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={formatPercent} />} />
          <PieChart.Pie
            data={PIE_BREAKDOWN_DATA}
            dataKey="value"
            nameKey="channel"
            innerRadius={62}
            outerRadius={96}
            paddingAngle={2}
            label={variant === 'donut-with-label'}
            labelLine={false}
          >
            {variant === 'donut-with-content' && (
              <PieChart.Label value="100%" position="center" fill="var(--foreground)" fontSize={24} fontWeight={700} />
            )}
          </PieChart.Pie>
        </PieChart>
      </DemoSection>
    );
  }

  if (variant === 'custom-tooltip') {
    return (
      <DemoSection label="Pie chart custom tooltip">
        <PieChart height={240} width={260}>
          <PieChart.Tooltip
            content={
              <PieChart.TooltipContent
                indicator="line"
                labelFormatter={(label) => (label ? `Segment ${label}` : 'Segment')}
                valueFormatter={(value) => `${value}% share`}
              />
            }
          />
          <PieChart.Pie data={PIE_BREAKDOWN_DATA} dataKey="value" nameKey="channel" outerRadius={92} paddingAngle={3} />
        </PieChart>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant === 'donut' ? 'Donut chart' : 'Default pie chart'}>
      <PieChart height={240} width={260}>
        <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={formatPercent} />} />
        <PieChart.Pie
          data={PIE_BREAKDOWN_DATA}
          dataKey="value"
          nameKey="channel"
          innerRadius={variant === 'donut' ? 58 : 0}
          outerRadius={92}
          paddingAngle={variant === 'donut' ? 2 : 1}
        />
      </PieChart>
    </DemoSection>
  );
};

const RadarVariantDemo = ({ variant }: { variant: RadarVariant }) => (
  <DemoSection label={`Radar chart ${variant.split('-').join(' ')}`}>
    <RadarChart data={variant === 'default' ? RADAR_DATA : RADAR_COMPARE_DATA} height={280} width={380}>
      <RadarChart.Grid gridType="polygon" />
      <RadarChart.AngleAxis dataKey="subject" />
      {variant === 'with-radius-axis' && <RadarChart.RadiusAxis angle={90} domain={[0, 100]} />}
      {(variant === 'comparison' || variant === 'multi-series') && (
        <RadarChart.Radar
          name="Previous"
          dataKey="previous"
          stroke="var(--chart-2)"
          fill="var(--chart-2)"
          fillOpacity={0.08}
          strokeWidth={2}
        />
      )}
      {variant === 'multi-series' && (
        <RadarChart.Radar
          name="Target"
          dataKey="target"
          stroke="var(--chart-1)"
          fill="var(--chart-1)"
          fillOpacity={0.06}
          strokeWidth={2}
        />
      )}
      <RadarChart.Radar
        name={variant === 'default' ? 'Score' : 'Current'}
        dataKey={variant === 'default' ? 'score' : 'current'}
        stroke={variant === 'dots-only' ? 'transparent' : 'var(--chart-4)'}
        fill="var(--chart-4)"
        fillOpacity={variant === 'dots-only' ? 0 : 0.16}
        strokeWidth={2}
        dot={variant === 'dots-only' ? { r: 4, fill: 'var(--chart-4)' } : false}
      />
      <RadarChart.Tooltip content={<RadarChart.TooltipContent valueFormatter={formatPercent} />} />
    </RadarChart>
  </DemoSection>
);

const RadialLegendDemo = () => {
  const [enabledMetrics, setEnabledMetrics] = useState<Set<string>>(
    () => new Set(RADIAL_LEGEND_DATA.map((item) => item.label)),
  );
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const visibleData = RADIAL_LEGEND_DATA.filter((item) => enabledMetrics.has(item.label));
  const averageScore = Math.round(
    visibleData.reduce((total, item) => total + item.value, 0) / visibleData.length,
  );
  const topMetric = visibleData.reduce<(typeof RADIAL_LEGEND_DATA)[number] | undefined>(
    (current, item) => (!current || item.value > current.value ? item : current),
    undefined,
  );
  const highlightedMetric =
    (hoveredMetric && visibleData.find((item) => item.label === hoveredMetric)) || topMetric;

  return (
    <DemoSection label="Radial chart with legend">
      <Widget style={{ width: 560 }}>
        <Widget.Header>
          <Widget.Title>Health score</Widget.Title>
          <Widget.Legend style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {RADIAL_LEGEND_DATA.map((item) => (
              <InteractiveLegendItem
                key={item.label}
                active={enabledMetrics.has(item.label)}
                fill={item.fill}
                highlighted={hoveredMetric === item.label}
                label={item.label}
                value={item.value}
                onHover={setHoveredMetric}
                onToggle={(metric) => {
                  setHoveredMetric((current) => (current === metric ? null : current));
                  setEnabledMetrics((items) => toggleLegendKey(items, metric));
                }}
              />
            ))}
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content
          style={{
            alignItems: 'center',
            display: 'grid',
            gap: 16,
            gridTemplateColumns: '240px minmax(0, 1fr)',
          }}
        >
          <RadialChart data={visibleData} height={240} width={240} innerRadius="28%" outerRadius="100%" barSize={12}>
            <RadialChart.Tooltip content={<RadialChart.TooltipContent valueFormatter={formatPercent} />} />
            <RadialChart.Bar dataKey="value" name="Score" background cornerRadius={8}>
              {visibleData.map((item) => {
                const isHighlighted = hoveredMetric === item.label;
                const isDimmed = hoveredMetric !== null && !isHighlighted;

                return (
                  <RadialChart.Cell
                    key={item.label}
                    fill={item.fill}
                    opacity={isDimmed ? 0.36 : 1}
                  />
                );
              })}
            </RadialChart.Bar>
          </RadialChart>
          <div style={{ display: 'grid', gap: 12 }}>
            <KpiGroup orientation="horizontal">
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>Average</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>{averageScore}%</Kpi.Value>
                </Kpi.Content>
              </Kpi>
              <KpiGroup.Separator />
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>Top metric</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>{topMetric?.value ?? 0}%</Kpi.Value>
                </Kpi.Content>
              </Kpi>
            </KpiGroup>
            {highlightedMetric && (
              <ChartTooltip>
                <ChartTooltip.Header>{highlightedMetric.label}</ChartTooltip.Header>
                <ChartTooltip.Item
                  indicator="line"
                  indicatorColor={highlightedMetric.fill}
                  label="Score"
                  value={`${highlightedMetric.value}%`}
                />
                <ChartTooltip.Item label="Visible rings" value={visibleData.length} />
              </ChartTooltip>
            )}
          </div>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

const RadialVariantDemo = ({ variant }: { variant: RadialVariant }) => {
  if (variant === 'gauge' || variant === 'gauge-grid') {
    return (
      <DemoSection label={variant === 'gauge-grid' ? 'Gauge with scale' : 'Gauge radial chart'}>
        <RadialChart
          data={RADIAL_PROGRESS_DATA}
          height={220}
          width={280}
          innerRadius="70%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          barSize={16}
        >
          <RadialChart.AngleAxis
            type="number"
            domain={[0, 100]}
            tick={variant === 'gauge-grid'}
            tickLine={false}
            axisLine={false}
          />
          <RadialChart.Tooltip content={<RadialChart.TooltipContent valueFormatter={formatPercent} />} />
          <RadialChart.Bar dataKey="value" name="Progress" background cornerRadius={10}>
            <RadialChart.Cell fill="var(--chart-4)" />
          </RadialChart.Bar>
        </RadialChart>
      </DemoSection>
    );
  }

  if (variant === 'progress-ring') {
    return (
      <DemoSection label="Progress ring">
        <RadialChart data={RADIAL_PROGRESS_DATA} height={220} width={220} innerRadius="68%" outerRadius="100%" barSize={14}>
          <RadialChart.Tooltip content={<RadialChart.TooltipContent valueFormatter={formatPercent} />} />
          <RadialChart.Bar dataKey="value" name="Progress" background cornerRadius={10}>
            <RadialChart.Cell fill="var(--chart-4)" />
          </RadialChart.Bar>
        </RadialChart>
      </DemoSection>
    );
  }

  if (variant === 'with-legend') {
    return <RadialLegendDemo />;
  }

  return (
    <DemoSection label="Default radial chart">
      <RadialChart data={RADIAL_RINGS} height={240} width={240} innerRadius="30%" outerRadius="100%" barSize={12}>
        <RadialChart.Tooltip content={<RadialChart.TooltipContent valueFormatter={formatPercent} />} />
        <RadialChart.Bar dataKey="value" name="Score" background cornerRadius={8}>
          <RadialChart.Cell fill="var(--chart-4)" />
          <RadialChart.Cell fill="var(--chart-3)" />
          <RadialChart.Cell fill="var(--chart-2)" />
        </RadialChart.Bar>
      </RadialChart>
    </DemoSection>
  );
};

export const chartsVariantDemos: Record<string, ReactNode> = {
  'area-chart-custom-tooltip': <AreaVariantDemo variant="custom-tooltip" />,
  'area-chart-default': <AreaVariantDemo variant="default" />,
  'area-chart-kpi-with-area-chart': <AreaVariantDemo variant="kpi-with-area-chart" />,
  'area-chart-multi-area': <AreaVariantDemo variant="multi-area" />,
  'area-chart-sparkline': <AreaVariantDemo variant="sparkline" />,
  'area-chart-stacked': <AreaVariantDemo variant="stacked" />,
  'bar-chart-comparison': <BarVariantDemo variant="comparison" />,
  'bar-chart-custom-tooltip': <BarVariantDemo variant="custom-tooltip" />,
  'bar-chart-default': <BarVariantDemo variant="default" />,
  'bar-chart-grouped': <BarVariantDemo variant="grouped" />,
  'bar-chart-horizontal': <BarVariantDemo variant="horizontal" />,
  'bar-chart-horizontal-stacked': <BarVariantDemo variant="horizontal-stacked" />,
  'bar-chart-kpi-with-bar-chart': <BarVariantDemo variant="kpi-with-bar-chart" />,
  'bar-chart-stacked': <BarVariantDemo variant="stacked" />,
  'chart-tooltip-auto-content': <ChartTooltipVariantDemo variant="auto-content" />,
  'chart-tooltip-chart-colors': <ChartTooltipVariantDemo variant="chart-colors" />,
  'chart-tooltip-custom-formatters': <ChartTooltipVariantDemo variant="custom-formatters" />,
  'chart-tooltip-default': <ChartTooltipVariantDemo variant="default" />,
  'chart-tooltip-inactive': <ChartTooltipVariantDemo variant="inactive" />,
  'chart-tooltip-line-indicator': <ChartTooltipVariantDemo variant="line-indicator" />,
  'chart-tooltip-no-header': <ChartTooltipVariantDemo variant="no-header" />,
  'composed-chart-area-with-line': <ComposedVariantDemo variant="area-with-line" />,
  'composed-chart-bar-with-area': <ComposedVariantDemo variant="bar-with-area" />,
  'composed-chart-default': <ComposedVariantDemo variant="default" />,
  'composed-chart-multi-type': <ComposedVariantDemo variant="multi-type" />,
  'composed-chart-stacked-bar-with-line': <ComposedVariantDemo variant="stacked-bar-with-line" />,
  'line-chart-custom-tooltip': <LineVariantDemo variant="custom-tooltip" />,
  'line-chart-dashed-comparison': <LineVariantDemo variant="dashed-comparison" />,
  'line-chart-default': <LineVariantDemo variant="default" />,
  'line-chart-kpi-with-chart': <LineVariantDemo variant="kpi-with-chart" />,
  'line-chart-multi-line-chart-colors': <LineVariantDemo variant="multi-line-chart-colors" />,
  'line-chart-portfolio': <LineVariantDemo variant="portfolio" />,
  'line-chart-sparkline': <LineVariantDemo variant="sparkline" />,
  'line-chart-stats-with-chart': <LineVariantDemo variant="stats-with-chart" />,
  'line-chart-traffic-source': <LineVariantDemo variant="traffic-source" />,
  'line-chart-with-dots': <LineVariantDemo variant="with-dots" />,
  'pie-chart-custom-tooltip': <PieVariantDemo variant="custom-tooltip" />,
  'pie-chart-default': <PieVariantDemo variant="default" />,
  'pie-chart-donut': <PieVariantDemo variant="donut" />,
  'pie-chart-donut-with-content': <PieVariantDemo variant="donut-with-content" />,
  'pie-chart-donut-with-label': <PieVariantDemo variant="donut-with-label" />,
  'pie-chart-nested-donut': <PieVariantDemo variant="nested-donut" />,
  'pie-chart-with-breakdown': <PieVariantDemo variant="with-breakdown" />,
  'radar-chart-comparison': <RadarVariantDemo variant="comparison" />,
  'radar-chart-default': <RadarVariantDemo variant="default" />,
  'radar-chart-dots-only': <RadarVariantDemo variant="dots-only" />,
  'radar-chart-multi-series': <RadarVariantDemo variant="multi-series" />,
  'radar-chart-with-radius-axis': <RadarVariantDemo variant="with-radius-axis" />,
  'radial-chart-default': <RadialVariantDemo variant="default" />,
  'radial-chart-gauge': <RadialVariantDemo variant="gauge" />,
  'radial-chart-gauge-grid': <RadialVariantDemo variant="gauge-grid" />,
  'radial-chart-progress-ring': <RadialVariantDemo variant="progress-ring" />,
  'radial-chart-with-legend': <RadialVariantDemo variant="with-legend" />,
};
