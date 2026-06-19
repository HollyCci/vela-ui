import { type ReactNode } from 'react';
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
import Segment from '../../components/segment';
import DemoSection from '../demo-section';

// 12 个月营收序列（对齐 Pro Area/Line/Bar/Composed 的 Usage 示例形态）
const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 4600 },
  { month: 'Mar', revenue: 5300 },
  { month: 'Apr', revenue: 6100 },
  { month: 'May', revenue: 5700 },
  { month: 'Jun', revenue: 6900 },
  { month: 'Jul', revenue: 7400 },
  { month: 'Aug', revenue: 7100 },
  { month: 'Sep', revenue: 8200 },
  { month: 'Oct', revenue: 8800 },
  { month: 'Nov', revenue: 9100 },
  { month: 'Dec', revenue: 10400 },
];

// Sessions：Organic / Paid Ads 两条面积/折线序列（对齐 Pro Sessions / Traffic Source 示例）
const SESSIONS_DATA = [
  { month: 'Jan', organic: 7200, paidAds: 3100 },
  { month: 'Feb', organic: 8900, paidAds: 5400 },
  { month: 'Mar', organic: 8100, paidAds: 7200 },
  { month: 'Apr', organic: 9600, paidAds: 6800 },
  { month: 'May', organic: 11200, paidAds: 5900 },
  { month: 'Jun', organic: 10800, paidAds: 7100 },
  { month: 'Jul', organic: 12400, paidAds: 7600 },
  { month: 'Aug', organic: 13100, paidAds: 8200 },
  { month: 'Sep', organic: 14200, paidAds: 8600 },
  { month: 'Oct', organic: 13600, paidAds: 8900 },
  { month: 'Nov', organic: 15100, paidAds: 9200 },
  { month: 'Dec', organic: 14400, paidAds: 9000 },
];

const AreaChartDemo = () => (
  <DemoSection label="Monthly Revenue" isColumn>
    <Widget style={{ width: 560 }}>
      <Widget.Header>
        <Widget.Title>Monthly Revenue</Widget.Title>
      </Widget.Header>
      <Widget.Content>
        <AreaChart data={MONTHLY_REVENUE} height={220}>
          <defs>
            <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.24} />
              <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <AreaChart.Grid vertical={false} />
          <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
          <AreaChart.YAxis tickLine={false} axisLine={false} width={44} tickFormatter={formatThousands} />
          <AreaChart.Tooltip cursor content={<AreaChart.TooltipContent indicator="dot" valueFormatter={formatCurrency} />} />
          <AreaChart.Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--chart-3)"
            strokeWidth={2}
            fill="url(#rev-fill)"
            fillOpacity={1}
            dot={false}
          />
        </AreaChart>
      </Widget.Content>
    </Widget>
  </DemoSection>
);

const BAR_DAILY_SALES = [
  { month: 'Jan', units: 18 },
  { month: 'Feb', units: 28 },
  { month: 'Mar', units: 24 },
  { month: 'Apr', units: 36 },
  { month: 'May', units: 31 },
  { month: 'Jun', units: 44 },
  { month: 'Jul', units: 33 },
  { month: 'Aug', units: 50 },
  { month: 'Sep', units: 42 },
  { month: 'Oct', units: 58 },
  { month: 'Nov', units: 48 },
  { month: 'Dec', units: 54 },
];

const BarChartDemo = () => (
  <DemoSection label="Daily Sales" isColumn>
    <Widget style={{ width: 560 }}>
      <Widget.Header>
        <div>
          <Widget.Title>Daily Sales</Widget.Title>
          <Widget.Description>Units sold per month</Widget.Description>
        </div>
        <TrendChip trend="up" value="12.5%" size="sm" />
      </Widget.Header>
      <Widget.Content>
        <BarChart data={BAR_DAILY_SALES} height={220}>
          <BarChart.Grid vertical={false} />
          <BarChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
          <BarChart.YAxis tickLine={false} axisLine={false} width={32} />
          <BarChart.Tooltip cursor content={<BarChart.TooltipContent indicator="dot" />} />
          <BarChart.Bar dataKey="units" name="Units" fill="var(--chart-4)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </Widget.Content>
    </Widget>
  </DemoSection>
);

const LineChartDemo = () => (
  <DemoSection label="Traffic Source" isColumn>
    <Widget style={{ width: 560 }}>
      <Widget.Header>
        <div>
          <Widget.Title>Traffic Source</Widget.Title>
          <Kpi.Value style={{ marginTop: 6 }}>231,856</Kpi.Value>
          <Widget.Description>Sessions</Widget.Description>
        </div>
        <Widget.Legend>
          <Widget.LegendItem color="var(--chart-4)">Organic</Widget.LegendItem>
          <Widget.LegendItem color="var(--chart-1)">Paid Ads</Widget.LegendItem>
        </Widget.Legend>
      </Widget.Header>
      <Widget.Content>
        <LineChart data={SESSIONS_DATA} height={220}>
          <LineChart.Grid vertical={false} />
          <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
          <LineChart.YAxis tickLine={false} axisLine={false} width={40} tickFormatter={formatThousands} />
          <LineChart.Tooltip
            cursor={{ strokeDasharray: '4 4' }}
            content={<LineChart.TooltipContent indicator="line" formatter={formatNumber} />}
          />
          <LineChart.Line
            type="monotone"
            dataKey="organic"
            name="Organic"
            stroke="var(--chart-4)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <LineChart.Line
            type="monotone"
            dataKey="paidAds"
            name="Paid Ads"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </Widget.Content>
    </Widget>
  </DemoSection>
);

// Revenue & Orders：柱(营收) + 线(订单)，双 Y 轴（对齐 Pro Composed Usage 示例）
const REVENUE_ORDERS_DATA = [
  { month: 'Jan', revenue: 3600, orders: 320 },
  { month: 'Feb', revenue: 4400, orders: 380 },
  { month: 'Mar', revenue: 4000, orders: 360 },
  { month: 'Apr', revenue: 5300, orders: 460 },
  { month: 'May', revenue: 5100, orders: 440 },
  { month: 'Jun', revenue: 6500, orders: 560 },
  { month: 'Jul', revenue: 6300, orders: 540 },
  { month: 'Aug', revenue: 7200, orders: 620 },
  { month: 'Sep', revenue: 7000, orders: 600 },
  { month: 'Oct', revenue: 8400, orders: 720 },
  { month: 'Nov', revenue: 8100, orders: 700 },
  { month: 'Dec', revenue: 9600, orders: 840 },
];

const ComposedChartDemo = () => (
  <DemoSection label="Revenue & Orders" isColumn>
    <Widget style={{ width: 600 }}>
      <Widget.Header>
        <Widget.Title>Revenue &amp; Orders</Widget.Title>
        <Widget.Legend>
          <Widget.LegendItem color="var(--chart-4)">Revenue</Widget.LegendItem>
          <Widget.LegendItem color="var(--chart-1)">Orders</Widget.LegendItem>
        </Widget.Legend>
      </Widget.Header>
      <Widget.Content>
        <ComposedChart data={REVENUE_ORDERS_DATA} height={260}>
          <ComposedChart.Grid vertical={false} />
          <ComposedChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
          <ComposedChart.YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={formatThousands}
          />
          <ComposedChart.YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <ComposedChart.Tooltip content={<ComposedChart.TooltipContent />} />
          <ComposedChart.Bar
            yAxisId="left"
            dataKey="revenue"
            name="Revenue"
            fill="var(--chart-4)"
            radius={[6, 6, 0, 0]}
            barSize={16}
          />
          <ComposedChart.Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </Widget.Content>
    </Widget>
  </DemoSection>
);

const PIE_BROWSER_DATA = [
  { browser: 'Chrome', visitors: 275, fill: 'var(--chart-4)' },
  { browser: 'Safari', visitors: 200, fill: 'var(--chart-3)' },
  { browser: 'Firefox', visitors: 187, fill: 'var(--chart-1)' },
  { browser: 'Edge', visitors: 173, fill: 'var(--chart-2)' },
];

const PieChartDemo = () => (
  <DemoSection label="Browser Usage">
    <Widget style={{ width: 380 }}>
      <Widget.Header>
        <Widget.Title>Browser Usage</Widget.Title>
      </Widget.Header>
      <Widget.Content style={{ alignItems: 'center' }}>
        <PieChart height={240} width={300}>
          <PieChart.Tooltip cursor={false} content={<PieChart.TooltipContent valueFormatter={formatNumber} />} />
          <PieChart.Pie
            data={PIE_BROWSER_DATA}
            dataKey="visitors"
            nameKey="browser"
            outerRadius={92}
            activeShape={<PieChart.ActiveShape />}
          />
        </PieChart>
        <Widget.Legend style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          {PIE_BROWSER_DATA.map((item) => (
            <Widget.LegendItem key={item.browser} color={item.fill}>
              {item.browser}
            </Widget.LegendItem>
          ))}
        </Widget.Legend>
      </Widget.Content>
    </Widget>
  </DemoSection>
);

// Energy Activity：3 个同心环（对齐 Pro Radial Usage 示例）
const ENERGY_RINGS = [
  { activity: 'Move', value: 81, fill: 'var(--chart-4)' },
  { activity: 'Steps', value: 83, fill: 'var(--chart-1)' },
  { activity: 'Exercise', value: 21, fill: 'var(--chart-2)' },
];

