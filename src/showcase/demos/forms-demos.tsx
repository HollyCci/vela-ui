import { useState, type ReactNode } from 'react';
import { isFileDropItem } from 'react-aria-components';
import Input from '../../components/input';
import Textarea from '../../components/textarea';
import Checkbox from '../../components/checkbox';
import Radio from '../../components/radio';
import Switch from '../../components/switch';
import Slider from '../../components/slider';
import NativeSelect from '../../components/native-select';
import SearchField from '../../components/search-field';
import NumberField from '../../components/number-field';
import Tag, { TagGroup } from '../../components/tag';
import CheckboxButtonGroup from '../../components/checkbox-button-group';
import RadioButtonGroup from '../../components/radio-button-group';
import NumberStepper from '../../components/number-stepper';
import InlineSelect from '../../components/inline-select';
import DropZone, { type DropZoneAreaProps } from '../../components/drop-zone';
import CellSwitch from '../../components/cell-switch';
import CellSelect from '../../components/cell-select';
import DemoSection from '../demo-section';

const InputDemo = () => (
  <>
    <DemoSection label="variants">
      <Input placeholder="默认输入框" />
      <Input variant="secondary" placeholder="次级输入框" />
    </DemoSection>
    <DemoSection label="states">
      <Input placeholder="校验失败" isInvalid />
      <Input placeholder="禁用" disabled />
    </DemoSection>
  </>
);

const TextareaDemo = () => (
  <DemoSection isColumn>
    <Textarea placeholder="请输入备注…" rows={3} style={{ width: 320 }} />
    <Textarea variant="secondary" placeholder="次级样式" rows={3} style={{ width: 320 }} />
  </DemoSection>
);

const CheckboxDemo = () => (
  <DemoSection isColumn>
    <Checkbox defaultSelected>接收产品更新邮件</Checkbox>
    <Checkbox description="包含学员动态与课程提醒">订阅通知</Checkbox>
    <Checkbox isIndeterminate>部分选中</Checkbox>
    <Checkbox isInvalid>必须勾选的条款</Checkbox>
    <Checkbox isDisabled>禁用项</Checkbox>
    <Checkbox variant="secondary" defaultSelected>
      次级样式
    </Checkbox>
  </DemoSection>
);

const RadioDemo = () => {
  const [plan, setPlan] = useState('standard');
  const handleStandardChange = () => setPlan('standard');
  const handleProChange = () => setPlan('pro');

  return (
    <DemoSection isColumn>
      <Radio
        name="plan"
        value="standard"
        isSelected={plan === 'standard'}
        onChange={handleStandardChange}
        description="适合大多数班级"
      >
        标准方案
      </Radio>
      <Radio name="plan" value="pro" isSelected={plan === 'pro'} onChange={handleProChange}>
        专业方案
      </Radio>
      <Radio name="plan-disabled" isDisabled>
        禁用选项
      </Radio>
    </DemoSection>
  );
};

const SwitchDemo = () => (
  <DemoSection>
    <Switch size="sm" defaultSelected>
      小尺寸
    </Switch>
    <Switch defaultSelected>自动排课</Switch>
    <Switch size="lg">大尺寸</Switch>
    <Switch isDisabled>禁用</Switch>
  </DemoSection>
);

const SliderDemo = () => (
  <DemoSection isColumn>
    <Slider label="音量" value={40} style={{ width: 320 }} />
    <Slider label="进度" value={75} minValue={0} maxValue={100} style={{ width: 320 }} />
    <Slider label="禁用" value={20} isDisabled style={{ width: 320 }} />
  </DemoSection>
);

const NativeSelectDemo = () => (
  <DemoSection>
    <NativeSelect label="所属校区" defaultValue="bj" description="选择学员归属校区">
      <option value="bj">北京校区</option>
      <option value="sh">上海校区</option>
      <option value="gz">广州校区</option>
    </NativeSelect>
    <NativeSelect variant="secondary" aria-label="次级选择器" defaultValue="a">
      <option value="a">选项 A</option>
      <option value="b">选项 B</option>
    </NativeSelect>
  </DemoSection>
);

const SearchFieldDemo = () => (
  <DemoSection isColumn>
    <SearchField label="搜索学员" placeholder="输入姓名或手机号" style={{ width: 320 }} />
    <SearchField variant="secondary" placeholder="次级样式" defaultValue="拓词" style={{ width: 320 }} />
  </DemoSection>
);

const NumberFieldDemo = () => (
  <DemoSection isColumn>
    <NumberField label="每日单词量" defaultValue={50} minValue={0} maxValue={500} step={10} style={{ width: 280 }} />
    <NumberField variant="secondary" aria-label="次级数字输入" defaultValue={3} minValue={1} maxValue={10} style={{ width: 280 }} />
  </DemoSection>
);

