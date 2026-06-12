import { Button, Card, Chip, Input } from '@heroui/react';

/**
 * 工具链冒烟验证：直接使用 @heroui/react（OSS）真实组件，
 * 确认 React 19 + Tailwind v4 + @heroui/styles 链路正常出样式。
 * Pro 组件登录拉取后再替换为完整展示站。
 */
const Smoke = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-10">
    <h1 className="text-2xl font-semibold">工具链迁移冒烟测试 · HeroUI OSS</h1>

    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Chip color="primary">Primary</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="danger">Danger</Chip>
    </div>

    <Card className="w-full max-w-sm">
      <Card.Header>
        <Card.Title>Card Title</Card.Title>
        <Card.Description>真实 OSS 组件渲染，验证样式层生效。</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <Input placeholder="输入点什么…" />
        <Button variant="primary" fullWidth>
          提交
        </Button>
      </Card.Content>
    </Card>
  </div>
);

Smoke.displayName = 'Smoke';

export default Smoke;