const RadialChartDemo = () => (
  <DemoSection label="Energy Activity">
    <Widget style={{ width: 380 }}>
      <Widget.Header>
        <Widget.Title>Energy Activity</Widget.Title>
      </Widget.Header>
      <Widget.Content style={{ gap: 12 }}>
        <KpiGroup orientation="vertical">
          <Kpi>
            <Kpi.Header>
              <Kpi.Title>Calories</Kpi.Title>
            </Kpi.Header>
            <Kpi.Content>
              <Kpi.Value>1,623/2,000 kcal</Kpi.Value>
            </Kpi.Content>
          </Kpi>
          <Kpi>
            <Kpi.Header>
              <Kpi.Title>Steps</Kpi.Title>
            </Kpi.Header>
            <Kpi.Content>
              <Kpi.Value>8,328/10,000 steps</Kpi.Value>
            </Kpi.Content>
          </Kpi>
          <Kpi>
            <Kpi.Header>
              <Kpi.Title>Exercise</Kpi.Title>
            </Kpi.Header>
            <Kpi.Content>
              <Kpi.Value>25/120 min</Kpi.Value>
            </Kpi.Content>
          </Kpi>
        </KpiGroup>
        <div style={{ alignSelf: 'center', position: 'relative' }}>
          <RadialChart
            data={ENERGY_RINGS}
            height={220}
            width={220}
            innerRadius="32%"
            outerRadius="100%"
            barSize={14}
          >
            <RadialChart.Tooltip cursor={false} content={<RadialChart.TooltipContent valueFormatter={formatPercent} />} />
            <RadialChart.Bar dataKey="value" name="Activity" background cornerRadius={8}>
              {ENERGY_RINGS.map((ring) => (
                <RadialChart.Cell key={ring.activity} fill={ring.fill} />
              ))}
            </RadialChart.Bar>
          </RadialChart>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              inset: 0,
              justifyContent: 'center',
              pointerEvents: 'none',
              position: 'absolute',
            }}
          >
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Calories</span>
            <span style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 700 }}>700 kcal</span>
          </div>
        </div>
      </Widget.Content>
    </Widget>
  </DemoSection>
);

// Skill Assessment：单系列雷达（对齐 Pro Radar Usage 示例）
const SKILL_DATA = [
  { subject: 'Design', score: 86 },
  { subject: 'Frontend', score: 78 },
  { subject: 'Backend', score: 62 },
  { subject: 'DevOps', score: 48 },
  { subject: 'Testing', score: 70 },
  { subject: 'Leadership', score: 66 },
];

