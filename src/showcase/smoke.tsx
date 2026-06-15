import Button from '../components/button';
import Card from '../components/card';
import Chip from '../components/chip';
import Input from '../components/input';

const Smoke = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-10">
    <h1 className="text-2xl font-semibold">Vela UI Preview</h1>

    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Chip color="accent">Accent</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="danger">Danger</Chip>
    </div>

    <Card className="w-full max-w-sm">
      <Card.Header>
        <Card.Title>Course workspace</Card.Title>
        <Card.Description>快速记录一条课程运营事项。</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <Input placeholder="输入点什么…" />
        <Button variant="primary" isFullWidth>
          提交
        </Button>
      </Card.Content>
    </Card>
  </div>
);

Smoke.displayName = 'Smoke';

export default Smoke;