const TagDemo = () => (
  <DemoSection isColumn>
    <TagGroup label="学习偏好" description="点选标签可切换选中态">
      <Tag isSelected>听力</Tag>
      <Tag>阅读</Tag>
      <Tag variant="surface">拼写</Tag>
      <Tag size="sm">句型</Tag>
      <Tag size="lg">填空</Tag>
      <Tag isDisabled>禁用</Tag>
    </TagGroup>
    <TagGroup label="可移除标签">
      <Tag onRemove={noop}>React</Tag>
      <Tag onRemove={noop} variant="surface">
        TypeScript
      </Tag>
    </TagGroup>
  </DemoSection>
);

const CheckboxButtonGroupDemo = () => {
  const [modules, setModules] = useState<string[]>(['reading']);
  const handleModulesChange = (value: string[]) => setModules(value);

  return (
    <DemoSection isColumn>
      <CheckboxButtonGroup
        aria-label="训练模块（受控）"
        layout="grid"
        value={modules}
        onChange={handleModulesChange}
        style={{ width: 480, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <CheckboxButtonGroup.Item value="reading">
          <CheckboxButtonGroup.Indicator />
          <CheckboxButtonGroup.ItemIcon>
            <BookIcon />
          </CheckboxButtonGroup.ItemIcon>
          <CheckboxButtonGroup.ItemContent>
            <strong>阅读训练</strong>
            <span>精读与泛读结合</span>
          </CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
        <CheckboxButtonGroup.Item value="listening">
          <CheckboxButtonGroup.Indicator />
          <CheckboxButtonGroup.ItemIcon>
            <EarIcon />
          </CheckboxButtonGroup.ItemIcon>
          <CheckboxButtonGroup.ItemContent>
            <strong>听力训练</strong>
            <span>分级听写练习</span>
          </CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      </CheckboxButtonGroup>
      <CheckboxButtonGroup
        aria-label="禁用组（自定义指示器）"
        isDisabled
        defaultValue={['spelling']}
        style={{ width: 480 }}
      >
        <CheckboxButtonGroup.Item value="spelling">
          <CheckboxButtonGroup.Indicator>
            <CheckCircleIcon />
          </CheckboxButtonGroup.Indicator>
          <CheckboxButtonGroup.ItemContent>
            <strong>拼写训练</strong>
            <span>禁用且选中</span>
          </CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
        <CheckboxButtonGroup.Item value="grammar">
          <CheckboxButtonGroup.Indicator>
            <CheckCircleIcon />
          </CheckboxButtonGroup.Indicator>
          <CheckboxButtonGroup.ItemContent>
            <strong>语法训练</strong>
            <span>禁用未选中</span>
          </CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      </CheckboxButtonGroup>
    </DemoSection>
  );
};

const RadioButtonGroupDemo = () => {
  const [reportCycle, setReportCycle] = useState('weekly');
  const handleReportCycleChange = (value: string) => setReportCycle(value);

  return (
    <DemoSection isColumn>
      <RadioButtonGroup
        aria-label="报告周期（受控）"
        layout="grid"
        value={reportCycle}
        onChange={handleReportCycleChange}
        style={{ width: 480, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <RadioButtonGroup.Item value="weekly">
          <RadioButtonGroup.Indicator />
          <RadioButtonGroup.ItemContent>
            <strong>每周报告</strong>
            <span>每周一汇总学习数据</span>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
        <RadioButtonGroup.Item value="monthly">
          <RadioButtonGroup.Indicator />
          <RadioButtonGroup.ItemContent>
            <strong>每月报告</strong>
            <span>每月初汇总学习数据</span>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
      </RadioButtonGroup>
      <RadioButtonGroup
        aria-label="训练模式（自定义指示器 + 图标）"
        defaultValue="reading"
        style={{ width: 480 }}
      >
        <RadioButtonGroup.Item value="reading">
          <RadioButtonGroup.Indicator>
            <CheckCircleIcon />
          </RadioButtonGroup.Indicator>
          <RadioButtonGroup.ItemIcon>
            <BookIcon />
          </RadioButtonGroup.ItemIcon>
          <RadioButtonGroup.ItemContent>
            <strong>阅读模式</strong>
            <span>精读与泛读结合</span>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
        <RadioButtonGroup.Item value="listening">
          <RadioButtonGroup.Indicator>
            <CheckCircleIcon />
          </RadioButtonGroup.Indicator>
          <RadioButtonGroup.ItemIcon>
            <EarIcon />
          </RadioButtonGroup.ItemIcon>
          <RadioButtonGroup.ItemContent>
            <strong>听力模式</strong>
            <span>分级听写练习</span>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
        <RadioButtonGroup.Item value="spelling" isDisabled>
          <RadioButtonGroup.Indicator>
            <CheckCircleIcon />
          </RadioButtonGroup.Indicator>
          <RadioButtonGroup.ItemContent>
            <strong>拼写模式</strong>
            <span>暂未开放（禁用项）</span>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
      </RadioButtonGroup>
    </DemoSection>
  );
};

const STEPPER_PARTS = (
  <NumberStepper.Group>
    <NumberStepper.DecrementButton />
    <NumberStepper.Value />
    <NumberStepper.IncrementButton />
  </NumberStepper.Group>
);

const NumberStepperDemo = () => (
  <>
    <DemoSection label="sizes + min/max/step">
      <NumberStepper aria-label="数量（小）" size="sm" defaultValue={1} minValue={0} maxValue={9}>
        {STEPPER_PARTS}
      </NumberStepper>
      <NumberStepper aria-label="数量" defaultValue={5} minValue={0} maxValue={20}>
        {STEPPER_PARTS}
      </NumberStepper>
      <NumberStepper
        aria-label="数量（大）"
        size="lg"
        defaultValue={10}
        minValue={0}
        maxValue={99}
        step={5}
      >
        {STEPPER_PARTS}
      </NumberStepper>
    </DemoSection>
    <DemoSection label="formatOptions（货币）+ disabled">
      <NumberStepper
        aria-label="价格"
        defaultValue={99}
        formatOptions={{ style: 'currency', currency: 'CNY' }}
        minValue={0}
        step={10}
      >
        {STEPPER_PARTS}
      </NumberStepper>
      <NumberStepper aria-label="禁用" defaultValue={3} isDisabled>
        {STEPPER_PARTS}
      </NumberStepper>
    </DemoSection>
  </>
);

const InlineSelectDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => setIsOpen((v) => !v);

  return (
    <DemoSection>
      <InlineSelect
        value="按创建时间排序"
        isOpen={isOpen}
        onTriggerClick={handleToggle}
        popover={<div style={{ padding: 8 }}>静态弹层内容</div>}
      />
      <InlineSelect value="禁用状态" isDisabled />
    </DemoSection>
  );
};

/** 从文件名提取大写扩展名作为格式徽标 */
const getFileFormat = (name: string) => {
  const ext = name.includes('.') ? name.split('.').pop() : undefined;
  return ext !== undefined && ext !== '' ? ext.toUpperCase() : 'FILE';
};

type DemoFileEntryProps = {
  name: string;
  onRemove: (name: string) => void;
};

/** 回显条目：单独成组件以便事件处理具名（JSX 内禁匿名函数） */
const DemoFileEntry = ({ name, onRemove }: DemoFileEntryProps) => {
  const handleRemove = () => onRemove(name);

  return (
    <DropZone.FileItem status="complete">
      <DropZone.FileFormatIcon format={getFileFormat(name)} color="blue" />
      <DropZone.FileInfo>
        <DropZone.FileName>{name}</DropZone.FileName>
        <DropZone.FileMeta>刚刚添加</DropZone.FileMeta>
      </DropZone.FileInfo>
      <DropZone.FileRemoveTrigger aria-label={`移除 ${name}`} onPress={handleRemove} />
    </DropZone.FileItem>
  );
};

const DropZoneDemo = () => {
  const [fileNames, setFileNames] = useState<string[]>([]);

  // 拖放：RAC DropZone 的 onDrop（拖入高亮 [data-drop-target] 由底座 + CSS 提供）
  const handleDrop: NonNullable<DropZoneAreaProps['onDrop']> = (event) => {
    const names = event.items.filter(isFileDropItem).map((item) => item.name);
    if (names.length > 0) setFileNames(names);
  };
  // 文件选择器：DropZone.Input 的 onSelect（原站 API 签名 FileList）
  const handleSelect = (files: FileList) =>
    setFileNames(Array.from(files).map((file) => file.name));
  const handleRemoveFile = (name: string) =>
    setFileNames((prev) => prev.filter((item) => item !== name));

  return (
    <>
      <DemoSection label="拖放高亮 + 文件选择回显" isColumn>
        <DropZone style={{ width: 420 }}>
          <DropZone.Area onDrop={handleDrop}>
            <DropZone.Icon />
            <DropZone.Label>拖拽文件到此处上传</DropZone.Label>
            <DropZone.Description>支持 PDF、Word，单个不超过 20MB</DropZone.Description>
            <DropZone.Trigger>选择文件</DropZone.Trigger>
          </DropZone.Area>
          <DropZone.Input accept=".pdf,.doc,.docx" multiple onSelect={handleSelect} />
          {fileNames.length > 0 && (
            <DropZone.FileList>
              {fileNames.map((name) => (
                <DemoFileEntry key={name} name={name} onRemove={handleRemoveFile} />
              ))}
            </DropZone.FileList>
          )}
        </DropZone>
      </DemoSection>
      <DemoSection label="文件列表状态">
        <DropZone style={{ width: 420 }}>
          <DropZone.FileList>
            <DropZone.FileItem status="uploading">
              <DropZone.FileFormatIcon format="XLSX" color="green" />
              <DropZone.FileInfo>
                <DropZone.FileName>学员名单-2026春季班.xlsx</DropZone.FileName>
                <DropZone.FileMeta>1.2 MB | 上传中…</DropZone.FileMeta>
                <DropZone.FileProgress value={45} aria-label="上传进度">
                  <DropZone.FileProgressTrack>
                    <DropZone.FileProgressFill />
                  </DropZone.FileProgressTrack>
                </DropZone.FileProgress>
              </DropZone.FileInfo>
              <DropZone.FileRemoveTrigger aria-label="移除 学员名单-2026春季班.xlsx" onPress={noop} />
            </DropZone.FileItem>
            <DropZone.FileItem status="failed">
              <DropZone.FileFormatIcon format="ZIP" color="orange" />
              <DropZone.FileInfo>
                <DropZone.FileName>课件备份.zip</DropZone.FileName>
                <DropZone.FileMeta>18 MB | 上传失败</DropZone.FileMeta>
                <DropZone.FileRetryTrigger onPress={noop}>重试</DropZone.FileRetryTrigger>
              </DropZone.FileInfo>
              <DropZone.FileRemoveTrigger aria-label="移除 课件备份.zip" onPress={noop} />
            </DropZone.FileItem>
          </DropZone.FileList>
        </DropZone>
      </DemoSection>
    </>
  );
};

const CellSwitchDemo = () => {
  const [isReminderOn, setIsReminderOn] = useState(true);
  const handleReminderChange = (isSelected: boolean) => setIsReminderOn(isSelected);

  return (
    <DemoSection isColumn>
      <CellSwitch
        aria-label="开启课堂提醒"
        isSelected={isReminderOn}
        onChange={handleReminderChange}
        style={{ width: 320 }}
      >
        <CellSwitch.Trigger>
          <CellSwitch.Label>开启课堂提醒（受控：{isReminderOn ? '开' : '关'}）</CellSwitch.Label>
          <CellSwitch.Control />
        </CellSwitch.Trigger>
      </CellSwitch>
      <CellSwitch aria-label="次级样式" variant="secondary" defaultSelected style={{ width: 320 }}>
        <CellSwitch.Trigger>
          <CellSwitch.Label>次级样式</CellSwitch.Label>
          <CellSwitch.Control />
        </CellSwitch.Trigger>
      </CellSwitch>
      <CellSwitch aria-label="禁用项" isDisabled style={{ width: 320 }}>
        <CellSwitch.Trigger>
          <CellSwitch.Label>禁用项</CellSwitch.Label>
          <CellSwitch.Control />
        </CellSwitch.Trigger>
      </CellSwitch>
    </DemoSection>
  );
};

const CellSelectDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => setIsOpen((v) => !v);

  return (
    <DemoSection isColumn>
      <CellSelect
        label="上课时段"
        value="晚上 19:00–21:00"
        isOpen={isOpen}
        onTriggerClick={handleToggle}
        popover={<div style={{ padding: 8 }}>静态弹层内容</div>}
        style={{ width: 320 }}
      />
      <CellSelect label="次级样式" value="未设置" variant="secondary" style={{ width: 320 }} />
      <CellSelect label="禁用项" value="-" isDisabled style={{ width: 320 }} />
    </DemoSection>
  );
};

function noop() {
  // 演示用空回调
}

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

/** 原站 custom-indicator 基准快照中的对勾圆图标 */
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m3.1-8.55a.75.75 0 1 0-1.2-.9L7.419 8.858 6.03 7.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.13-.08z"
      clipRule="evenodd"
    />
  </svg>
);

const EarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8.5a6 6 0 1112 0c0 4.5-4 5-4 8a3 3 0 01-6 0" />
    <path d="M10 8.5a2 2 0 114 0" />
  </svg>
);

export const formsDemos: Record<string, ReactNode> = {
  input: <InputDemo />,
  textarea: <TextareaDemo />,
  checkbox: <CheckboxDemo />,
  radio: <RadioDemo />,
  switch: <SwitchDemo />,
  slider: <SliderDemo />,
  'native-select': <NativeSelectDemo />,
  'search-field': <SearchFieldDemo />,
  'number-field': <NumberFieldDemo />,
  tag: <TagDemo />,
  'checkbox-button-group': <CheckboxButtonGroupDemo />,
  'radio-button-group': <RadioButtonGroupDemo />,
  'number-stepper': <NumberStepperDemo />,
  'inline-select': <InlineSelectDemo />,
  'drop-zone': <DropZoneDemo />,
  'cell-switch': <CellSwitchDemo />,
  'cell-select': <CellSelectDemo />,
};