const RadarChartDemo = () => (
  <DemoSection label="Skill Assessment">
    <Widget style={{ width: 420 }}>
      <Widget.Header>
        <Widget.Title>Skill Assessment</Widget.Title>
      </Widget.Header>
      <Widget.Content style={{ alignItems: 'center' }}>
        <RadarChart data={SKILL_DATA} height={300} width={360}>
          <RadarChart.Grid gridType="polygon" />
          <RadarChart.AngleAxis dataKey="subject" />
          <RadarChart.Radar
            name="Score"
            dataKey="score"
            stroke="var(--chart-4)"
            fill="var(--chart-4)"
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <RadarChart.Tooltip content={<RadarChart.TooltipContent />} />
        </RadarChart>
      </Widget.Content>
    </Widget>
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

// Actual vs Target：实线 + 虚线（对齐 Pro Line Dashed Comparison 示例）
const ACTUAL_TARGET_DATA = [
  { month: 'Jan', actual: 4200, target: 4000 },
  { month: 'Feb', actual: 4600, target: 4400 },
  { month: 'Mar', actual: 5300, target: 4900 },
  { month: 'Apr', actual: 5100, target: 5300 },
  { month: 'May', actual: 6100, target: 5700 },
  { month: 'Jun', actual: 6800, target: 6300 },
  { month: 'Jul', actual: 7100, target: 7000 },
  { month: 'Aug', actual: 7900, target: 7600 },
  { month: 'Sep', actual: 8400, target: 8200 },
  { month: 'Oct', actual: 8800, target: 8900 },
  { month: 'Nov', actual: 9600, target: 9400 },
  { month: 'Dec', actual: 11200, target: 10100 },
];

// Portfolio：单条余额折线（对齐 Pro Line Portfolio 示例）
const PORTFOLIO_BALANCE = [
  { month: 'W1', balance: 22400 },
  { month: 'W2', balance: 22100 },
  { month: 'W3', balance: 22600 },
  { month: 'W4', balance: 23000 },
  { month: 'W5', balance: 22700 },
  { month: 'W6', balance: 23400 },
  { month: 'W7', balance: 23200 },
  { month: 'W8', balance: 23700 },
  { month: 'W9', balance: 23500 },
  { month: 'W10', balance: 24100 },
  { month: 'W11', balance: 23900 },
  { month: 'W12', balance: 24801 },
];

// Browser / Market share（对齐 Pro Pie Usage / Custom Tooltip 示例）
const PIE_SHARE_DATA = [
  { channel: 'Chrome', value: 275, fill: 'var(--chart-4)' },
  { channel: 'Safari', value: 200, fill: 'var(--chart-3)' },
  { channel: 'Firefox', value: 187, fill: 'var(--chart-1)' },
  { channel: 'Edge', value: 173, fill: 'var(--chart-2)' },
];

// Traffic Sources：donut（对齐 Pro Pie Donut 示例）
const PIE_TRAFFIC_DATA = [
  { channel: 'Organic', value: 4500, fill: 'var(--chart-4)' },
  { channel: 'Direct', value: 3200, fill: 'var(--chart-1)' },
  { channel: 'Referral', value: 2100, fill: 'var(--chart-2)' },
  { channel: 'Social', value: 1400, fill: 'var(--chart-3)' },
];

// Connected Devices：donut with content（对齐 Pro Pie Donut With Content 示例）
const PIE_DEVICES_DATA = [
  { channel: 'Mobile', value: 2800, share: 62, fill: 'var(--chart-4)' },
  { channel: 'Desktop', value: 1200, share: 27, fill: 'var(--chart-1)' },
  { channel: 'Tablet', value: 500, share: 11, fill: 'var(--chart-2)' },
];

// Storage Usage：donut with label（对齐 Pro Pie Donut With Label 示例）
const PIE_STORAGE_DATA = [
  { channel: 'Documents', value: 42, fill: 'var(--chart-4)' },
  { channel: 'Media', value: 28, fill: 'var(--chart-3)' },
  { channel: 'Apps', value: 18, fill: 'var(--chart-1)' },
  { channel: 'Other', value: 12, fill: 'var(--chart-2)' },
];

// Revenue: This Year vs Last：nested donut（对齐 Pro Pie Nested Donut 示例）
const NESTED_PIE_INNER_DATA = [
  { channel: 'Q1', value: 18, fill: 'var(--chart-4)' },
  { channel: 'Q2', value: 22, fill: 'var(--chart-3)' },
  { channel: 'Q3', value: 26, fill: 'var(--chart-1)' },
  { channel: 'Q4', value: 30, fill: 'var(--chart-2)' },
];

const NESTED_PIE_OUTER_DATA = [
  { channel: 'Q1', value: 22, fill: 'var(--chart-4)' },
  { channel: 'Q2', value: 26, fill: 'var(--chart-3)' },
  { channel: 'Q3', value: 30, fill: 'var(--chart-1)' },
  { channel: 'Q4', value: 36, fill: 'var(--chart-2)' },
];

// Users by Plan：with breakdown（对齐 Pro Pie With Breakdown 示例）
const PIE_BREAKDOWN_DATA = [
  { channel: 'Enterprise', value: 340, fill: 'var(--chart-4)' },
  { channel: 'Pro', value: 520, fill: 'var(--chart-1)' },
  { channel: 'Starter', value: 280, fill: 'var(--chart-2)' },
];

// Skill Assessment / Performance Metrics 雷达轴
const RADAR_SKILL_DATA = [
  { subject: 'Design', score: 86 },
  { subject: 'Frontend', score: 78 },
  { subject: 'Backend', score: 62 },
  { subject: 'DevOps', score: 48 },
  { subject: 'Testing', score: 70 },
  { subject: 'Leadership', score: 66 },
];

// Platform Comparison / Sprint Velocity 雷达轴
const RADAR_PLATFORM_DATA = [
  { subject: 'Speed', current: 80, previous: 64, target: 90 },
  { subject: 'Reliability', current: 72, previous: 60, target: 85 },
  { subject: 'Security', current: 68, previous: 58, target: 82 },
  { subject: 'UX', current: 84, previous: 70, target: 92 },
  { subject: 'Performance', current: 76, previous: 62, target: 88 },
  { subject: 'Scalability', current: 70, previous: 56, target: 80 },
];

// Device Usage 雷达（Jan-Jun 轴，3 系列）
const RADAR_DEVICE_DATA = [
  { subject: 'Jan', desktop: 78, mobile: 52, tablet: 30 },
  { subject: 'Feb', desktop: 82, mobile: 58, tablet: 34 },
  { subject: 'Mar', desktop: 74, mobile: 50, tablet: 28 },
  { subject: 'Apr', desktop: 88, mobile: 62, tablet: 36 },
  { subject: 'May', desktop: 80, mobile: 56, tablet: 32 },
  { subject: 'Jun', desktop: 84, mobile: 60, tablet: 38 },
];

const RADIAL_PROGRESS_DATA = [
  { label: 'Progress', value: 75, fill: 'var(--chart-4)' },
];

// Storage Breakdown：with legend 同心环（对齐 Pro Radial With Legend 示例）
const RADIAL_LEGEND_DATA = [
  { label: 'Documents', value: 42, fill: 'var(--chart-4)' },
  { label: 'Media', value: 28, fill: 'var(--chart-1)' },
  { label: 'System', value: 18, fill: 'var(--chart-2)' },
];

const formatNumber = (value: number | string) => Number(value).toLocaleString();
const formatCurrency = (value: number | string) => `$${Number(value).toLocaleString()}`;
const formatPercent = (value: number | string) => `${value}%`;
const formatThousands = (value: number | string) => {
  const num = Number(value);
  return num >= 1000 ? `${num / 1000}k` : `${num}`;
};

// 用于 KPI / Sparkline 三连卡（Revenue ↑ / Bounce|Churn ↓ / Active|Users ↑）
const SPARK_UP = [
  { i: 'Jan', v: 12 },
  { i: 'Feb', v: 15 },
  { i: 'Mar', v: 13 },
  { i: 'Apr', v: 18 },
  { i: 'May', v: 17 },
  { i: 'Jun', v: 22 },
  { i: 'Jul', v: 21 },
  { i: 'Aug', v: 26 },
  { i: 'Sep', v: 28 },
  { i: 'Oct', v: 27 },
  { i: 'Nov', v: 31 },
  { i: 'Dec', v: 35 },
];

const SPARK_DOWN = [
  { i: 'Jan', v: 34 },
  { i: 'Feb', v: 33 },
  { i: 'Mar', v: 31 },
  { i: 'Apr', v: 32 },
  { i: 'May', v: 29 },
  { i: 'Jun', v: 28 },
  { i: 'Jul', v: 27 },
  { i: 'Aug', v: 25 },
  { i: 'Sep', v: 24 },
  { i: 'Oct', v: 22 },
  { i: 'Nov', v: 21 },
  { i: 'Dec', v: 19 },
];

// 三连 Sparkline 卡片（Area / Line 共用，对齐 Pro Sparkline 示例）
const SparklineTriple = ({ kind }: { kind: 'area' | 'line' }) => {
  const cards = [
    { color: 'var(--chart-success, #16a34a)', data: SPARK_UP, id: 'revenue', label: 'Revenue' },
    { color: 'var(--chart-danger, #ef4444)', data: SPARK_DOWN, id: 'churn', label: 'Churn' },
    { color: 'var(--chart-1)', data: SPARK_UP, id: 'users', label: 'Users' },
  ];

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {cards.map((card) => (
        <div key={card.id} style={{ width: 200 }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{card.label}</span>
          {kind === 'area' ? (
            <AreaChart data={card.data} height={64} margin={{ top: 6, right: 2, bottom: 2, left: 2 }}>
              <defs>
                <linearGradient id={`spark-${card.id}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={card.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={card.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <AreaChart.Tooltip cursor={false} content={<AreaChart.TooltipContent />} />
              <AreaChart.Area
                type="monotone"
                dataKey="v"
                name={card.label}
                stroke={card.color}
                strokeWidth={2}
                fill={`url(#spark-${card.id})`}
                dot={false}
              />
            </AreaChart>
          ) : (
            <LineChart data={card.data} height={64} margin={{ top: 6, right: 2, bottom: 2, left: 2 }}>
              <LineChart.Tooltip cursor={false} content={<LineChart.TooltipContent hideLabel />} />
              <LineChart.Line
                type="monotone"
                dataKey="v"
                name={card.label}
                stroke={card.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </div>
      ))}
    </div>
  );
};

// KPI + 内嵌图三连卡（Area / Line 共用，对齐 Pro KPI With Chart 示例）
const KPI_CARDS = [
  {
    chartColor: 'var(--chart-1)',
    delta: '3.3%',
    deltaSuffix: 'last 30d',
    id: 'revenue',
    title: 'Total Revenue',
    trend: 'up' as const,
    value: 'US$228,451',
  },
  {
    chartColor: 'var(--chart-danger, #ef4444)',
    delta: '5.9%',
    deltaSuffix: 'vs last 7d',
    id: 'bounce',
    title: 'Bounce Rate',
    trend: 'down' as const,
    value: '42.3%',
  },
  {
    chartColor: 'var(--chart-success, #16a34a)',
    delta: '1.0%',
    deltaSuffix: 'this week',
    id: 'customers',
    title: 'New Customers',
    trend: 'up' as const,
    value: '1,234',
  },
];

const KpiWithChartTriple = ({ kind }: { kind: 'area' | 'line' }) => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    {KPI_CARDS.map((card) => {
      const data = card.trend === 'down' ? SPARK_DOWN : SPARK_UP;
      return (
        <Widget key={card.id} style={{ width: 320 }}>
          <Widget.Content
            style={{
              alignItems: 'center',
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'minmax(0, 1fr) 120px',
            }}
          >
            <div>
              <Widget.Description>{card.title}</Widget.Description>
              <Kpi.Value style={{ margin: '4px 0' }}>{card.value}</Kpi.Value>
              <TrendChip trend={card.trend} value={card.delta} suffix={card.deltaSuffix} size="sm" />
            </div>
            {kind === 'area' ? (
              <AreaChart data={data} height={56} margin={{ top: 6, right: 2, bottom: 2, left: 2 }}>
                <defs>
                  <linearGradient id={`kpi-${card.id}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={card.chartColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={card.chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <AreaChart.Tooltip cursor={false} content={<AreaChart.TooltipContent />} />
                <AreaChart.Area
                  type="monotone"
                  dataKey="v"
                  name={card.title}
                  stroke={card.chartColor}
                  strokeWidth={2}
                  fill={`url(#kpi-${card.id})`}
                  dot={false}
                />
              </AreaChart>
            ) : (
              <LineChart data={data} height={56} margin={{ top: 6, right: 2, bottom: 2, left: 2 }}>
                <LineChart.Tooltip cursor={false} content={<LineChart.TooltipContent hideLabel />} />
                <LineChart.Line
                  type="monotone"
                  dataKey="v"
                  name={card.title}
                  stroke={card.chartColor}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </Widget.Content>
        </Widget>
      );
    })}
  </div>
);

// Traffic Breakdown：4 系列堆叠面积（对齐 Pro Area Stacked 示例）
const TRAFFIC_STACK_DATA = [
  { month: 'Jan', organic: 4200, paidAds: 2100, referral: 1200, direct: 900 },
  { month: 'Feb', organic: 4800, paidAds: 2400, referral: 1400, direct: 1000 },
  { month: 'Mar', organic: 5100, paidAds: 2800, referral: 1500, direct: 1100 },
  { month: 'Apr', organic: 5600, paidAds: 3100, referral: 1700, direct: 1200 },
  { month: 'May', organic: 6200, paidAds: 3400, referral: 1800, direct: 1300 },
  { month: 'Jun', organic: 6800, paidAds: 3600, referral: 2000, direct: 1400 },
  { month: 'Jul', organic: 7200, paidAds: 3900, referral: 2100, direct: 1500 },
  { month: 'Aug', organic: 7800, paidAds: 4100, referral: 2300, direct: 1600 },
  { month: 'Sep', organic: 8200, paidAds: 4400, referral: 2400, direct: 1700 },
  { month: 'Oct', organic: 8800, paidAds: 4600, referral: 2600, direct: 1800 },
  { month: 'Nov', organic: 9100, paidAds: 4900, referral: 2700, direct: 1900 },
  { month: 'Dec', organic: 9600, paidAds: 5100, referral: 2900, direct: 2000 },
];

const AreaVariantDemo = ({ variant }: { variant: AreaVariant }) => {
  if (variant === 'kpi-with-area-chart') {
    return (
      <DemoSection label="KPI With Area Chart" isColumn>
        <KpiWithChartTriple kind="area" />
      </DemoSection>
    );
  }

  if (variant === 'sparkline') {
    return (
      <DemoSection label="Sparkline" isColumn>
        <SparklineTriple kind="area" />
      </DemoSection>
    );
  }

  if (variant === 'multi-area') {
    return (
      <DemoSection label="Multi Area" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <div>
              <Widget.Title>Traffic Sources</Widget.Title>
              <Kpi.Value style={{ marginTop: 6 }}>231,856</Kpi.Value>
              <Widget.Description>Sessions</Widget.Description>
            </div>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Organic</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Paid Ads</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <AreaChart data={SESSIONS_DATA} height={240}>
              <defs>
                <linearGradient id="multi-organic" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="multi-paid" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <AreaChart.Grid vertical={false} />
              <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <AreaChart.YAxis tickLine={false} axisLine={false} width={40} tickFormatter={formatThousands} />
              <AreaChart.Tooltip content={<AreaChart.TooltipContent valueFormatter={formatNumber} />} />
              <AreaChart.Area
                type="monotone"
                dataKey="organic"
                name="Organic"
                stroke="var(--chart-4)"
                fill="url(#multi-organic)"
                strokeWidth={2}
                dot={false}
              />
              <AreaChart.Area
                type="monotone"
                dataKey="paidAds"
                name="Paid Ads"
                stroke="var(--chart-1)"
                fill="url(#multi-paid)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'stacked') {
    return (
      <DemoSection label="Stacked" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Traffic Breakdown</Widget.Title>
            <Widget.Legend style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Widget.LegendItem color="var(--chart-4)">Organic</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Paid Ads</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-2)">Referral</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-3)">Direct</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <AreaChart data={TRAFFIC_STACK_DATA} height={240}>
              <AreaChart.Grid vertical={false} />
              <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <AreaChart.YAxis tickLine={false} axisLine={false} width={40} tickFormatter={formatThousands} />
              <AreaChart.Tooltip content={<AreaChart.TooltipContent valueFormatter={formatNumber} />} />
              <AreaChart.Area
                type="monotone"
                dataKey="organic"
                name="Organic"
                stackId="traffic"
                stroke="var(--chart-4)"
                fill="var(--chart-4)"
                fillOpacity={0.7}
              />
              <AreaChart.Area
                type="monotone"
                dataKey="paidAds"
                name="Paid Ads"
                stackId="traffic"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.7}
              />
              <AreaChart.Area
                type="monotone"
                dataKey="referral"
                name="Referral"
                stackId="traffic"
                stroke="var(--chart-2)"
                fill="var(--chart-2)"
                fillOpacity={0.7}
              />
              <AreaChart.Area
                type="monotone"
                dataKey="direct"
                name="Direct"
                stackId="traffic"
                stroke="var(--chart-3)"
                fill="var(--chart-3)"
                fillOpacity={0.7}
              />
            </AreaChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'custom-tooltip') {
    return (
      <DemoSection label="Custom Tooltip" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Sessions</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Organic</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Paid Ads</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <AreaChart data={SESSIONS_DATA} height={240}>
              <defs>
                <linearGradient id="ct-organic" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ct-paid" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <AreaChart.Grid vertical={false} />
              <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <AreaChart.YAxis tickLine={false} axisLine={false} width={40} tickFormatter={formatThousands} />
              <AreaChart.Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={
                  <AreaChart.TooltipContent
                    indicator="line"
                    labelFormatter={(label) => `${label} 2025`}
                    valueFormatter={formatNumber}
                  />
                }
              />
              <AreaChart.Area
                type="monotone"
                dataKey="organic"
                name="Organic"
                stroke="var(--chart-4)"
                fill="url(#ct-organic)"
                strokeWidth={2}
                dot={false}
              />
              <AreaChart.Area
                type="monotone"
                dataKey="paidAds"
                name="Paid Ads"
                stroke="var(--chart-1)"
                fill="url(#ct-paid)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="Default" isColumn>
      <Widget style={{ width: 560 }}>
        <Widget.Header>
          <Widget.Title>Monthly Revenue</Widget.Title>
        </Widget.Header>
        <Widget.Content>
          <AreaChart data={MONTHLY_REVENUE} height={240}>
            <defs>
              <linearGradient id="area-default-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.24} />
                <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <AreaChart.Grid vertical={false} />
            <AreaChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <AreaChart.YAxis tickLine={false} axisLine={false} width={44} tickFormatter={formatThousands} />
            <AreaChart.Tooltip content={<AreaChart.TooltipContent valueFormatter={formatCurrency} />} />
            <AreaChart.Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="var(--chart-3)"
              fill="url(#area-default-fill)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

// Weekly Orders：本周 vs 上周分组柱（对齐 Pro Bar Comparison 示例）
const WEEKLY_ORDERS_DATA = [
  { day: 'Mon', thisWeek: 120, lastWeek: 88 },
  { day: 'Tue', thisWeek: 178, lastWeek: 132 },
  { day: 'Wed', thisWeek: 142, lastWeek: 160 },
  { day: 'Thu', thisWeek: 205, lastWeek: 128 },
  { day: 'Fri', thisWeek: 176, lastWeek: 152 },
  { day: 'Sat', thisWeek: 78, lastWeek: 98 },
  { day: 'Sun', thisWeek: 70, lastWeek: 72 },
];

// Revenue by Channel：Online / Retail / Direct 分组柱（对齐 Pro Bar Grouped / Custom Tooltip 示例）
const REVENUE_CHANNEL_DATA = [
  { month: 'Jan', online: 4200, retail: 2800, direct: 3200 },
  { month: 'Feb', online: 6100, retail: 3800, direct: 4100 },
  { month: 'Mar', online: 5200, retail: 3300, direct: 4400 },
  { month: 'Apr', online: 7400, retail: 4100, direct: 4900 },
  { month: 'May', online: 6300, retail: 3700, direct: 4600 },
  { month: 'Jun', online: 8600, retail: 4400, direct: 5100 },
];

// Top Products：水平柱（对齐 Pro Bar Horizontal 示例）
const TOP_PRODUCTS_DATA = [
  { product: 'Widgets', units: 1840 },
  { product: 'Gadgets', units: 1520 },
  { product: 'Modules', units: 1180 },
  { product: 'Plugins', units: 820 },
  { product: 'Add-ons', units: 560 },
];

// Avg. Energy Activity：水平堆叠柱 Low/Medium/High（对齐 Pro Bar Horizontal Stacked 示例）
const ENERGY_ACTIVITY_DATA = [
  { day: 'Mon', low: 120, medium: 180, high: 90 },
  { day: 'Tue', low: 150, medium: 200, high: 140 },
  { day: 'Wed', low: 130, medium: 170, high: 110 },
  { day: 'Thu', low: 110, medium: 190, high: 100 },
  { day: 'Fri', low: 100, medium: 160, high: 130 },
  { day: 'Sat', low: 90, medium: 140, high: 80 },
  { day: 'Sun', low: 160, medium: 210, high: 120 },
];

// Monthly Sales：KPI 内嵌柱（对齐 Pro Bar KPI With Bar Chart 示例）
const MONTHLY_SALES_BARS = [
  { month: 'Jan', units: 16 },
  { month: 'Feb', units: 22 },
  { month: 'Mar', units: 20 },
  { month: 'Apr', units: 26 },
  { month: 'May', units: 24 },
  { month: 'Jun', units: 30 },
  { month: 'Jul', units: 27 },
  { month: 'Aug', units: 34 },
  { month: 'Sep', units: 31 },
  { month: 'Oct', units: 38 },
  { month: 'Nov', units: 35 },
  { month: 'Dec', units: 36 },
];

// Revenue by Plan：Enterprise / Pro / Starter 堆叠柱（对齐 Pro Bar Stacked 示例）
const REVENUE_PLAN_DATA = [
  { quarter: 'Q1', enterprise: 18000, pro: 12000, starter: 6000 },
  { quarter: 'Q2', enterprise: 22000, pro: 14000, starter: 7000 },
  { quarter: 'Q3', enterprise: 26000, pro: 16000, starter: 8000 },
  { quarter: 'Q4', enterprise: 32000, pro: 18000, starter: 9000 },
];

const BarVariantDemo = ({ variant }: { variant: BarVariant }) => {
  if (variant === 'kpi-with-bar-chart') {
    return (
      <DemoSection label="KPI With Bar Chart" isColumn>
        <Widget style={{ width: 560 }}>
          <Widget.Header>
            <div>
              <Widget.Title>Monthly Sales</Widget.Title>
              <div style={{ alignItems: 'center', display: 'flex', gap: 10, marginTop: 6 }}>
                <Kpi.Value>278</Kpi.Value>
                <TrendChip trend="up" value="3.3%" suffix="last 30d" size="sm" />
              </div>
            </div>
          </Widget.Header>
          <Widget.Content>
            <BarChart data={MONTHLY_SALES_BARS} height={180} margin={{ top: 8, right: 2, bottom: 0, left: 2 }}>
              <BarChart.Tooltip cursor={false} content={<BarChart.TooltipContent valueFormatter={formatNumber} />} />
              <BarChart.Bar dataKey="units" name="Sales" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'horizontal') {
    return (
      <DemoSection label="Horizontal" isColumn>
        <Widget style={{ width: 560 }}>
          <Widget.Header>
            <div>
              <Widget.Title>Top Products</Widget.Title>
              <Widget.Description>Units sold this quarter</Widget.Description>
            </div>
          </Widget.Header>
          <Widget.Content>
            <BarChart
              data={TOP_PRODUCTS_DATA}
              height={240}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
            >
              <BarChart.Grid horizontal={false} />
              <BarChart.XAxis type="number" tickLine={false} axisLine={false} domain={[0, 2000]} />
              <BarChart.YAxis
                type="category"
                dataKey="product"
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatNumber} />} />
              <BarChart.Bar dataKey="units" name="Units" fill="var(--chart-4)" radius={[0, 8, 8, 0]} barSize={14} />
            </BarChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'horizontal-stacked') {
    return (
      <DemoSection label="Horizontal Stacked" isColumn>
        <Widget style={{ width: 560 }}>
          <Widget.Header>
            <div>
              <Widget.Title>Avg. Energy Activity</Widget.Title>
              <div style={{ alignItems: 'baseline', display: 'flex', gap: 6, marginTop: 4 }}>
                <Kpi.Value>580/280</Kpi.Value>
                <Widget.Description>kcal</Widget.Description>
              </div>
            </div>
          </Widget.Header>
          <Widget.Content>
            <BarChart
              data={ENERGY_ACTIVITY_DATA}
              height={240}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
            >
              <BarChart.XAxis type="number" tickLine={false} axisLine={false} hide />
              <BarChart.YAxis
                type="category"
                dataKey="day"
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatNumber} />} />
              <BarChart.Bar dataKey="low" name="Low" stackId="energy" fill="var(--chart-1)" radius={[8, 0, 0, 8]} barSize={12} />
              <BarChart.Bar dataKey="medium" name="Medium" stackId="energy" fill="var(--chart-4)" radius={[0, 0, 0, 0]} barSize={12} />
              <BarChart.Bar dataKey="high" name="High" stackId="energy" fill="var(--chart-2)" radius={[0, 8, 8, 0]} barSize={12} />
            </BarChart>
          </Widget.Content>
          <Widget.Footer>
            <Widget.Legend style={{ justifyContent: 'center' }}>
              <Widget.LegendItem color="var(--chart-1)">Low</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-4)">Medium</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-2)">High</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Footer>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'grouped' || variant === 'comparison') {
    const isComparison = variant === 'comparison';
    return (
      <DemoSection label={isComparison ? 'Comparison' : 'Grouped'} isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <div>
              <Widget.Title>{isComparison ? 'Weekly Orders' : 'Revenue by Channel'}</Widget.Title>
              {isComparison && <Widget.Description>This week vs last week</Widget.Description>}
            </div>
            <Widget.Legend>
              {isComparison ? (
                <>
                  <Widget.LegendItem color="var(--chart-4)">This week</Widget.LegendItem>
                  <Widget.LegendItem color="var(--chart-1)">Last week</Widget.LegendItem>
                </>
              ) : (
                <>
                  <Widget.LegendItem color="var(--chart-4)">Online</Widget.LegendItem>
                  <Widget.LegendItem color="var(--chart-2)">Retail</Widget.LegendItem>
                  <Widget.LegendItem color="var(--chart-1)">Direct</Widget.LegendItem>
                </>
              )}
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            {isComparison ? (
              <BarChart data={WEEKLY_ORDERS_DATA} height={240}>
                <BarChart.Grid vertical={false} />
                <BarChart.XAxis dataKey="day" tickLine={false} axisLine={false} />
                <BarChart.YAxis tickLine={false} axisLine={false} width={36} />
                <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatNumber} />} />
                <BarChart.Bar dataKey="thisWeek" name="This week" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
                <BarChart.Bar dataKey="lastWeek" name="Last week" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={REVENUE_CHANNEL_DATA} height={240}>
                <BarChart.Grid vertical={false} />
                <BarChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
                <BarChart.YAxis tickLine={false} axisLine={false} width={44} tickFormatter={formatThousands} />
                <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatCurrency} />} />
                <BarChart.Bar dataKey="online" name="Online" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                <BarChart.Bar dataKey="retail" name="Retail" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <BarChart.Bar dataKey="direct" name="Direct" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'stacked') {
    return (
      <DemoSection label="Stacked" isColumn>
        <Widget style={{ width: 560 }}>
          <Widget.Header>
            <Widget.Title>Revenue by Plan</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Enterprise</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Pro</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-2)">Starter</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <BarChart data={REVENUE_PLAN_DATA} height={240}>
              <BarChart.Grid vertical={false} />
              <BarChart.XAxis dataKey="quarter" tickLine={false} axisLine={false} />
              <BarChart.YAxis tickLine={false} axisLine={false} width={44} tickFormatter={formatThousands} />
              <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatCurrency} />} />
              <BarChart.Bar dataKey="starter" name="Starter" stackId="plan" fill="var(--chart-2)" radius={[0, 0, 0, 0]} barSize={40} />
              <BarChart.Bar dataKey="pro" name="Pro" stackId="plan" fill="var(--chart-1)" radius={[0, 0, 0, 0]} barSize={40} />
              <BarChart.Bar dataKey="enterprise" name="Enterprise" stackId="plan" fill="var(--chart-4)" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'custom-tooltip') {
    return (
      <DemoSection label="Custom Tooltip" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Revenue by Channel</Widget.Title>
          </Widget.Header>
          <Widget.Content>
            <BarChart data={REVENUE_CHANNEL_DATA} height={240}>
              <BarChart.Grid vertical={false} />
              <BarChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <BarChart.YAxis tickLine={false} axisLine={false} width={44} tickFormatter={formatThousands} />
              <BarChart.Tooltip
                cursor
                content={
                  <BarChart.TooltipContent
                    indicator="line"
                    labelFormatter={(label) => `${label} 2025`}
                    valueFormatter={formatCurrency}
                  />
                }
              />
              <BarChart.Bar dataKey="online" name="Online" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              <BarChart.Bar dataKey="retail" name="Retail" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <BarChart.Bar dataKey="direct" name="Direct" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="Default" isColumn>
      <Widget style={{ width: 560 }}>
        <Widget.Header>
          <div>
            <Widget.Title>Daily Sales</Widget.Title>
            <Widget.Description>Units sold per month</Widget.Description>
          </div>
          <TrendChip trend="up" value="12.5%" size="sm" />
        </Widget.Header>
        <Widget.Content>
          <BarChart data={BAR_DAILY_SALES} height={240}>
            <BarChart.Grid vertical={false} />
            <BarChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <BarChart.YAxis tickLine={false} axisLine={false} width={32} />
            <BarChart.Tooltip content={<BarChart.TooltipContent valueFormatter={formatNumber} />} />
            <BarChart.Bar dataKey="units" name="Units" fill="var(--chart-4)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

const ChartTooltipVariantDemo = ({ variant }: { variant: TooltipVariant }) => {
  if (variant === 'auto-content') {
    return (
      <DemoSection label="Auto Content">
        <ChartTooltip>
          <ChartTooltip.Header>February</ChartTooltip.Header>
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-4)" label="Revenue" value="18200" />
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-1)" label="Expenses" value="9800" />
        </ChartTooltip>
        <ChartTooltip>
          <ChartTooltip.Header>Q1 2025</ChartTooltip.Header>
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-4)" label="Organic" value="22000" />
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-1)" label="Paid Ads" value="14500" />
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-2)" label="Referral" value="5200" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  if (variant === 'custom-formatters') {
    return (
      <DemoSection label="Custom Formatters">
        <ChartTooltip>
          <ChartTooltip.Header>January 15, 2025</ChartTooltip.Header>
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-4)" label="Portfolio" value="$24,801.32" />
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-1)" label="Benchmark" value="$21,500" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  if (variant === 'chart-colors') {
    return (
      <DemoSection label="Chart Colors">
        <ChartTooltip>
          <ChartTooltip.Header>All Chart Colors</ChartTooltip.Header>
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-4)" label="chart-1" value="Lightest" />
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-1)" label="chart-2" value="Light" />
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-3)" label="chart-3" value="Accent" />
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-2)" label="chart-4" value="Darkest" />
        </ChartTooltip>
        <ChartTooltip>
          <ChartTooltip.Header>Line Indicators</ChartTooltip.Header>
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-4)" label="chart-1" value="Lightest" />
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-1)" label="chart-2" value="Light" />
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-3)" label="chart-3" value="Accent" />
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-2)" label="chart-4" value="Darkest" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  if (variant === 'inactive') {
    return (
      <DemoSection label="Inactive" isColumn>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
          The tooltip below is inactive (active=false) — nothing should render:
        </span>
        <div
          style={{
            alignItems: 'center',
            background: 'var(--muted, rgba(0,0,0,0.04))',
            borderRadius: 12,
            color: 'var(--muted-foreground)',
            display: 'flex',
            fontSize: 14,
            height: 64,
            justifyContent: 'center',
            width: 440,
          }}
        >
          (empty — tooltip hidden)
        </div>
      </DemoSection>
    );
  }

  if (variant === 'line-indicator') {
    return (
      <DemoSection label="Line Indicator">
        <ChartTooltip>
          <ChartTooltip.Header>March 2025</ChartTooltip.Header>
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-4)" label="Organic" value="15,200" />
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-1)" label="Paid Ads" value="8,400" />
          <ChartTooltip.Item indicator="line" indicatorColor="var(--chart-2)" label="Referral" value="3,100" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  if (variant === 'no-header') {
    return (
      <DemoSection label="No Header">
        <ChartTooltip>
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-4)" label="Sales" value="458" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="Usage">
      <ChartTooltip>
        <ChartTooltip.Header>January</ChartTooltip.Header>
        <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-4)" label="Revenue" value="$12,400" />
        <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-1)" label="Expenses" value="$8,200" />
      </ChartTooltip>
    </DemoSection>
  );
};

// Sessions vs Target：面积 + 虚线（对齐 Pro Composed Area With Line 示例）
const SESSIONS_TARGET_DATA = [
  { month: 'Jan', sessions: 12000, target: 13000 },
  { month: 'Feb', sessions: 16000, target: 14500 },
  { month: 'Mar', sessions: 14000, target: 16000 },
  { month: 'Apr', sessions: 18500, target: 17500 },
  { month: 'May', sessions: 17000, target: 19000 },
  { month: 'Jun', sessions: 22000, target: 20500 },
  { month: 'Jul', sessions: 21000, target: 22000 },
  { month: 'Aug', sessions: 25000, target: 23500 },
  { month: 'Sep', sessions: 24000, target: 25000 },
  { month: 'Oct', sessions: 28000, target: 26500 },
  { month: 'Nov', sessions: 27000, target: 28000 },
  { month: 'Dec', sessions: 34000, target: 29500 },
];

// Impressions & CTR：柱(展示量) + 线(CTR%)，双 Y 轴（对齐 Pro Composed Bar With Area 示例）
const IMPRESSIONS_CTR_DATA = [
  { month: 'Jan', impressions: 42000, ctr: 3.6 },
  { month: 'Feb', impressions: 48000, ctr: 4.0 },
  { month: 'Mar', impressions: 45000, ctr: 3.8 },
  { month: 'Apr', impressions: 56000, ctr: 4.4 },
  { month: 'May', impressions: 52000, ctr: 4.2 },
  { month: 'Jun', impressions: 68000, ctr: 5.1 },
  { month: 'Jul', impressions: 64000, ctr: 5.0 },
  { month: 'Aug', impressions: 74000, ctr: 5.4 },
  { month: 'Sep', impressions: 70000, ctr: 5.2 },
  { month: 'Oct', impressions: 82000, ctr: 5.9 },
  { month: 'Nov', impressions: 78000, ctr: 5.7 },
  { month: 'Dec', impressions: 92000, ctr: 6.3 },
];

// Site Analytics：柱(Page Views) + 线(Users) + 线(Bounce Rate%)，双 Y 轴（对齐 Pro Composed Multi Type 示例）
const SITE_ANALYTICS_DATA = [
  { month: 'Jan', pageViews: 8000, users: 12000, bounce: 48 },
  { month: 'Feb', pageViews: 9500, users: 14000, bounce: 45 },
  { month: 'Mar', pageViews: 9000, users: 13000, bounce: 50 },
  { month: 'Apr', pageViews: 11000, users: 16000, bounce: 42 },
  { month: 'May', pageViews: 10500, users: 15000, bounce: 44 },
  { month: 'Jun', pageViews: 13000, users: 18000, bounce: 38 },
  { month: 'Jul', pageViews: 12500, users: 17000, bounce: 40 },
  { month: 'Aug', pageViews: 15000, users: 20000, bounce: 35 },
  { month: 'Sep', pageViews: 14000, users: 19000, bounce: 37 },
  { month: 'Oct', pageViews: 17000, users: 22000, bounce: 32 },
  { month: 'Nov', pageViews: 16000, users: 21000, bounce: 34 },
  { month: 'Dec', pageViews: 19000, users: 24000, bounce: 30 },
];

const ComposedVariantDemo = ({ variant }: { variant: ComposedVariant }) => {
  if (variant === 'area-with-line') {
    return (
      <DemoSection label="Area With Line" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Sessions vs Target</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Sessions</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Target</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <ComposedChart data={SESSIONS_TARGET_DATA} height={260}>
              <defs>
                <linearGradient id="composed-sessions" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <ComposedChart.Grid vertical={false} />
              <ComposedChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <ComposedChart.YAxis tickLine={false} axisLine={false} width={44} tickFormatter={formatThousands} />
              <ComposedChart.Tooltip content={<ComposedChart.TooltipContent formatter={formatNumber} />} />
              <ComposedChart.Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                fill="url(#composed-sessions)"
                stroke="var(--chart-4)"
                strokeWidth={2}
              />
              <ComposedChart.Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="var(--chart-1)"
                strokeWidth={2}
                strokeDasharray="6 5"
                dot={false}
              />
            </ComposedChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'bar-with-area') {
    return (
      <DemoSection label="Bar With Area" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Impressions &amp; CTR</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Impressions</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">CTR %</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <ComposedChart data={IMPRESSIONS_CTR_DATA} height={260}>
              <ComposedChart.Grid vertical={false} />
              <ComposedChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <ComposedChart.YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={formatThousands}
              />
              <ComposedChart.YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={36}
                tickFormatter={formatPercent}
              />
              <ComposedChart.Tooltip content={<ComposedChart.TooltipContent />} />
              <ComposedChart.Bar
                yAxisId="left"
                dataKey="impressions"
                name="Impressions"
                fill="var(--chart-4)"
                radius={[6, 6, 0, 0]}
                barSize={16}
              />
              <ComposedChart.Line
                yAxisId="right"
                type="monotone"
                dataKey="ctr"
                name="CTR %"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'multi-type') {
    return (
      <DemoSection label="Multi Type" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Site Analytics</Widget.Title>
            <Widget.Legend style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Widget.LegendItem color="var(--chart-4)">Page Views</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Users</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-2)">Bounce Rate</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <ComposedChart data={SITE_ANALYTICS_DATA} height={260}>
              <ComposedChart.Grid vertical={false} />
              <ComposedChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <ComposedChart.YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={formatThousands}
              />
              <ComposedChart.YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={formatPercent}
              />
              <ComposedChart.Tooltip content={<ComposedChart.TooltipContent formatter={formatNumber} />} />
              <ComposedChart.Bar
                yAxisId="left"
                dataKey="pageViews"
                name="Page Views"
                fill="var(--chart-4)"
                radius={[6, 6, 0, 0]}
                barSize={14}
              />
              <ComposedChart.Line
                yAxisId="left"
                type="monotone"
                dataKey="users"
                name="Users"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <ComposedChart.Line
                yAxisId="right"
                type="monotone"
                dataKey="bounce"
                name="Bounce Rate"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'stacked-bar-with-line') {
    return (
      <DemoSection label="Stacked Bar With Line" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Site Analytics</Widget.Title>
            <Widget.Legend style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Widget.LegendItem color="var(--chart-4)">Page Views</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Users</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-2)">Bounce Rate</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <ComposedChart data={SITE_ANALYTICS_DATA} height={260}>
              <ComposedChart.Grid vertical={false} />
              <ComposedChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <ComposedChart.YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={formatThousands}
              />
              <ComposedChart.YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={formatPercent}
              />
              <ComposedChart.Tooltip content={<ComposedChart.TooltipContent formatter={formatNumber} />} />
              <ComposedChart.Bar
                yAxisId="left"
                dataKey="pageViews"
                name="Page Views"
                stackId="site"
                fill="var(--chart-4)"
                radius={[0, 0, 0, 0]}
                barSize={16}
              />
              <ComposedChart.Bar
                yAxisId="left"
                dataKey="users"
                name="Users"
                stackId="site"
                fill="var(--chart-1)"
                radius={[6, 6, 0, 0]}
                barSize={16}
              />
              <ComposedChart.Line
                yAxisId="right"
                type="monotone"
                dataKey="bounce"
                name="Bounce Rate"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="Default" isColumn>
      <Widget style={{ width: 600 }}>
        <Widget.Header>
          <Widget.Title>Revenue &amp; Orders</Widget.Title>
          <Widget.Legend>
            <Widget.LegendItem color="var(--chart-4)">Revenue</Widget.LegendItem>
            <Widget.LegendItem color="var(--chart-1)">Orders</Widget.LegendItem>
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content>
          <ComposedChart data={REVENUE_ORDERS_DATA} height={260}>
            <ComposedChart.Grid vertical={false} />
            <ComposedChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ComposedChart.YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={formatThousands}
            />
            <ComposedChart.YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <ComposedChart.Tooltip content={<ComposedChart.TooltipContent />} />
            <ComposedChart.Bar
              yAxisId="left"
              dataKey="revenue"
              name="Revenue"
              fill="var(--chart-4)"
              radius={[6, 6, 0, 0]}
              barSize={16}
            />
            <ComposedChart.Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

const LineVariantDemo = ({ variant }: { variant: LineVariant }) => {
  if (variant === 'kpi-with-chart') {
    return (
      <DemoSection label="KPI With Chart" isColumn>
        <KpiWithChartTriple kind="line" />
      </DemoSection>
    );
  }

  if (variant === 'sparkline') {
    return (
      <DemoSection label="Sparkline" isColumn>
        <SparklineTriple kind="line" />
      </DemoSection>
    );
  }

  if (variant === 'stats-with-chart') {
    return (
      <DemoSection label="Stats With Chart" isColumn>
        <div style={{ display: 'grid', gap: 16, width: 640 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Widget style={{ flex: '1 1 180px' }}>
              <Widget.Content>
                <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                  <Widget.Description>Revenue</Widget.Description>
                  <TrendChip trend="up" value="3.3%" size="sm" />
                </div>
                <Kpi.Value style={{ marginTop: 4 }}>$228,441</Kpi.Value>
              </Widget.Content>
            </Widget>
            <Widget style={{ flex: '1 1 180px' }}>
              <Widget.Content>
                <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                  <Widget.Description>Expenses</Widget.Description>
                  <TrendChip trend="down" value="3.3%" size="sm" />
                </div>
                <Kpi.Value style={{ marginTop: 4 }}>$25,108</Kpi.Value>
              </Widget.Content>
            </Widget>
            <Widget style={{ flex: '1 1 180px' }}>
              <Widget.Content>
                <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                  <Widget.Description>Sales</Widget.Description>
                  <TrendChip trend="up" value="3.3%" size="sm" />
                </div>
                <Kpi.Value style={{ marginTop: 4 }}>458</Kpi.Value>
              </Widget.Content>
            </Widget>
          </div>
          <Widget>
            <Widget.Header>
              <Widget.Title>Monthly Revenue</Widget.Title>
              <Widget.Legend>
                <Widget.LegendItem color="var(--chart-1)">Revenue</Widget.LegendItem>
              </Widget.Legend>
            </Widget.Header>
            <Widget.Content>
              <LineChart data={MONTHLY_REVENUE} height={200}>
                <LineChart.Grid vertical={false} />
                <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
                <LineChart.YAxis tickLine={false} axisLine={false} width={44} tickFormatter={formatThousands} />
                <LineChart.Tooltip content={<LineChart.TooltipContent formatter={formatCurrency} />} />
                <LineChart.Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </Widget.Content>
          </Widget>
        </div>
      </DemoSection>
    );
  }

  if (variant === 'traffic-source') {
    return (
      <DemoSection label="Traffic Source" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <div>
              <Widget.Title>Traffic Source</Widget.Title>
              <Kpi.Value style={{ marginTop: 6 }}>231,856</Kpi.Value>
              <Widget.Description>Sessions</Widget.Description>
            </div>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Organic</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Paid Ads</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <LineChart data={SESSIONS_DATA} height={240}>
              <LineChart.Grid vertical={false} />
              <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <LineChart.YAxis tickLine={false} axisLine={false} width={40} tickFormatter={formatThousands} />
              <LineChart.Tooltip content={<LineChart.TooltipContent formatter={formatNumber} />} />
              <LineChart.Line type="monotone" dataKey="organic" name="Organic" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              <LineChart.Line type="monotone" dataKey="paidAds" name="Paid Ads" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'portfolio') {
    return (
      <DemoSection label="Portfolio" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Portfolio</Widget.Title>
            <Segment defaultSelectedKey="1M" aria-label="Range">
              <Segment.Item id="1H">1H</Segment.Item>
              <Segment.Item id="1D">1D</Segment.Item>
              <Segment.Item id="1W">1W</Segment.Item>
              <Segment.Item id="1M">1M</Segment.Item>
              <Segment.Item id="1Y">1Y</Segment.Item>
              <Segment.Item id="ALL">ALL</Segment.Item>
            </Segment>
          </Widget.Header>
          <Widget.Content>
            <div>
              <Widget.Description>Total balance</Widget.Description>
              <Kpi.Value style={{ margin: '2px 0' }}>$24,801.32</Kpi.Value>
              <span style={{ color: 'var(--chart-success, #16a34a)', fontSize: 13, fontWeight: 600 }}>
                $1,242.77 (5.32%)
              </span>
            </div>
            <LineChart data={PORTFOLIO_BALANCE} height={220}>
              <LineChart.XAxis dataKey="month" hide />
              <LineChart.YAxis hide domain={['dataMin - 200', 'dataMax + 200']} />
              <LineChart.Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<LineChart.TooltipContent formatter={formatCurrency} />}
              />
              <LineChart.Line type="monotone" dataKey="balance" name="Balance" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'multi-line-chart-colors') {
    return (
      <DemoSection label="Multi Line Chart Colors" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Traffic Sources</Widget.Title>
            <Widget.Legend style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Widget.LegendItem color="var(--chart-4)">Organic</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Paid Ads</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-2)">Referral</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-3)">Direct</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <LineChart data={TRAFFIC_STACK_DATA} height={240}>
              <LineChart.Grid vertical={false} />
              <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <LineChart.YAxis tickLine={false} axisLine={false} width={40} tickFormatter={formatThousands} />
              <LineChart.Tooltip content={<LineChart.TooltipContent formatter={formatNumber} />} />
              <LineChart.Line type="monotone" dataKey="organic" name="Organic" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              <LineChart.Line type="monotone" dataKey="paidAds" name="Paid Ads" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              <LineChart.Line type="monotone" dataKey="referral" name="Referral" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              <LineChart.Line type="monotone" dataKey="direct" name="Direct" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
            </LineChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'dashed-comparison') {
    return (
      <DemoSection label="Dashed Comparison" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Actual vs Target</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-1)">Actual</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Target</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <LineChart data={ACTUAL_TARGET_DATA} height={240}>
              <LineChart.Grid vertical={false} />
              <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <LineChart.YAxis tickLine={false} axisLine={false} width={44} tickFormatter={formatThousands} />
              <LineChart.Tooltip content={<LineChart.TooltipContent indicator="line" formatter={formatCurrency} />} />
              <LineChart.Line type="monotone" dataKey="actual" name="Actual" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              <LineChart.Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="var(--chart-1)"
                strokeWidth={2}
                strokeDasharray="6 5"
                dot={false}
              />
            </LineChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'custom-tooltip') {
    return (
      <DemoSection label="With Custom Tooltip" isColumn>
        <Widget style={{ width: 600 }}>
          <Widget.Header>
            <Widget.Title>Sessions</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Organic</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Paid Ads</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <LineChart data={SESSIONS_DATA} height={240}>
              <LineChart.Grid vertical={false} />
              <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <LineChart.YAxis tickLine={false} axisLine={false} width={40} tickFormatter={formatThousands} />
              <LineChart.Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={
                  <LineChart.TooltipContent
                    indicator="line"
                    labelFormatter={(label) => `${label} 2025`}
                    formatter={(value, name) => `${name}: ${formatNumber(value)}`}
                  />
                }
              />
              <LineChart.Line type="monotone" dataKey="organic" name="Organic" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              <LineChart.Line type="monotone" dataKey="paidAds" name="Paid Ads" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  // 'with-dots' / default → Monthly Revenue 单线（with-dots 显示数据点）
  return (
    <DemoSection label={variant === 'with-dots' ? 'With Dots' : 'Default'} isColumn>
      <Widget style={{ width: 600 }}>
        <Widget.Header>
          <Widget.Title>Monthly Revenue</Widget.Title>
        </Widget.Header>
        <Widget.Content>
          <LineChart data={MONTHLY_REVENUE} height={240}>
            <LineChart.Grid vertical={false} />
            <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
            <LineChart.YAxis tickLine={false} axisLine={false} width={44} tickFormatter={formatThousands} />
            <LineChart.Tooltip content={<LineChart.TooltipContent formatter={formatCurrency} />} />
            <LineChart.Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={variant === 'with-dots' ? { r: 3, fill: 'var(--surface)', strokeWidth: 2 } : false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

const PieVariantDemo = ({ variant }: { variant: PieVariant }) => {
  if (variant === 'with-breakdown') {
    const total = PIE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.value, 0);
    const max = Math.max(...PIE_BREAKDOWN_DATA.map((item) => item.value));
    return (
      <DemoSection label="With Breakdown">
        <Widget style={{ width: 380 }}>
          <Widget.Header>
            <Widget.Title>Users by Plan</Widget.Title>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <PieChart height={200} width={200}>
                <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={formatNumber} />} />
                <PieChart.Pie
                  data={PIE_BREAKDOWN_DATA}
                  dataKey="value"
                  nameKey="channel"
                  innerRadius={66}
                  outerRadius={94}
                  paddingAngle={2}
                />
              </PieChart>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  inset: 0,
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  position: 'absolute',
                }}
              >
                <span style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 700 }}>
                  {formatNumber(total)}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10, width: '100%' }}>
              {PIE_BREAKDOWN_DATA.map((item) => (
                <div key={item.channel} style={{ display: 'grid', gap: 4 }}>
                  <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                    <Widget.LegendItem color={item.fill}>{item.channel}</Widget.LegendItem>
                    <strong style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                      {formatNumber(item.value)}
                    </strong>
                  </div>
                  <div style={{ background: 'var(--muted, rgba(0,0,0,0.06))', borderRadius: 999, height: 6 }}>
                    <div
                      style={{
                        background: item.fill,
                        borderRadius: 999,
                        height: '100%',
                        width: `${(item.value / max) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'nested-donut') {
    return (
      <DemoSection label="Nested Donut">
        <Widget style={{ width: 380 }}>
          <Widget.Header>
            <Widget.Title>Revenue: This Year vs Last</Widget.Title>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center', gap: 12 }}>
            <PieChart height={220} width={260}>
              <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={formatPercent} />} />
              <PieChart.Pie data={NESTED_PIE_INNER_DATA} dataKey="value" nameKey="channel" innerRadius={40} outerRadius={64} paddingAngle={2} />
              <PieChart.Pie data={NESTED_PIE_OUTER_DATA} dataKey="value" nameKey="channel" innerRadius={76} outerRadius={100} paddingAngle={2} />
            </PieChart>
            <Widget.Legend style={{ justifyContent: 'center' }}>
              <Widget.LegendItem color="var(--chart-4)">Q1</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-3)">Q2</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Q3</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-2)">Q4</Widget.LegendItem>
            </Widget.Legend>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              Last year (inner) / This year (outer)
            </span>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'donut-with-content') {
    const total = PIE_DEVICES_DATA.reduce((sum, item) => sum + item.value, 0);
    return (
      <DemoSection label="Donut With Content">
        <Widget style={{ width: 380 }}>
          <Widget.Header>
            <Widget.Title>Connected Devices</Widget.Title>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <PieChart height={220} width={220}>
                <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={formatNumber} />} />
                <PieChart.Pie
                  data={PIE_DEVICES_DATA}
                  dataKey="value"
                  nameKey="channel"
                  innerRadius={72}
                  outerRadius={102}
                  paddingAngle={2}
                />
              </PieChart>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  inset: 0,
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  position: 'absolute',
                }}
              >
                <span style={{ color: 'var(--foreground)', fontSize: 26, fontWeight: 700 }}>4.5K</span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Devices</span>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 8, width: '100%' }}>
              {PIE_DEVICES_DATA.map((item) => (
                <div key={item.channel} style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                  <Widget.LegendItem color={item.fill} style={{ flex: 1 }}>
                    {item.channel}
                  </Widget.LegendItem>
                  <strong style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    {formatNumber(item.value)}
                  </strong>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    ({Math.round((item.value / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'donut-with-label') {
    return (
      <DemoSection label="Donut With Label">
        <Widget style={{ width: 380 }}>
          <Widget.Header>
            <div>
              <Widget.Title>Storage Usage</Widget.Title>
              <Widget.Description>100 GB of 128 GB used</Widget.Description>
            </div>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <PieChart height={220} width={220}>
                <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={(value) => `${value} GB`} />} />
                <PieChart.Pie
                  data={PIE_STORAGE_DATA}
                  dataKey="value"
                  nameKey="channel"
                  innerRadius={72}
                  outerRadius={102}
                  paddingAngle={2}
                />
              </PieChart>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  inset: 0,
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  position: 'absolute',
                }}
              >
                <span style={{ color: 'var(--foreground)', fontSize: 26, fontWeight: 700 }}>100</span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>GB used</span>
              </div>
            </div>
            <Widget.Legend style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              {PIE_STORAGE_DATA.map((item) => (
                <Widget.LegendItem key={item.channel} color={item.fill}>
                  {`${item.channel} (${item.value} GB)`}
                </Widget.LegendItem>
              ))}
            </Widget.Legend>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'donut') {
    const total = PIE_TRAFFIC_DATA.reduce((sum, item) => sum + item.value, 0);
    return (
      <DemoSection label="Donut">
        <Widget style={{ width: 380 }}>
          <Widget.Header>
            <Widget.Title>Traffic Sources</Widget.Title>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center', gap: 16 }}>
            <PieChart height={200} width={200}>
              <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={formatNumber} />} />
              <PieChart.Pie
                data={PIE_TRAFFIC_DATA}
                dataKey="value"
                nameKey="channel"
                innerRadius={78}
                outerRadius={94}
                paddingAngle={2}
              />
            </PieChart>
            <div
              style={{
                columnGap: 24,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                rowGap: 8,
                width: '100%',
              }}
            >
              {PIE_TRAFFIC_DATA.map((item) => (
                <Widget.LegendItem key={item.channel} color={item.fill}>
                  {`${item.channel} (${formatNumber(item.value)})`}
                </Widget.LegendItem>
              ))}
            </div>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              {`${formatNumber(total)} total sessions`}
            </span>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'custom-tooltip') {
    return (
      <DemoSection label="Custom Tooltip">
        <Widget style={{ width: 380 }}>
          <Widget.Header>
            <Widget.Title>Market Share</Widget.Title>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center' }}>
            <PieChart height={240} width={300}>
              <PieChart.Tooltip
                content={
                  <PieChart.TooltipContent
                    indicator="line"
                    labelFormatter={(label) => (label ? `${label}` : 'Browser')}
                    valueFormatter={(value) => `${formatNumber(value)} users`}
                  />
                }
              />
              <PieChart.Pie
                data={PIE_SHARE_DATA}
                dataKey="value"
                nameKey="channel"
                outerRadius={92}
                activeShape={<PieChart.ActiveShape />}
              />
            </PieChart>
            <Widget.Legend style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              {PIE_SHARE_DATA.map((item) => (
                <Widget.LegendItem key={item.channel} color={item.fill}>
                  {item.channel}
                </Widget.LegendItem>
              ))}
            </Widget.Legend>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  // default → Browser Usage 全饼图
  return (
    <DemoSection label="Default">
      <Widget style={{ width: 380 }}>
        <Widget.Header>
          <Widget.Title>Browser Usage</Widget.Title>
        </Widget.Header>
        <Widget.Content style={{ alignItems: 'center' }}>
          <PieChart height={240} width={300}>
            <PieChart.Tooltip content={<PieChart.TooltipContent valueFormatter={formatNumber} />} />
            <PieChart.Pie
              data={PIE_SHARE_DATA}
              dataKey="value"
              nameKey="channel"
              outerRadius={92}
              activeShape={<PieChart.ActiveShape />}
            />
          </PieChart>
          <Widget.Legend style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {PIE_SHARE_DATA.map((item) => (
              <Widget.LegendItem key={item.channel} color={item.fill}>
                {item.channel}
              </Widget.LegendItem>
            ))}
          </Widget.Legend>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

const RadarVariantDemo = ({ variant }: { variant: RadarVariant }) => {
  if (variant === 'comparison') {
    return (
      <DemoSection label="Comparison">
        <Widget style={{ width: 460 }}>
          <Widget.Header>
            <Widget.Title>Platform Comparison</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Team A</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Team B</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center' }}>
            <RadarChart data={RADAR_PLATFORM_DATA} height={300} width={380}>
              <RadarChart.Grid gridType="polygon" />
              <RadarChart.AngleAxis dataKey="subject" />
              <RadarChart.Radar name="Team A" dataKey="current" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.18} strokeWidth={2} />
              <RadarChart.Radar name="Team B" dataKey="previous" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.1} strokeWidth={2} />
              <RadarChart.Tooltip content={<RadarChart.TooltipContent />} />
            </RadarChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'multi-series') {
    return (
      <DemoSection label="Multi Series">
        <Widget style={{ width: 460 }}>
          <Widget.Header>
            <Widget.Title>Device Usage</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Desktop</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Mobile</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-2)">Tablet</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center' }}>
            <RadarChart data={RADAR_DEVICE_DATA} height={300} width={380}>
              <RadarChart.Grid gridType="polygon" />
              <RadarChart.AngleAxis dataKey="subject" />
              <RadarChart.Radar name="Desktop" dataKey="desktop" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.16} strokeWidth={2} />
              <RadarChart.Radar name="Mobile" dataKey="mobile" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} strokeWidth={2} />
              <RadarChart.Radar name="Tablet" dataKey="tablet" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.1} strokeWidth={2} />
              <RadarChart.Tooltip content={<RadarChart.TooltipContent />} />
            </RadarChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'with-radius-axis') {
    return (
      <DemoSection label="With Radius Axis">
        <Widget style={{ width: 460 }}>
          <Widget.Header>
            <Widget.Title>Sprint Velocity</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Current</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Target</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center' }}>
            <RadarChart data={RADAR_PLATFORM_DATA} height={300} width={380}>
              <RadarChart.Grid gridType="polygon" />
              <RadarChart.AngleAxis dataKey="subject" />
              <RadarChart.RadiusAxis angle={90} domain={[0, 100]} />
              <RadarChart.Radar name="Current" dataKey="current" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.18} strokeWidth={2} />
              <RadarChart.Radar name="Target" dataKey="target" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.08} strokeWidth={2} />
              <RadarChart.Tooltip content={<RadarChart.TooltipContent />} />
            </RadarChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'dots-only') {
    return (
      <DemoSection label="Dots Only">
        <Widget style={{ width: 460 }}>
          <Widget.Header>
            <Widget.Title>Performance Metrics</Widget.Title>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center' }}>
            <RadarChart data={RADAR_SKILL_DATA} height={300} width={380}>
              <RadarChart.Grid gridType="polygon" />
              <RadarChart.AngleAxis dataKey="subject" />
              <RadarChart.Radar
                name="Score"
                dataKey="score"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0}
                strokeWidth={2}
                dot={{ r: 4, fill: 'var(--chart-1)' }}
              />
              <RadarChart.Tooltip content={<RadarChart.TooltipContent />} />
            </RadarChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  // default → Skill Assessment 单系列
  return (
    <DemoSection label="Default">
      <Widget style={{ width: 460 }}>
        <Widget.Header>
          <Widget.Title>Skill Assessment</Widget.Title>
        </Widget.Header>
        <Widget.Content style={{ alignItems: 'center' }}>
          <RadarChart data={RADAR_SKILL_DATA} height={300} width={380}>
            <RadarChart.Grid gridType="polygon" />
            <RadarChart.AngleAxis dataKey="subject" />
            <RadarChart.Radar name="Score" dataKey="score" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.18} strokeWidth={2} />
            <RadarChart.Tooltip content={<RadarChart.TooltipContent />} />
          </RadarChart>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

// 半圆仪表（gauge / gauge-grid 共用）：值 0-100，中心覆盖文本
const RadialGauge = ({
  value,
  centerValue,
  label,
  color = 'var(--chart-1)',
}: {
  value: number;
  centerValue: string;
  label?: string;
  color?: string;
}) => (
  <div style={{ position: 'relative', width: 200 }}>
    <RadialChart
      data={[{ label: 'value', value, fill: color }]}
      height={140}
      width={200}
      innerRadius="74%"
      outerRadius="100%"
      startAngle={210}
      endAngle={-30}
      barSize={14}
    >
      <RadialChart.AngleAxis type="number" domain={[0, 100]} tick={false} tickLine={false} axisLine={false} />
      <RadialChart.Tooltip cursor={false} content={<RadialChart.TooltipContent valueFormatter={formatPercent} />} />
      <RadialChart.Bar dataKey="value" name={label ?? 'Value'} background cornerRadius={10}>
        <RadialChart.Cell fill={color} />
      </RadialChart.Bar>
    </RadialChart>
    <div
      style={{
        alignItems: 'center',
        bottom: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        left: 0,
        pointerEvents: 'none',
        position: 'absolute',
        right: 0,
      }}
    >
      {label && <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{label}</span>}
      <span style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 700 }}>{centerValue}</span>
    </div>
  </div>
);

const RadialLegendDemo = () => (
  <DemoSection label="With Legend">
    <Widget style={{ width: 380 }}>
      <Widget.Header>
        <div>
          <Widget.Title>Storage Breakdown</Widget.Title>
          <Widget.Description>88 GB of 128 GB used</Widget.Description>
        </div>
      </Widget.Header>
      <Widget.Content style={{ alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <RadialChart data={RADIAL_LEGEND_DATA} height={200} width={200} innerRadius="34%" outerRadius="100%" barSize={14}>
            <RadialChart.Tooltip cursor={false} content={<RadialChart.TooltipContent valueFormatter={(value) => `${value} GB`} />} />
            <RadialChart.Bar dataKey="value" name="Storage" background cornerRadius={8}>
              {RADIAL_LEGEND_DATA.map((item) => (
                <RadialChart.Cell key={item.label} fill={item.fill} />
              ))}
            </RadialChart.Bar>
          </RadialChart>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              inset: 0,
              justifyContent: 'center',
              pointerEvents: 'none',
              position: 'absolute',
            }}
          >
            <span style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 700 }}>88</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>GB used</span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8, width: '100%' }}>
          {RADIAL_LEGEND_DATA.map((item) => (
            <div key={item.label} style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
              <Widget.LegendItem color={item.fill}>{item.label}</Widget.LegendItem>
              <strong style={{ color: 'var(--foreground)', fontWeight: 600 }}>{`${item.value} GB`}</strong>
            </div>
          ))}
        </div>
      </Widget.Content>
    </Widget>
  </DemoSection>
);

const RadialVariantDemo = ({ variant }: { variant: RadialVariant }) => {
  if (variant === 'gauge') {
    return (
      <DemoSection label="Gauge">
        <Widget style={{ width: 360 }}>
          <Widget.Header>
            <Widget.Title>Activity</Widget.Title>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center' }}>
            <RadialGauge value={68} label="Active Users" centerValue="1,358" />
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'gauge-grid') {
    const cards = [
      { color: 'var(--chart-4)', label: 'Conversion', value: 75 },
      { color: 'var(--chart-1)', label: 'Engagement', value: 75 },
      { color: 'var(--chart-1)', label: 'Bounce Rate', value: 35 },
      { color: 'var(--chart-danger, #ef4444)', label: 'Errors', value: 90 },
    ];
    return (
      <DemoSection label="Gauge Grid">
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr', width: 520 }}>
          {cards.map((card) => (
            <Widget key={card.label}>
              <Widget.Header>
                <Widget.Title>{card.label}</Widget.Title>
              </Widget.Header>
              <Widget.Content style={{ alignItems: 'center' }}>
                <RadialGauge value={card.value} color={card.color} centerValue={`${card.value}%`} />
              </Widget.Content>
            </Widget>
          ))}
        </div>
      </DemoSection>
    );
  }

  if (variant === 'progress-ring') {
    return (
      <DemoSection label="Progress Ring">
        <Widget style={{ width: 360 }}>
          <Widget.Header>
            <Widget.Title>Daily Steps</Widget.Title>
          </Widget.Header>
          <Widget.Content style={{ alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <RadialChart data={RADIAL_PROGRESS_DATA} height={200} width={200} innerRadius="78%" outerRadius="100%" barSize={14} startAngle={90} endAngle={-270}>
                <RadialChart.AngleAxis type="number" domain={[0, 100]} tick={false} tickLine={false} axisLine={false} />
                <RadialChart.Tooltip content={<RadialChart.TooltipContent valueFormatter={formatPercent} />} />
                <RadialChart.Bar dataKey="value" name="Progress" background cornerRadius={10}>
                  <RadialChart.Cell fill="var(--chart-1)" />
                </RadialChart.Bar>
              </RadialChart>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  inset: 0,
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  position: 'absolute',
                }}
              >
                <span style={{ color: 'var(--foreground)', fontSize: 26, fontWeight: 700 }}>75%</span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>7,452 / 10,000</span>
              </div>
            </div>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  if (variant === 'with-legend') {
    return <RadialLegendDemo />;
  }

  // default → Energy Activity Usage 卡片
  return (
    <DemoSection label="Default">
      <Widget style={{ width: 380 }}>
        <Widget.Header>
          <Widget.Title>Energy Activity</Widget.Title>
        </Widget.Header>
        <Widget.Content style={{ gap: 12 }}>
          <KpiGroup orientation="vertical">
            <Kpi>
              <Kpi.Header>
                <Kpi.Title>Calories</Kpi.Title>
              </Kpi.Header>
              <Kpi.Content>
                <Kpi.Value>1,623/2,000 kcal</Kpi.Value>
              </Kpi.Content>
            </Kpi>
            <Kpi>
              <Kpi.Header>
                <Kpi.Title>Steps</Kpi.Title>
              </Kpi.Header>
              <Kpi.Content>
                <Kpi.Value>8,328/10,000 steps</Kpi.Value>
              </Kpi.Content>
            </Kpi>
            <Kpi>
              <Kpi.Header>
                <Kpi.Title>Exercise</Kpi.Title>
              </Kpi.Header>
              <Kpi.Content>
                <Kpi.Value>25/120 min</Kpi.Value>
              </Kpi.Content>
            </Kpi>
          </KpiGroup>
          <div style={{ alignSelf: 'center', position: 'relative' }}>
            <RadialChart data={ENERGY_RINGS} height={220} width={220} innerRadius="32%" outerRadius="100%" barSize={14}>
              <RadialChart.Tooltip cursor={false} content={<RadialChart.TooltipContent valueFormatter={formatPercent} />} />
              <RadialChart.Bar dataKey="value" name="Activity" background cornerRadius={8}>
                {ENERGY_RINGS.map((ring) => (
                  <RadialChart.Cell key={ring.activity} fill={ring.fill} />
                ))}
              </RadialChart.Bar>
            </RadialChart>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                inset: 0,
                justifyContent: 'center',
                pointerEvents: 'none',
                position: 'absolute',
              }}
            >
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Calories</span>
              <span style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 700 }}>700 kcal</span>
            </div>
          </div>
        </Widget.Content>
      </Widget>
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
