import { useState, type ChangeEvent, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import Button from '../../components/button';
import Input from '../../components/input';
import Textarea from '../../components/textarea';
import Checkbox from '../../components/checkbox';
import Radio from '../../components/radio';
import Switch from '../../components/switch';
import Slider from '../../components/slider';
import NativeSelect from '../../components/native-select';
import SearchField from '../../components/search-field';
import NumberField from '../../components/number-field';
import Tag, { TagGroup, type TagSize, type TagVariant } from '../../components/tag';
import CheckboxButtonGroup from '../../components/checkbox-button-group';
import RadioButtonGroup from '../../components/radio-button-group';
import RichTextEditor, { type RichTextEditorJSONContent } from '../../components/rich-text-editor';
import NumberStepper from '../../components/number-stepper';
import InlineSelect from '../../components/inline-select';
import DropZone, {
  type DropZoneFileFormatIconColor,
  type DropZoneFileStatus,
  type DropZoneUploadQueueItem,
} from '../../components/drop-zone';
import CellSwitch from '../../components/cell-switch';
import CellSelect from '../../components/cell-select';
import CellSlider from '../../components/cell-slider';
import CellColorPicker, { parseCellColor, type CellColor } from '../../components/cell-color-picker';
import DemoSection from '../demo-section';

type DemoKey = string | number;

const InputDemo = () => (
  <>
    <DemoSection label="variants">
      <Input placeholder="默认输入框" />
      <Input variant="secondary" placeholder="次级输入框" />
    </DemoSection>
    <DemoSection label="校验状态" isColumn>
      <Input isInvalid style={{ width: 320 }}>
        <Input.Label>学员姓名</Input.Label>
        <Input.Field placeholder="例如：王同学" />
        <Input.Description>用于课表、报告与家长通知。</Input.Description>
        <Input.ErrorMessage>请输入学员姓名。</Input.ErrorMessage>
      </Input>
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
    <Textarea variant="secondary" style={{ width: 320 }}>
      <Textarea.Label>课后反馈</Textarea.Label>
      <Textarea.Field variant="secondary" placeholder="次级样式" rows={3} />
      <Textarea.Description>支持多行输入，适合记录课堂观察。</Textarea.Description>
    </Textarea>
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

const SliderDemo = () => {
  const [mastery, setMastery] = useState(0.65);

  return (
    <DemoSection isColumn>
      <Slider
        label="掌握度"
        value={mastery}
        onChange={setMastery}
        minValue={0}
        maxValue={1}
        step={0.05}
        formatOptions={{ style: 'percent', maximumFractionDigits: 0 }}
        marks={[0, 0.5, 1]}
        style={{ width: 320 }}
      />
      <Slider label="音量" defaultValue={40} style={{ width: 320 }} />
      <Slider label="进度" defaultValue={75} minValue={0} maxValue={100} style={{ width: 320 }} />
      <Slider label="禁用" defaultValue={20} isDisabled style={{ width: 320 }} />
    </DemoSection>
  );
};

const CAMPUS_NAMES: Record<string, string> = {
  bj: '北京校区',
  sh: '上海校区',
  gz: '广州校区',
};

const NativeSelectDemo = () => {
  const [campus, setCampus] = useState('bj');
  const handleCampusChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setCampus(event.target.value);

  return (
    <>
      <DemoSection label="label + description + 受控回显" isColumn>
        <NativeSelect fullWidth style={{ width: 240 }}>
          <NativeSelect.Label>所属校区</NativeSelect.Label>
          <NativeSelect.Trigger name="campus" value={campus} onChange={handleCampusChange}>
            <NativeSelect.Option value="bj">北京校区</NativeSelect.Option>
            <NativeSelect.Option value="sh">上海校区</NativeSelect.Option>
            <NativeSelect.Option value="gz">广州校区</NativeSelect.Option>
          </NativeSelect.Trigger>
          <NativeSelect.Description>当前选择：{CAMPUS_NAMES[campus]}</NativeSelect.Description>
        </NativeSelect>
        <NativeSelect fullWidth style={{ width: 240 }}>
          <NativeSelect.Label>所属教研组（分组 + 禁用项）</NativeSelect.Label>
          <NativeSelect.Trigger name="department" defaultValue="">
            <NativeSelect.Option value="">请选择教研组</NativeSelect.Option>
            <NativeSelect.OptGroup label="教学">
              <NativeSelect.Option value="english">英语教研组</NativeSelect.Option>
              <NativeSelect.Option value="vocab" disabled>
                词汇教研组（满员）
              </NativeSelect.Option>
            </NativeSelect.OptGroup>
            <NativeSelect.OptGroup label="运营">
              <NativeSelect.Option value="support">学员服务组</NativeSelect.Option>
            </NativeSelect.OptGroup>
          </NativeSelect.Trigger>
        </NativeSelect>
      </DemoSection>
      <DemoSection label="variants + 验证态 + 禁用">
        <NativeSelect variant="secondary" fullWidth style={{ width: 200 }}>
          <NativeSelect.Trigger aria-label="次级样式" defaultValue="a">
            <NativeSelect.Option value="a">次级选项 A</NativeSelect.Option>
            <NativeSelect.Option value="b">次级选项 B</NativeSelect.Option>
          </NativeSelect.Trigger>
        </NativeSelect>
        <NativeSelect aria-invalid="true" data-invalid="true" fullWidth style={{ width: 200 }}>
          <NativeSelect.Label>验证失败</NativeSelect.Label>
          <NativeSelect.Trigger defaultValue="">
            <NativeSelect.Option value="">必选项未选择</NativeSelect.Option>
            <NativeSelect.Option value="ok">合规选项</NativeSelect.Option>
          </NativeSelect.Trigger>
        </NativeSelect>
        <NativeSelect fullWidth style={{ width: 200 }}>
          <NativeSelect.Label>禁用</NativeSelect.Label>
          <NativeSelect.Trigger disabled defaultValue="done">
            <NativeSelect.Option value="done">已完成</NativeSelect.Option>
          </NativeSelect.Trigger>
        </NativeSelect>
      </DemoSection>
    </>
  );
};

const SearchFieldDemo = () => (
  <DemoSection isColumn>
    <SearchField label="搜索学员" placeholder="输入姓名或手机号" style={{ width: 320 }} />
    <SearchField variant="secondary" defaultValue="拓词" style={{ width: 320 }}>
      <SearchField.Label>内容检索</SearchField.Label>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="搜索课程、班级或学员" />
        <SearchField.ClearButton />
      </SearchField.Group>
      <SearchField.Description>可快速定位课程、班级和学员记录。</SearchField.Description>
    </SearchField>
  </DemoSection>
);

const NumberFieldDemo = () => (
  <DemoSection isColumn>
    <NumberField label="每日单词量" defaultValue={50} minValue={0} maxValue={500} step={10} style={{ width: 280 }} />
    <NumberField variant="secondary" defaultValue={3} minValue={1} maxValue={10} style={{ width: 280 }}>
      <NumberField.Label>每组题量</NumberField.Label>
      <NumberField.Group>
        <NumberField.DecrementButton />
        <NumberField.Input />
        <NumberField.IncrementButton />
      </NumberField.Group>
      <NumberField.Description>限制在 1-10 题之间。</NumberField.Description>
    </NumberField>
  </DemoSection>
);

const REMOVABLE_TAGS = ['React', 'TypeScript'];

const PREFERENCE_TAGS: { label: string; size?: TagSize; variant?: TagVariant }[] = [
  { label: '听力' },
  { label: '阅读' },
  { label: '拼写', variant: 'surface' },
  { label: '句型', size: 'sm' },
  { label: '填空', size: 'lg' },
];

const TagDemo = () => {
  const [tags, setTags] = useState(REMOVABLE_TAGS);
  const handleRemove = (tag: string) =>
    setTags((prev) => prev.filter((item) => item !== tag));
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['听力']);
  const handleTogglePreference = (label: string) =>
    setSelectedPreferences((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );

  return (
    <DemoSection isColumn>
      <TagGroup label="学习偏好" description="点选标签可切换选中态">
        {PREFERENCE_TAGS.map((tag) => (
          <Tag
            key={tag.label}
            size={tag.size}
            variant={tag.variant}
            isSelected={selectedPreferences.includes(tag.label)}
            onClick={() => handleTogglePreference(tag.label)}
          >
            {tag.label}
          </Tag>
        ))}
        <Tag isDisabled>禁用</Tag>
      </TagGroup>
      <TagGroup label="可移除标签">
        {tags.map((tag) => (
          <Tag key={tag} variant={tag === 'TypeScript' ? 'surface' : 'default'} onRemove={() => handleRemove(tag)}>
            {tag}
          </Tag>
        ))}
      </TagGroup>
    </DemoSection>
  );
};

const CheckboxButtonGroupDemo = () => {
  const [modules, setModules] = useState<string[]>(['reading']);
  const handleModulesChange = (value: string[]) => setModules(value);
  // 校验态：未选任何模块即视为无效，由底座 FieldError 渲染 errorMessage
  const modulesInvalid = modules.length === 0;

  return (
    <DemoSection isColumn>
      <CheckboxButtonGroup
        aria-label="训练模块（受控）"
        layout="grid"
        value={modules}
        onChange={handleModulesChange}
        isInvalid={modulesInvalid}
        errorMessage="请至少选择一个训练模块"
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

const SORT_OPTIONS = [
  { id: 'created', label: '按创建时间排序' },
  { id: 'updated', label: '按更新时间排序' },
  { id: 'name', label: '按名称排序' },
];

const InlineSelectDemo = () => {
  const [sortKey, setSortKey] = useState<DemoKey | null>('created');
  const handleSortChange = (value: DemoKey | null) => setSortKey(value);
  const sortLabel = SORT_OPTIONS.find((option) => option.id === sortKey)?.label ?? '未选择';

  return (
    <>
      <DemoSection label="受控单选（点击打开真实弹层）">
        <InlineSelect aria-label="排序方式" value={sortKey} onChange={handleSortChange}>
          <InlineSelect.Trigger>
            <InlineSelect.Value />
            <InlineSelect.Indicator />
          </InlineSelect.Trigger>
          <InlineSelect.Popover>
            <InlineSelect.List>
              {SORT_OPTIONS.map((option) => (
                <InlineSelect.Item key={option.id} id={option.id} textValue={option.label}>
                  {option.label}
                  <InlineSelect.ItemIndicator />
                </InlineSelect.Item>
              ))}
            </InlineSelect.List>
          </InlineSelect.Popover>
        </InlineSelect>
        <span>当前：{sortLabel}</span>
      </DemoSection>
      <DemoSection label="多选 + 禁用项">
        <InlineSelect aria-label="通知渠道" selectionMode="multiple" defaultValue={['email']}>
          <InlineSelect.Trigger>
            <InlineSelect.Value />
            <InlineSelect.Indicator />
          </InlineSelect.Trigger>
          <InlineSelect.Popover>
            <InlineSelect.List>
              <InlineSelect.Item id="email" textValue="邮件">
                邮件
                <InlineSelect.ItemIndicator />
              </InlineSelect.Item>
              <InlineSelect.Item id="sms" textValue="短信" isDisabled>
                短信（暂不可用）
                <InlineSelect.ItemIndicator />
              </InlineSelect.Item>
              <InlineSelect.Item id="push" textValue="推送">
                推送
                <InlineSelect.ItemIndicator />
              </InlineSelect.Item>
            </InlineSelect.List>
          </InlineSelect.Popover>
        </InlineSelect>
      </DemoSection>
      <DemoSection label="整体禁用">
        <InlineSelect aria-label="排序方式（禁用）" isDisabled defaultValue="locked">
          <InlineSelect.Trigger>
            <InlineSelect.Value />
            <InlineSelect.Indicator />
          </InlineSelect.Trigger>
          <InlineSelect.Popover>
            <InlineSelect.List>
              <InlineSelect.Item id="locked" textValue="锁定中">
                锁定中
                <InlineSelect.ItemIndicator />
              </InlineSelect.Item>
            </InlineSelect.List>
          </InlineSelect.Popover>
        </InlineSelect>
      </DemoSection>
    </>
  );
};

const UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
const DOCUMENT_ACCEPT = '.pdf,.doc,.docx';
const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

type DemoQueueFileLike = {
  name: string;
  size?: number;
  type?: string;
};

/** 从文件名提取大写扩展名作为格式徽标 */
const getFileFormat = (name: string) => {
  const ext = name.includes('.') ? name.split('.').pop() : undefined;
  return ext !== undefined && ext !== '' ? ext.toUpperCase() : 'FILE';
};

const getDemoQueueIconColor = (
  format: string,
  status: DropZoneFileStatus,
): DropZoneFileFormatIconColor => {
  if (status === 'failed') return 'red';
  if (format === 'PDF' || format === 'ZIP') return 'orange';
  if (format === 'DOC' || format === 'DOCX') return 'blue';
  if (format === 'XLS' || format === 'XLSX' || format === 'CSV') return 'green';
  if (format === 'PNG' || format === 'JPG' || format === 'JPEG' || format === 'WEBP') return 'purple';
  return 'gray';
};

const createDemoQueueItem = (
  file: DemoQueueFileLike,
  id: string,
  status: DropZoneFileStatus,
  options: Partial<Pick<DropZoneUploadQueueItem, 'progress' | 'error' | 'canRetry'>> = {},
): DropZoneUploadQueueItem => {
  const format = getFileFormat(file.name);
  const now = Date.now();

  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type,
    format,
    color: getDemoQueueIconColor(format, status),
    status,
    progress: options.progress ?? (status === 'complete' ? 100 : status === 'failed' ? 100 : 45),
    error: options.error,
    canRetry: options.canRetry ?? false,
    attempt: 1,
    source: 'api',
    createdAt: now,
    updatedAt: now,
  };
};

const INITIAL_STATUS_FILES: DropZoneUploadQueueItem[] = [
  createDemoQueueItem(
    { name: '学员名单-2026春季班.xlsx', size: 1.2 * 1024 * 1024 },
    'spring-students',
    'uploading',
    { progress: 45 },
  ),
  createDemoQueueItem(
    { name: '课件备份.zip', size: 18 * 1024 * 1024 },
    'course-backup',
    'failed',
    { error: '上传失败，请重试', canRetry: true },
  ),
];

const INITIAL_COMPACT_FILES: DropZoneUploadQueueItem[] = [
  createDemoQueueItem({ name: '课程合同.pdf', size: 640 * 1024 }, 'compact-contract', 'complete'),
  createDemoQueueItem({ name: '课堂记录.docx', size: 1.4 * 1024 * 1024 }, 'compact-notes', 'complete'),
];

const INITIAL_MAX_SIZE_FILES: DropZoneUploadQueueItem[] = [
  createDemoQueueItem({ name: '课程说明.pdf', size: 820 * 1024 }, 'max-size-valid', 'complete'),
  createDemoQueueItem(
    { name: '完整资料包.docx', size: 24.6 * 1024 * 1024 },
    'max-size-invalid',
    'failed',
    { error: '文件大小不能超过 20 MB' },
  ),
];

const shouldFailBackupUpload = (item: DropZoneUploadQueueItem) =>
  item.name.includes('备份') && item.attempt < 3;

const DropZoneDefaultVariantDemo = () => {
  return (
    <DemoSection label="拖放高亮 + 文件选择回显" isColumn>
      <DropZone accept={DOCUMENT_ACCEPT} maxSize={UPLOAD_MAX_BYTES} style={{ width: 420 }}>
        <DropZone.Area>
          <DropZone.Icon />
          <DropZone.Label>拖拽文件到此处上传</DropZone.Label>
          <DropZone.Description>支持 PDF、Word，单个不超过 20MB</DropZone.Description>
          <DropZone.Trigger>选择文件</DropZone.Trigger>
        </DropZone.Area>
        <DropZone.Input multiple />
        <DropZone.FileQueue />
      </DropZone>
    </DemoSection>
  );
};

const DropZoneMultipleFilesVariantDemo = () => (
  <DemoSection label="多文件上传" isColumn>
    <DropZone accept={DOCUMENT_ACCEPT} maxSize={UPLOAD_MAX_BYTES} style={{ width: 420 }}>
      <DropZone.Area>
        <DropZone.Icon />
        <DropZone.Label>一次拖入多个课件文件</DropZone.Label>
        <DropZone.Description>支持批量选择，列表会持续追加</DropZone.Description>
        <DropZone.Trigger>批量选择</DropZone.Trigger>
      </DropZone.Area>
      <DropZone.Input multiple />
      <DropZone.FileQueue />
    </DropZone>
  </DemoSection>
);

const DropZoneCustomIconVariantDemo = () => (
  <DemoSection label="自定义图标" isColumn>
    <DropZone accept={DOCUMENT_ACCEPT} maxSize={UPLOAD_MAX_BYTES} style={{ width: 420 }}>
      <DropZone.Area>
        <DropZone.Icon>
          <BookIcon />
        </DropZone.Icon>
        <DropZone.Label>上传课程资料</DropZone.Label>
        <DropZone.Description>课程图标会帮助区分资料类型</DropZone.Description>
        <DropZone.Trigger>选择资料</DropZone.Trigger>
      </DropZone.Area>
      <DropZone.Input multiple />
      <DropZone.FileQueue />
    </DropZone>
  </DemoSection>
);

const DropZoneCustomTriggersVariantDemo = () => (
  <DemoSection label="自定义触发器" isColumn>
    <DropZone accept={DOCUMENT_ACCEPT} maxSize={UPLOAD_MAX_BYTES} style={{ width: 420 }}>
      <DropZone.Area>
        <DropZone.Icon />
        <DropZone.Label>从多个入口选择文件</DropZone.Label>
        <DropZone.Description>可从合同或附件入口选择文件</DropZone.Description>
        <div style={{ display: 'flex', gap: 8 }}>
          <DropZone.Trigger>上传合同</DropZone.Trigger>
          <DropZone.Trigger>上传附件</DropZone.Trigger>
        </div>
      </DropZone.Area>
      <DropZone.Input multiple />
      <DropZone.FileQueue />
    </DropZone>
  </DemoSection>
);

const DropZoneImageOnlyVariantDemo = () => (
  <DemoSection label="仅图片" isColumn>
    <DropZone accept={IMAGE_ACCEPT} style={{ width: 420 }}>
      <DropZone.Area>
        <DropZone.Icon />
        <DropZone.Label>上传封面图</DropZone.Label>
        <DropZone.Description>仅接收 PNG、JPG、WEBP、GIF</DropZone.Description>
        <DropZone.Trigger>选择图片</DropZone.Trigger>
      </DropZone.Area>
      <DropZone.Input multiple />
      <DropZone.FileQueue />
    </DropZone>
  </DemoSection>
);

const DropZoneMaxSizeLimitVariantDemo = () => (
  <DemoSection label="大小限制反馈" isColumn>
    <DropZone
      accept={DOCUMENT_ACCEPT}
      maxSize={UPLOAD_MAX_BYTES}
      defaultQueue={INITIAL_MAX_SIZE_FILES}
      replaceQueueOnAdd
      simulateUpload={false}
      style={{ width: 420 }}
    >
      <DropZone.Area>
        <DropZone.Icon />
        <DropZone.Label>上传小于 20MB 的文档</DropZone.Label>
        <DropZone.Description>超过限制的文件会进入失败状态</DropZone.Description>
        <DropZone.Trigger>选择文件</DropZone.Trigger>
      </DropZone.Area>
      <DropZone.Input multiple />
      <DropZone.FileQueue />
    </DropZone>
  </DemoSection>
);

const DropZoneCompactFileListVariantDemo = () => (
  <DemoSection label="紧凑文件列表" isColumn>
    <DropZone defaultQueue={INITIAL_COMPACT_FILES} simulateUpload={false} style={{ width: 360 }}>
      <DropZone.FileQueue />
    </DropZone>
  </DemoSection>
);

const DropZoneUploadProgressVariantDemo = () => (
  <DemoSection label="上传进度与失败重试">
    <DropZone
      defaultQueue={INITIAL_STATUS_FILES}
      uploadInterval={650}
      uploadFailureMessage="上传失败，请重试"
      shouldFailUpload={shouldFailBackupUpload}
      style={{ width: 420 }}
    >
      <DropZone.FileQueue />
    </DropZone>
  </DemoSection>
);

const DropZoneDisabledVariantDemo = () => (
  <DemoSection label="整体禁用" isColumn>
    <DropZone isDisabled accept={DOCUMENT_ACCEPT} maxSize={UPLOAD_MAX_BYTES} style={{ width: 420 }}>
      <DropZone.Area>
        <DropZone.Icon />
        <DropZone.Label>上传入口已锁定</DropZone.Label>
        <DropZone.Description>禁用状态会同时阻止拖放与文件选择</DropZone.Description>
        <DropZone.Trigger>选择文件</DropZone.Trigger>
      </DropZone.Area>
      <DropZone.Input multiple />
    </DropZone>
  </DemoSection>
);

const DropZoneDemo = () => (
  <>
    <DropZoneDefaultVariantDemo />
    <DropZoneUploadProgressVariantDemo />
    <DropZoneDisabledVariantDemo />
  </>
);

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

const SLOT_OPTIONS = [
  { id: 'morning', label: '上午 09:00–11:00' },
  { id: 'afternoon', label: '下午 14:00–16:00' },
  { id: 'evening', label: '晚上 19:00–21:00' },
];

const CellSelectDemo = () => {
  const [slot, setSlot] = useState<DemoKey | null>('evening');
  const handleSlotChange = (value: DemoKey | null) => setSlot(value);
  const slotLabel = SLOT_OPTIONS.find((option) => option.id === slot)?.label ?? '未设置';

  return (
    <DemoSection isColumn>
      <CellSelect aria-label="上课时段" value={slot} onChange={handleSlotChange} style={{ width: 320 }}>
        <CellSelect.Trigger>
          <CellSelect.Label>上课时段（受控：{slotLabel}）</CellSelect.Label>
          <CellSelect.Value />
          <CellSelect.Indicator />
        </CellSelect.Trigger>
        <CellSelect.Popover>
          <CellSelect.List>
            {SLOT_OPTIONS.map((option) => (
              <CellSelect.Item key={option.id} id={option.id} textValue={option.label}>
                {option.label}
                <CellSelect.ItemIndicator />
              </CellSelect.Item>
            ))}
          </CellSelect.List>
        </CellSelect.Popover>
      </CellSelect>
      <CellSelect
        aria-label="提醒频率"
        variant="secondary"
        defaultValue="daily"
        style={{ width: 320 }}
      >
        <CellSelect.Trigger>
          <CellSelect.Label>提醒频率（次级 + 禁用项）</CellSelect.Label>
          <CellSelect.Value />
          <CellSelect.Indicator />
        </CellSelect.Trigger>
        <CellSelect.Popover>
          <CellSelect.List>
            <CellSelect.Item id="daily" textValue="每天">
              每天
              <CellSelect.ItemIndicator />
            </CellSelect.Item>
            <CellSelect.Item id="weekly" textValue="每周">
              每周
              <CellSelect.ItemIndicator />
            </CellSelect.Item>
            <CellSelect.Item id="never" textValue="从不" isDisabled>
              从不（不可选）
              <CellSelect.ItemIndicator />
            </CellSelect.Item>
          </CellSelect.List>
        </CellSelect.Popover>
      </CellSelect>
      <CellSelect aria-label="禁用项" isDisabled defaultValue="fixed" style={{ width: 320 }}>
        <CellSelect.Trigger>
          <CellSelect.Label>禁用整体</CellSelect.Label>
          <CellSelect.Value />
          <CellSelect.Indicator />
        </CellSelect.Trigger>
        <CellSelect.Popover>
          <CellSelect.List>
            <CellSelect.Item id="fixed" textValue="固定时段">
              固定时段
              <CellSelect.ItemIndicator />
            </CellSelect.Item>
          </CellSelect.List>
        </CellSelect.Popover>
      </CellSelect>
    </DemoSection>
  );
};

const CellSliderDemo = () => {
  const [spacing, setSpacing] = useState(0.5);
  const handleSpacingChange = (value: number | number[]) => {
    if (typeof value === 'number') {
      setSpacing(value);
    }
  };

  return (
    <DemoSection isColumn>
      <CellSlider
        aria-label="字间距"
        value={spacing}
        onChange={handleSpacingChange}
        minValue={0}
        maxValue={1}
        step={0.01}
        style={{ width: 320 }}
      >
        <CellSlider.Track>
          <CellSlider.Fill />
          <CellSlider.Thumb />
          <CellSlider.Label>字间距（受控：{spacing.toFixed(2)}）</CellSlider.Label>
          <CellSlider.Output />
        </CellSlider.Track>
      </CellSlider>
      <CellSlider
        aria-label="音量"
        defaultValue={75}
        minValue={0}
        maxValue={100}
        step={1}
        style={{ width: 320 }}
      >
        <CellSlider.Track>
          <CellSlider.Fill />
          <CellSlider.Thumb />
          <CellSlider.Label>音量（整数步进）</CellSlider.Label>
          <CellSlider.Output />
        </CellSlider.Track>
      </CellSlider>
      <CellSlider
        aria-label="次级样式"
        variant="secondary"
        defaultValue={0.5}
        minValue={0}
        maxValue={1}
        step={0.01}
        style={{ width: 320 }}
      >
        <CellSlider.Track>
          <CellSlider.Fill />
          <CellSlider.Thumb />
          <CellSlider.Label>次级样式</CellSlider.Label>
          <CellSlider.Output />
        </CellSlider.Track>
      </CellSlider>
      <CellSlider
        aria-label="禁用项"
        isDisabled
        defaultValue={0.3}
        minValue={0}
        maxValue={1}
        step={0.01}
        style={{ width: 320 }}
      >
        <CellSlider.Track>
          <CellSlider.Fill />
          <CellSlider.Thumb />
          <CellSlider.Label>禁用项</CellSlider.Label>
          <CellSlider.Output />
        </CellSlider.Track>
      </CellSlider>
    </DemoSection>
  );
};

const PRESET_COLORS = ['#3B82F6', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

const colorPanelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 8,
} satisfies CSSProperties;

const CellColorPickerDemo = () => {
  const [accent, setAccent] = useState(() => parseCellColor('#3B82F6'));
  const handleAccentChange = (color: CellColor) => setAccent(color);

  return (
    <DemoSection isColumn>
      <div style={{ width: 320 }}>
        <CellColorPicker value={accent} onChange={handleAccentChange}>
          <CellColorPicker.Trigger>
            <CellColorPicker.Label>主题色（受控）</CellColorPicker.Label>
            <CellColorPicker.ValueDisplay />
            <CellColorPicker.Swatch />
          </CellColorPicker.Trigger>
          <CellColorPicker.Popover>
            <div style={colorPanelStyle}>
              <CellColorPicker.Area colorSpace="hsb" xChannel="saturation" yChannel="brightness">
                <CellColorPicker.Area.Thumb />
              </CellColorPicker.Area>
              <CellColorPicker.Slider aria-label="色相" channel="hue" colorSpace="hsb">
                <CellColorPicker.Slider.Track>
                  <CellColorPicker.Slider.Thumb />
                </CellColorPicker.Slider.Track>
              </CellColorPicker.Slider>
              <CellColorPicker.SwatchPicker aria-label="预设色板">
                {PRESET_COLORS.map((preset) => (
                  <CellColorPicker.SwatchPicker.Item key={preset} color={preset}>
                    <CellColorPicker.SwatchPicker.Swatch />
                  </CellColorPicker.SwatchPicker.Item>
                ))}
              </CellColorPicker.SwatchPicker>
            </div>
          </CellColorPicker.Popover>
        </CellColorPicker>
      </div>
      <div style={{ width: 320 }}>
        <CellColorPicker variant="secondary" defaultValue="#22C55E">
          <CellColorPicker.Trigger>
            <CellColorPicker.Label>次级样式（仅预设色板）</CellColorPicker.Label>
            <CellColorPicker.ValueDisplay />
            <CellColorPicker.Swatch />
          </CellColorPicker.Trigger>
          <CellColorPicker.Popover>
            <div style={colorPanelStyle}>
              <CellColorPicker.SwatchPicker aria-label="预设色板">
                {PRESET_COLORS.map((preset) => (
                  <CellColorPicker.SwatchPicker.Item key={preset} color={preset}>
                    <CellColorPicker.SwatchPicker.Swatch />
                  </CellColorPicker.SwatchPicker.Item>
                ))}
              </CellColorPicker.SwatchPicker>
            </div>
          </CellColorPicker.Popover>
        </CellColorPicker>
      </div>
      <div style={{ width: 320 }}>
        <CellColorPicker defaultValue="#EF4444">
          <CellColorPicker.Trigger isDisabled>
            <CellColorPicker.Label>禁用项</CellColorPicker.Label>
            <CellColorPicker.ValueDisplay />
            <CellColorPicker.Swatch />
          </CellColorPicker.Trigger>
          <CellColorPicker.Popover>
            <div style={colorPanelStyle}>
              <CellColorPicker.SwatchPicker aria-label="预设色板">
                {PRESET_COLORS.map((preset) => (
                  <CellColorPicker.SwatchPicker.Item key={preset} color={preset}>
                    <CellColorPicker.SwatchPicker.Swatch />
                  </CellColorPicker.SwatchPicker.Item>
                ))}
              </CellColorPicker.SwatchPicker>
            </div>
          </CellColorPicker.Popover>
        </CellColorPicker>
      </div>
    </DemoSection>
  );
};

type CellSwitchVariantSlug =
  | 'controlled'
  | 'default'
  | 'disabled'
  | 'feature-announcement'
  | 'secondary-group'
  | 'settings-group'
  | 'variants';

const CellSwitchVariantDemo = ({ variant }: { variant: CellSwitchVariantSlug }) => {
  const [selected, setSelected] = useState(variant !== 'default');
  const handleSelectedChange = (isSelected: boolean) => setSelected(isSelected);
  const width = variant === 'feature-announcement' ? 420 : 340;

  if (variant === 'settings-group' || variant === 'secondary-group') {
    return (
      <DemoSection label={variant === 'secondary-group' ? 'Secondary group' : 'Settings group'} isColumn>
        {[
          ['课堂提醒', 'lesson'],
          ['作业截止提醒', 'homework'],
          ['学习周报', 'weekly'],
        ].map(([label, key], index) => (
          <CellSwitch
            key={key}
            aria-label={label}
            defaultSelected={index !== 1}
            variant={variant === 'secondary-group' ? 'secondary' : 'default'}
            style={{ width }}
          >
            <CellSwitch.Trigger>
              <CellSwitch.Label>{label}</CellSwitch.Label>
              <CellSwitch.Control />
            </CellSwitch.Trigger>
          </CellSwitch>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'variants') {
    return (
      <DemoSection label="Default + secondary variants" isColumn>
        <CellSwitch aria-label="默认视觉" defaultSelected style={{ width }}>
          <CellSwitch.Trigger>
            <CellSwitch.Label>默认视觉</CellSwitch.Label>
            <CellSwitch.Control />
          </CellSwitch.Trigger>
        </CellSwitch>
        <CellSwitch aria-label="次级视觉" variant="secondary" defaultSelected style={{ width }}>
          <CellSwitch.Trigger>
            <CellSwitch.Label>次级视觉</CellSwitch.Label>
            <CellSwitch.Control />
          </CellSwitch.Trigger>
        </CellSwitch>
      </DemoSection>
    );
  }

  return (
    <DemoSection
      label={
        variant === 'controlled'
          ? 'Controlled switch'
          : variant === 'disabled'
            ? 'Disabled switch'
            : variant === 'feature-announcement'
              ? 'Feature announcement'
              : 'Default switch'
      }
      isColumn
    >
      <CellSwitch
        aria-label="AI 学习提醒"
        isDisabled={variant === 'disabled'}
        isSelected={variant === 'controlled' || variant === 'feature-announcement' ? selected : undefined}
        defaultSelected={variant === 'default' ? true : undefined}
        onChange={variant === 'controlled' || variant === 'feature-announcement' ? handleSelectedChange : undefined}
        style={{ width }}
      >
        <CellSwitch.Trigger>
          <CellSwitch.Label>
            {variant === 'feature-announcement'
              ? `新版 AI 讲解已${selected ? '开启' : '关闭'}`
              : variant === 'controlled'
                ? `自动学习提醒：${selected ? '开启' : '关闭'}`
                : variant === 'disabled'
                  ? '组织策略锁定'
                  : '自动学习提醒'}
          </CellSwitch.Label>
          <CellSwitch.Control />
        </CellSwitch.Trigger>
      </CellSwitch>
    </DemoSection>
  );
};

type CellSelectVariantSlug =
  | 'controlled'
  | 'custom-value'
  | 'default'
  | 'disabled'
  | 'font-family'
  | 'settings-group'
  | 'variants';

const CellSelectVariantDemo = ({ variant }: { variant: CellSelectVariantSlug }) => {
  const [slot, setSlot] = useState<DemoKey | null>('afternoon');
  const handleSlotChange = (value: DemoKey | null) => setSlot(value);
  const slotLabel = SLOT_OPTIONS.find((option) => option.id === slot)?.label ?? '未设置';
  const width = variant === 'settings-group' ? 380 : 340;

  const renderSlotSelect = (label: string, value?: DemoKey | null) => (
    <CellSelect
      aria-label={label}
      value={value}
      onChange={value !== undefined ? handleSlotChange : undefined}
      defaultValue={value === undefined ? 'morning' : undefined}
      isDisabled={variant === 'disabled'}
      variant={variant === 'variants' ? 'secondary' : 'default'}
      style={{ width }}
    >
      <CellSelect.Trigger>
        <CellSelect.Label>{label}</CellSelect.Label>
        <CellSelect.Value />
        <CellSelect.Indicator />
      </CellSelect.Trigger>
      <CellSelect.Popover>
        <CellSelect.List>
          {SLOT_OPTIONS.map((option) => (
            <CellSelect.Item key={option.id} id={option.id} textValue={option.label}>
              {option.label}
              <CellSelect.ItemIndicator />
            </CellSelect.Item>
          ))}
        </CellSelect.List>
      </CellSelect.Popover>
    </CellSelect>
  );

  if (variant === 'settings-group') {
    return (
      <DemoSection label="Settings group" isColumn>
        {renderSlotSelect('上课时段', undefined)}
        <CellSelect aria-label="提醒频率" defaultValue="daily" variant="secondary" style={{ width }}>
          <CellSelect.Trigger>
            <CellSelect.Label>提醒频率</CellSelect.Label>
            <CellSelect.Value />
            <CellSelect.Indicator />
          </CellSelect.Trigger>
          <CellSelect.Popover>
            <CellSelect.List>
              <CellSelect.Item id="daily" textValue="每天">
                每天
                <CellSelect.ItemIndicator />
              </CellSelect.Item>
              <CellSelect.Item id="weekly" textValue="每周">
                每周
                <CellSelect.ItemIndicator />
              </CellSelect.Item>
            </CellSelect.List>
          </CellSelect.Popover>
        </CellSelect>
      </DemoSection>
    );
  }

  if (variant === 'font-family') {
    return (
      <DemoSection label="Font family select" isColumn>
        <CellSelect aria-label="字体" defaultValue="inter" style={{ width }}>
          <CellSelect.Trigger>
            <CellSelect.Label>字体</CellSelect.Label>
            <CellSelect.Value />
            <CellSelect.Indicator />
          </CellSelect.Trigger>
          <CellSelect.Popover>
            <CellSelect.List>
              {[
                ['inter', 'Inter', 'Inter, sans-serif'],
                ['serif', 'Georgia', 'Georgia, serif'],
                ['mono', 'JetBrains Mono', 'monospace'],
              ].map(([id, label, family]) => (
                <CellSelect.Item key={id} id={id} textValue={label} style={{ fontFamily: family }}>
                  {label}
                  <CellSelect.ItemIndicator />
                </CellSelect.Item>
              ))}
            </CellSelect.List>
          </CellSelect.Popover>
        </CellSelect>
      </DemoSection>
    );
  }

  if (variant === 'custom-value') {
    // 真正行使 SelectValue 的函数式 children（SelectValueRenderProps）：根据
    // isPlaceholder/selectedText 渲染自定义标记，而非把选中态塞进 Label 文案里伪造。
    return (
      <DemoSection label="Custom value display" isColumn>
        <CellSelect aria-label="上课时段" value={slot} onChange={handleSlotChange} style={{ width }}>
          <CellSelect.Trigger>
            <CellSelect.Label>上课时段</CellSelect.Label>
            <CellSelect.Value>
              {({ isPlaceholder, selectedText }) =>
                isPlaceholder ? (
                  <span data-testid="cell-select-custom-placeholder" className="text-muted">
                    请选择时段
                  </span>
                ) : (
                  <span data-testid="cell-select-custom-value">已约：{selectedText}</span>
                )
              }
            </CellSelect.Value>
            <CellSelect.Indicator />
          </CellSelect.Trigger>
          <CellSelect.Popover>
            <CellSelect.List>
              {SLOT_OPTIONS.map((option) => (
                <CellSelect.Item key={option.id} id={option.id} textValue={option.label}>
                  {option.label}
                  <CellSelect.ItemIndicator />
                </CellSelect.Item>
              ))}
            </CellSelect.List>
          </CellSelect.Popover>
        </CellSelect>
        <span className="text-muted text-sm">选中态由 Value 的函数式 children 自定义渲染。</span>
      </DemoSection>
    );
  }

  if (variant === 'variants') {
    return (
      <DemoSection label="Default + secondary variants" isColumn>
        {renderSlotSelect('默认视觉', undefined)}
        <CellSelect aria-label="次级视觉" defaultValue="daily" variant="secondary" style={{ width }}>
          <CellSelect.Trigger>
            <CellSelect.Label>次级视觉</CellSelect.Label>
            <CellSelect.Value />
            <CellSelect.Indicator />
          </CellSelect.Trigger>
          <CellSelect.Popover>
            <CellSelect.List>
              <CellSelect.Item id="daily" textValue="每天">
                每天
                <CellSelect.ItemIndicator />
              </CellSelect.Item>
              <CellSelect.Item id="weekly" textValue="每周">
                每周
                <CellSelect.ItemIndicator />
              </CellSelect.Item>
            </CellSelect.List>
          </CellSelect.Popover>
        </CellSelect>
      </DemoSection>
    );
  }

  return (
    <DemoSection
      label={
        variant === 'controlled'
          ? 'Controlled select'
          : variant === 'disabled'
            ? 'Disabled select'
            : 'Default select'
      }
      isColumn
    >
      {renderSlotSelect(
        variant === 'controlled' ? `上课时段：${slotLabel}` : variant === 'disabled' ? '禁用时段' : '上课时段',
        variant === 'controlled' ? slot : undefined,
      )}
    </DemoSection>
  );
};

type CellSliderVariantSlug =
  | 'controlled'
  | 'default'
  | 'disabled'
  | 'integer-step'
  | 'secondary-group'
  | 'settings-group'
  | 'variants';

const CellSliderField = ({
  label,
  defaultValue,
  value,
  onChange,
  minValue = 0,
  maxValue = 1,
  step = 0.01,
  variant,
  isDisabled,
  width = 340,
}: {
  label: string;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number | number[]) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  variant?: 'default' | 'secondary';
  isDisabled?: boolean;
  width?: number;
}) => (
  <CellSlider
    aria-label={label}
    defaultValue={defaultValue}
    value={value}
    onChange={onChange}
    minValue={minValue}
    maxValue={maxValue}
    step={step}
    variant={variant}
    isDisabled={isDisabled}
    style={{ width }}
  >
    <CellSlider.Track>
      <CellSlider.Fill />
      <CellSlider.Thumb />
      <CellSlider.Label>{label}</CellSlider.Label>
      <CellSlider.Output />
    </CellSlider.Track>
  </CellSlider>
);

const CellSliderVariantDemo = ({ variant }: { variant: CellSliderVariantSlug }) => {
  const [density, setDensity] = useState(0.62);
  const handleDensityChange = (value: number | number[]) => {
    if (typeof value === 'number') setDensity(value);
  };

  if (variant === 'settings-group' || variant === 'secondary-group') {
    return (
      <DemoSection label={variant === 'secondary-group' ? 'Secondary group' : 'Settings group'} isColumn>
        <CellSliderField label="字间距" defaultValue={0.42} width={360} />
        <CellSliderField
          label="朗读速度"
          defaultValue={0.72}
          variant={variant === 'secondary-group' ? 'secondary' : 'default'}
          width={360}
        />
        <CellSliderField label="提示强度" defaultValue={0.3} width={360} />
      </DemoSection>
    );
  }

  if (variant === 'variants') {
    return (
      <DemoSection label="Default + secondary variants" isColumn>
        <CellSliderField label="默认视觉" defaultValue={0.5} />
        <CellSliderField label="次级视觉" defaultValue={0.5} variant="secondary" />
      </DemoSection>
    );
  }

  return (
    <DemoSection
      label={
        variant === 'controlled'
          ? 'Controlled slider'
          : variant === 'disabled'
            ? 'Disabled slider'
            : variant === 'integer-step'
              ? 'Integer step'
              : 'Default slider'
      }
      isColumn
    >
      <CellSliderField
        label={
          variant === 'controlled'
            ? `学习密度：${Math.round(density * 100)}%`
            : variant === 'integer-step'
              ? '音量（整数步进）'
              : variant === 'disabled'
                ? '禁用滑杆'
                : '学习密度'
        }
        value={variant === 'controlled' ? density : undefined}
        onChange={variant === 'controlled' ? handleDensityChange : undefined}
        defaultValue={variant === 'integer-step' ? 75 : variant === 'disabled' ? 0.25 : 0.5}
        minValue={0}
        maxValue={variant === 'integer-step' ? 100 : 1}
        step={variant === 'integer-step' ? 1 : 0.01}
        isDisabled={variant === 'disabled'}
      />
    </DemoSection>
  );
};

type CellColorPickerVariantSlug =
  | 'controlled'
  | 'default'
  | 'disabled'
  | 'settings-group'
  | 'variants'
  | 'with-presets';

const ColorPickerPanel = ({ withArea = true }: { withArea?: boolean }) => (
  <div style={colorPanelStyle}>
    {withArea && (
      <>
        <CellColorPicker.Area colorSpace="hsb" xChannel="saturation" yChannel="brightness">
          <CellColorPicker.Area.Thumb />
        </CellColorPicker.Area>
        <CellColorPicker.Slider aria-label="色相" channel="hue" colorSpace="hsb">
          <CellColorPicker.Slider.Track>
            <CellColorPicker.Slider.Thumb />
          </CellColorPicker.Slider.Track>
        </CellColorPicker.Slider>
      </>
    )}
    <CellColorPicker.SwatchPicker aria-label="预设色板">
      {PRESET_COLORS.map((preset) => (
        <CellColorPicker.SwatchPicker.Item key={preset} color={preset}>
          <CellColorPicker.SwatchPicker.Swatch />
        </CellColorPicker.SwatchPicker.Item>
      ))}
    </CellColorPicker.SwatchPicker>
  </div>
);

const CellColorPickerField = ({
  label,
  value,
  onChange,
  defaultValue,
  variant,
  isDisabled,
  withArea,
}: {
  label: string;
  value?: CellColor;
  onChange?: (color: CellColor) => void;
  defaultValue?: string;
  variant?: 'default' | 'secondary';
  isDisabled?: boolean;
  withArea?: boolean;
}) => (
  <div style={{ width: 340 }}>
    <CellColorPicker value={value} onChange={onChange} defaultValue={defaultValue} variant={variant}>
      <CellColorPicker.Trigger isDisabled={isDisabled}>
        <CellColorPicker.Label>{label}</CellColorPicker.Label>
        <CellColorPicker.ValueDisplay />
        <CellColorPicker.Swatch />
      </CellColorPicker.Trigger>
      <CellColorPicker.Popover>
        <ColorPickerPanel withArea={withArea} />
      </CellColorPicker.Popover>
    </CellColorPicker>
  </div>
);

const CellColorPickerVariantDemo = ({ variant }: { variant: CellColorPickerVariantSlug }) => {
  const [accent, setAccent] = useState(() => parseCellColor('#3B82F6'));
  const handleAccentChange = (color: CellColor) => setAccent(color);

  if (variant === 'settings-group') {
    return (
      <DemoSection label="Settings group" isColumn>
        <CellColorPickerField label="主题色" defaultValue="#3B82F6" withArea />
        <CellColorPickerField label="成功色" defaultValue="#22C55E" withArea={false} />
        <CellColorPickerField label="警告色" defaultValue="#F59E0B" withArea={false} />
      </DemoSection>
    );
  }

  if (variant === 'variants') {
    return (
      <DemoSection label="Default + secondary variants" isColumn>
        <CellColorPickerField label="默认视觉" defaultValue="#3B82F6" withArea={false} />
        <CellColorPickerField label="次级视觉" defaultValue="#22C55E" variant="secondary" withArea={false} />
      </DemoSection>
    );
  }

  return (
    <DemoSection
      label={
        variant === 'controlled'
          ? 'Controlled color picker'
          : variant === 'disabled'
            ? 'Disabled color picker'
            : variant === 'with-presets'
              ? 'Preset swatches'
              : 'Default color picker'
      }
      isColumn
    >
      <CellColorPickerField
        label={
          variant === 'controlled'
            ? '主题色（受控）'
            : variant === 'disabled'
              ? '禁用主题色'
              : variant === 'with-presets'
                ? '品牌预设色'
                : '主题色'
        }
        value={variant === 'controlled' ? accent : undefined}
        onChange={variant === 'controlled' ? handleAccentChange : undefined}
        defaultValue={variant === 'disabled' ? '#EF4444' : '#3B82F6'}
        isDisabled={variant === 'disabled'}
        withArea={variant !== 'with-presets'}
      />
      {variant === 'controlled' && <span className="text-muted text-sm">当前颜色：{accent.toString('hex')}</span>}
    </DemoSection>
  );
};

type ChoiceGroupVariantSlug =
  | 'controlled'
  | 'custom-indicator'
  | 'default'
  | 'disabled-group'
  | 'grid-layout'
  | 'icon-cards'
  | 'no-indicator'
  | 'render-prop-children'
  | 'subscription-plans'
  | 'with-icons'
  | 'with-ripple'
  | 'delivery-and-payment';

type ChoiceIconName = 'book' | 'ear' | 'check';

const MODULE_OPTIONS: ChoiceOption[] = [
  { id: 'reading', title: '阅读训练', description: '精读与泛读结合', icon: 'book' },
  { id: 'listening', title: '听力训练', description: '分级听写练习', icon: 'ear' },
  { id: 'grammar', title: '语法巩固', description: '错题规则复盘', icon: 'check' },
];

const PLAN_OPTIONS: ChoiceOption[] = [
  { id: 'starter', title: 'Starter', description: '适合小班试用', icon: 'book' },
  { id: 'team', title: 'Team', description: '多人协作与报表', icon: 'ear' },
  { id: 'business', title: 'Business', description: '权限、审计与支持', icon: 'check' },
];

const PAYMENT_OPTIONS: ChoiceOption[] = [
  { id: 'card', title: '银行卡', description: '尾号 1024 的默认卡', icon: 'check' },
  { id: 'invoice', title: '企业月结', description: '开票后统一结算', icon: 'book' },
  { id: 'transfer', title: '银行转账', description: '需财务人工确认', icon: 'ear' },
];

type ChoiceOption = {
  id: string;
  title: string;
  description: string;
  icon: ChoiceIconName;
};

const renderChoiceIcon = (icon: ChoiceIconName) => {
  if (icon === 'book') return <BookIcon />;
  if (icon === 'ear') return <EarIcon />;
  return <CheckCircleIcon />;
};

const CheckboxChoiceItem = ({
  option,
  customIndicator,
  hideIndicator,
  withIcon,
  withRipple,
  isDisabled,
}: {
  option: ChoiceOption;
  customIndicator?: boolean;
  hideIndicator?: boolean;
  withIcon?: boolean;
  withRipple?: boolean;
  isDisabled?: boolean;
}) => (
  <CheckboxButtonGroup.Item value={option.id} isDisabled={isDisabled} withRipple={withRipple}>
    {!hideIndicator && (
      <CheckboxButtonGroup.Indicator>
        {customIndicator ? <CheckCircleIcon /> : undefined}
      </CheckboxButtonGroup.Indicator>
    )}
    {withIcon && (
      <CheckboxButtonGroup.ItemIcon>{renderChoiceIcon(option.icon)}</CheckboxButtonGroup.ItemIcon>
    )}
    <CheckboxButtonGroup.ItemContent>
      <strong>{option.title}</strong>
      <span>{option.description}</span>
    </CheckboxButtonGroup.ItemContent>
  </CheckboxButtonGroup.Item>
);

const RadioChoiceItem = ({
  option,
  customIndicator,
  hideIndicator,
  withIcon,
  withRipple,
  isDisabled,
}: {
  option: ChoiceOption;
  customIndicator?: boolean;
  hideIndicator?: boolean;
  withIcon?: boolean;
  withRipple?: boolean;
  isDisabled?: boolean;
}) => (
  <RadioButtonGroup.Item value={option.id} isDisabled={isDisabled} withRipple={withRipple}>
    {!hideIndicator && (
      <RadioButtonGroup.Indicator>
        {customIndicator ? <CheckCircleIcon /> : undefined}
      </RadioButtonGroup.Indicator>
    )}
    {withIcon && <RadioButtonGroup.ItemIcon>{renderChoiceIcon(option.icon)}</RadioButtonGroup.ItemIcon>}
    <RadioButtonGroup.ItemContent>
      <strong>{option.title}</strong>
      <span>{option.description}</span>
    </RadioButtonGroup.ItemContent>
  </RadioButtonGroup.Item>
);

const CheckboxRenderPropItem = ({ option }: { option: ChoiceOption }) => (
  <CheckboxButtonGroup.Item value={option.id}>
    {({ isSelected }) => (
      <>
        <CheckboxButtonGroup.Indicator />
        <CheckboxButtonGroup.ItemContent>
          <strong>{option.title}</strong>
          <span>{isSelected ? '已加入训练计划' : option.description}</span>
        </CheckboxButtonGroup.ItemContent>
      </>
    )}
  </CheckboxButtonGroup.Item>
);

const RadioRenderPropItem = ({ option }: { option: ChoiceOption }) => (
  <RadioButtonGroup.Item value={option.id}>
    {({ isSelected }) => (
      <>
        <RadioButtonGroup.Indicator />
        <RadioButtonGroup.ItemContent>
          <strong>{option.title}</strong>
          <span>{isSelected ? '当前首选方案' : option.description}</span>
        </RadioButtonGroup.ItemContent>
      </>
    )}
  </RadioButtonGroup.Item>
);

const CheckboxButtonGroupVariantDemo = ({ variant }: { variant: ChoiceGroupVariantSlug }) => {
  const [modules, setModules] = useState<string[]>(['reading']);
  const handleModulesChange = (value: string[]) => setModules(value);
  const options = variant === 'subscription-plans' ? PLAN_OPTIONS : MODULE_OPTIONS;
  const useGrid =
    variant === 'grid-layout' ||
    variant === 'subscription-plans' ||
    variant === 'icon-cards' ||
    variant === 'with-icons';

  return (
    <DemoSection
      label={
        variant === 'controlled'
          ? `Controlled group (${modules.length})`
          : variant === 'custom-indicator'
            ? 'Custom indicator'
            : variant === 'disabled-group'
              ? 'Disabled group'
              : variant === 'grid-layout'
                ? 'Grid layout'
                : variant === 'icon-cards'
                  ? 'Icon cards'
                  : variant === 'no-indicator'
                    ? 'No indicator'
                    : variant === 'render-prop-children'
                      ? 'Render prop children'
                      : variant === 'subscription-plans'
                        ? 'Subscription plans'
                        : variant === 'with-icons'
                          ? 'With icons'
                          : variant === 'with-ripple'
                            ? 'With ripple feedback'
                            : 'Default checkbox buttons'
      }
      isColumn
    >
      <CheckboxButtonGroup
        aria-label="训练模块"
        value={variant === 'controlled' ? modules : undefined}
        onChange={variant === 'controlled' ? handleModulesChange : undefined}
        defaultValue={variant === 'controlled' ? undefined : ['reading']}
        isDisabled={variant === 'disabled-group'}
        layout={useGrid ? 'grid' : 'flex'}
        style={{
          width: useGrid ? 520 : 480,
          gridTemplateColumns: useGrid ? 'repeat(3, minmax(0, 1fr))' : undefined,
        }}
      >
        {options.map((option, index) =>
          variant === 'render-prop-children' ? (
            <CheckboxRenderPropItem key={option.id} option={option} />
          ) : (
            <CheckboxChoiceItem
              key={option.id}
              option={option}
              customIndicator={variant === 'custom-indicator'}
              hideIndicator={variant === 'no-indicator'}
              withIcon={variant === 'icon-cards' || variant === 'with-icons'}
              withRipple={variant === 'with-ripple'}
              isDisabled={variant === 'disabled-group' || (variant === 'default' && index === 2)}
            />
          ),
        )}
      </CheckboxButtonGroup>
      {variant === 'controlled' && <span className="text-muted text-sm">已选择：{modules.join(', ')}</span>}
    </DemoSection>
  );
};

const RadioButtonGroupVariantDemo = ({ variant }: { variant: ChoiceGroupVariantSlug }) => {
  const [plan, setPlan] = useState('team');
  const handlePlanChange = (value: string) => setPlan(value);
  const options =
    variant === 'delivery-and-payment'
      ? PAYMENT_OPTIONS
      : variant === 'subscription-plans'
        ? PLAN_OPTIONS
        : MODULE_OPTIONS;
  const useGrid =
    variant === 'grid-layout' ||
    variant === 'subscription-plans' ||
    variant === 'icon-cards' ||
    variant === 'delivery-and-payment' ||
    variant === 'with-icons';

  return (
    <DemoSection
      label={
        variant === 'controlled'
          ? `Controlled group (${plan})`
          : variant === 'custom-indicator'
            ? 'Custom indicator'
            : variant === 'disabled-group'
              ? 'Disabled group'
              : variant === 'delivery-and-payment'
                ? 'Delivery and payment'
                : variant === 'grid-layout'
                  ? 'Grid layout'
                  : variant === 'icon-cards'
                    ? 'Icon cards'
                    : variant === 'no-indicator'
                      ? 'No indicator'
                      : variant === 'render-prop-children'
                        ? 'Render prop children'
                        : variant === 'subscription-plans'
                          ? 'Subscription plans'
                          : variant === 'with-icons'
                            ? 'With icons'
                            : variant === 'with-ripple'
                              ? 'With ripple feedback'
                              : 'Default radio buttons'
      }
      isColumn
    >
      <RadioButtonGroup
        aria-label="方案选择"
        value={variant === 'controlled' ? plan : undefined}
        onChange={variant === 'controlled' ? handlePlanChange : undefined}
        defaultValue={variant === 'controlled' ? undefined : options[0]?.id}
        isDisabled={variant === 'disabled-group'}
        layout={useGrid ? 'grid' : 'flex'}
        style={{
          width: useGrid ? 520 : 480,
          gridTemplateColumns: useGrid ? 'repeat(3, minmax(0, 1fr))' : undefined,
        }}
      >
        {options.map((option, index) =>
          variant === 'render-prop-children' ? (
            <RadioRenderPropItem key={option.id} option={option} />
          ) : (
            <RadioChoiceItem
              key={option.id}
              option={option}
              customIndicator={variant === 'custom-indicator'}
              hideIndicator={variant === 'no-indicator'}
              withIcon={
                variant === 'icon-cards' ||
                variant === 'with-icons' ||
                variant === 'delivery-and-payment'
              }
              withRipple={variant === 'with-ripple'}
              isDisabled={variant === 'disabled-group' || (variant === 'default' && index === 2)}
            />
          ),
        )}
      </RadioButtonGroup>
      {variant === 'controlled' && <span className="text-muted text-sm">当前方案：{plan}</span>}
    </DemoSection>
  );
};

type InlineSelectVariantSlug =
  | 'custom-indicator'
  | 'default'
  | 'multi-select'
  | 'placements'
  | 'team-switcher';

const InlineSelectVariantDemo = ({ variant }: { variant: InlineSelectVariantSlug }) => {
  const [team, setTeam] = useState<DemoKey | null>('growth');
  const handleTeamChange = (value: DemoKey | null) => setTeam(value);
  const teams = [
    { id: 'growth', label: '增长组' },
    { id: 'content', label: '内容组' },
    { id: 'teaching', label: '教研组' },
  ];

  if (variant === 'placements') {
    return (
      <DemoSection label="Placements">
        {(['bottom start', 'bottom end', 'top end'] as const).map((placement) => (
          <InlineSelect key={placement} aria-label={placement} defaultValue="growth">
            <InlineSelect.Trigger>
              <InlineSelect.Value />
              <InlineSelect.Indicator />
            </InlineSelect.Trigger>
            <InlineSelect.Popover placement={placement}>
              <InlineSelect.List>
                {teams.map((teamOption) => (
                  <InlineSelect.Item key={teamOption.id} id={teamOption.id} textValue={teamOption.label}>
                    {teamOption.label}
                    <InlineSelect.ItemIndicator />
                  </InlineSelect.Item>
                ))}
              </InlineSelect.List>
            </InlineSelect.Popover>
          </InlineSelect>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'multi-select') {
    return (
      <DemoSection label="Multi select">
        <InlineSelect aria-label="团队" defaultValue={['growth', 'content']} selectionMode="multiple">
          <InlineSelect.Trigger>
            <InlineSelect.Value />
            <InlineSelect.Indicator />
          </InlineSelect.Trigger>
          <InlineSelect.Popover>
            <InlineSelect.List>
              {teams.map((teamOption) => (
                <InlineSelect.Item key={teamOption.id} id={teamOption.id} textValue={teamOption.label}>
                  {teamOption.label}
                  <InlineSelect.ItemIndicator />
                </InlineSelect.Item>
              ))}
            </InlineSelect.List>
          </InlineSelect.Popover>
        </InlineSelect>
      </DemoSection>
    );
  }

  return (
    <DemoSection
      label={
        variant === 'custom-indicator'
          ? 'Custom indicator'
          : variant === 'team-switcher'
              ? 'Team switcher'
              : 'Default inline select'
      }
    >
      <InlineSelect
        aria-label="团队"
        value={variant === 'team-switcher' ? team : undefined}
        onChange={variant === 'team-switcher' ? handleTeamChange : undefined}
        defaultValue={variant === 'team-switcher' ? undefined : 'growth'}
      >
        <InlineSelect.Trigger>
          <InlineSelect.Value />
          <InlineSelect.Indicator>{variant === 'custom-indicator' ? <CheckCircleIcon /> : undefined}</InlineSelect.Indicator>
        </InlineSelect.Trigger>
        <InlineSelect.Popover>
          <InlineSelect.List>
            {teams.map((teamOption) => (
              <InlineSelect.Item key={teamOption.id} id={teamOption.id} textValue={teamOption.label}>
                {teamOption.label}
                <InlineSelect.ItemIndicator />
              </InlineSelect.Item>
            ))}
          </InlineSelect.List>
        </InlineSelect.Popover>
      </InlineSelect>
      {variant === 'team-switcher' && <span className="text-muted text-sm">当前团队：{String(team)}</span>}
    </DemoSection>
  );
};

type NativeSelectVariantSlug =
  | 'controlled'
  | 'custom-indicator'
  | 'default'
  | 'disabled-select'
  | 'form-example'
  | 'full-width'
  | 'invalid-state'
  | 'variants'
  | 'with-description'
  | 'with-disabled-options'
  | 'with-groups'
  | 'with-label';

const NativeSelectVariantDemo = ({ variant }: { variant: NativeSelectVariantSlug }) => {
  const [campus, setCampus] = useState('bj');
  const [savedCampus, setSavedCampus] = useState('未提交');
  const handleCampusChange = (event: ChangeEvent<HTMLSelectElement>) => setCampus(event.target.value);
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedCampus(CAMPUS_NAMES[campus]);
  };
  const width = variant === 'full-width' ? '100%' : 260;

  const selectOptions = (
    <>
      <NativeSelect.Option value="bj">北京校区</NativeSelect.Option>
      <NativeSelect.Option value="sh">上海校区</NativeSelect.Option>
      <NativeSelect.Option value="gz">广州校区</NativeSelect.Option>
      {variant === 'with-disabled-options' && (
        <NativeSelect.Option value="hz" disabled>
          杭州校区（满员）
        </NativeSelect.Option>
      )}
    </>
  );

  if (variant === 'with-groups') {
    return (
      <DemoSection label="Grouped options">
        <NativeSelect fullWidth style={{ width: 280 }}>
          <NativeSelect.Label>所属教研组</NativeSelect.Label>
          <NativeSelect.Trigger defaultValue="english">
            <NativeSelect.OptGroup label="教学">
              <NativeSelect.Option value="english">英语教研组</NativeSelect.Option>
              <NativeSelect.Option value="vocab">词汇教研组</NativeSelect.Option>
            </NativeSelect.OptGroup>
            <NativeSelect.OptGroup label="运营">
              <NativeSelect.Option value="support">学员服务组</NativeSelect.Option>
            </NativeSelect.OptGroup>
          </NativeSelect.Trigger>
        </NativeSelect>
      </DemoSection>
    );
  }

  if (variant === 'variants') {
    return (
      <DemoSection label="Primary + secondary variants">
        <NativeSelect style={{ width: 220 }}>
          <NativeSelect.Trigger defaultValue="bj">{selectOptions}</NativeSelect.Trigger>
        </NativeSelect>
        <NativeSelect variant="secondary" style={{ width: 220 }}>
          <NativeSelect.Trigger defaultValue="sh">{selectOptions}</NativeSelect.Trigger>
        </NativeSelect>
      </DemoSection>
    );
  }

  const selectControl = (
    <NativeSelect
      fullWidth={variant === 'full-width'}
      variant="primary"
      aria-invalid={variant === 'invalid-state' ? 'true' : undefined}
      data-invalid={variant === 'invalid-state' ? 'true' : undefined}
      style={{ width }}
    >
      {(variant === 'with-label' || variant === 'with-description' || variant === 'form-example') && (
        <NativeSelect.Label>所属校区</NativeSelect.Label>
      )}
      <NativeSelect.Trigger
        name="campus"
        value={variant === 'controlled' || variant === 'form-example' ? campus : undefined}
        defaultValue={variant === 'controlled' || variant === 'form-example' ? undefined : ''}
        disabled={variant === 'disabled-select'}
        onChange={variant === 'controlled' || variant === 'form-example' ? handleCampusChange : undefined}
      >
        <NativeSelect.Option value="">请选择校区</NativeSelect.Option>
        {selectOptions}
        {variant === 'custom-indicator' && <NativeSelect.Indicator>⌄</NativeSelect.Indicator>}
      </NativeSelect.Trigger>
      {variant === 'with-description' && (
        <NativeSelect.Description>用于匹配班级、老师和课程表。</NativeSelect.Description>
      )}
      {variant === 'invalid-state' && (
        <NativeSelect.Description>请选择一个可用校区。</NativeSelect.Description>
      )}
    </NativeSelect>
  );

  if (variant === 'form-example') {
    return (
      <DemoSection label="Form example" isColumn>
        <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: 12, width: 280 }}>
          {selectControl}
          <Button type="submit" size="sm">保存</Button>
        </form>
        <span className="text-muted text-sm">已保存：{savedCampus}</span>
      </DemoSection>
    );
  }

  return (
    <DemoSection
      label={
        variant === 'controlled'
          ? `Controlled select (${CAMPUS_NAMES[campus]})`
          : variant === 'custom-indicator'
            ? 'Custom indicator'
            : variant === 'disabled-select'
              ? 'Disabled select'
              : variant === 'full-width'
                ? 'Full width'
                : variant === 'invalid-state'
                  ? 'Invalid state'
                  : variant === 'with-description'
                    ? 'With description'
                    : variant === 'with-disabled-options'
                      ? 'Disabled options'
                      : variant === 'with-label'
                        ? 'With label'
                        : 'Default native select'
      }
      isColumn
    >
      {selectControl}
    </DemoSection>
  );
};

type NumberStepperVariantSlug =
  | 'controlled'
  | 'custom-icons'
  | 'custom-value'
  | 'default'
  | 'disabled'
  | 'guest-picker'
  | 'min-max-values'
  | 'reversed-layout'
  | 'sizes'
  | 'with-custom-buttons'
  | 'with-format-options'
  | 'with-label'
  | 'with-step';

const NumberStepperParts = ({
  reversed,
  customButtons,
  customIcons,
  customValue,
}: {
  reversed?: boolean;
  customButtons?: boolean;
  customIcons?: boolean;
  customValue?: boolean;
}) => {
  const minusIcon = customIcons ? (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 8h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ) : undefined;
  const plusIcon = customIcons ? (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 4v8M4 8h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ) : undefined;
  const decrement = (
    <NumberStepper.DecrementButton icon={minusIcon}>
      {customButtons ? '少' : undefined}
    </NumberStepper.DecrementButton>
  );
  const increment = (
    <NumberStepper.IncrementButton icon={plusIcon}>
      {customButtons ? '多' : undefined}
    </NumberStepper.IncrementButton>
  );
  const value = (
    <NumberStepper.Value>
      {customValue ? ({ value }) => `${value} 人` : undefined}
    </NumberStepper.Value>
  );

  return (
    <NumberStepper.Group>
      {reversed ? (
        <>
          {increment}
          {value}
          {decrement}
        </>
      ) : (
        <>
          {decrement}
          {value}
          {increment}
        </>
      )}
    </NumberStepper.Group>
  );
};

const NumberStepperVariantDemo = ({ variant }: { variant: NumberStepperVariantSlug }) => {
  const [count, setCount] = useState(4);
  const handleCountChange = (value: number) => setCount(value);

  if (variant === 'guest-picker') {
    return (
      <DemoSection label="Guest picker">
        {['成人', '儿童', '老师'].map((label, index) => (
          <div key={label} style={{ display: 'grid', gap: 6 }}>
            <NumberStepper label={label} defaultValue={index === 0 ? 2 : 0} minValue={0} maxValue={12}>
              <NumberStepperParts />
            </NumberStepper>
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'sizes') {
    return (
      <DemoSection label="Sizes">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <NumberStepper key={size} aria-label={`数量 ${size}`} size={size} defaultValue={4} minValue={0} maxValue={20}>
            <NumberStepperParts />
          </NumberStepper>
        ))}
      </DemoSection>
    );
  }

  return (
    <DemoSection
      label={
        variant === 'controlled'
          ? `Controlled (${count})`
          : variant === 'custom-icons'
            ? 'Custom icons'
            : variant === 'custom-value'
              ? 'Custom value'
              : variant === 'disabled'
                ? 'Disabled'
                : variant === 'min-max-values'
                  ? 'Min / max values'
                  : variant === 'reversed-layout'
                    ? 'Reversed layout'
                    : variant === 'with-custom-buttons'
                      ? 'Custom buttons'
                      : variant === 'with-format-options'
                        ? 'Format options'
                        : variant === 'with-label'
                          ? 'With label'
                          : variant === 'with-step'
                            ? 'Custom step'
                            : 'Default number stepper'
      }
      isColumn
    >
      <NumberStepper
        aria-label="数量"
        label={variant === 'with-label' ? '参课人数' : undefined}
        description={variant === 'with-label' ? '用于限制每节课可预约容量' : undefined}
        value={variant === 'controlled' ? count : undefined}
        onChange={variant === 'controlled' ? handleCountChange : undefined}
        defaultValue={variant === 'controlled' ? undefined : variant === 'with-format-options' ? 1280 : 4}
        minValue={variant === 'min-max-values' ? 2 : 0}
        maxValue={variant === 'min-max-values' ? 8 : 100}
        step={variant === 'with-step' ? 5 : 1}
        isDisabled={variant === 'disabled'}
        formatOptions={variant === 'with-format-options' ? { notation: 'compact' } : undefined}
      >
        <NumberStepperParts
          reversed={variant === 'reversed-layout'}
          customButtons={variant === 'with-custom-buttons'}
          customIcons={variant === 'custom-icons'}
          customValue={variant === 'custom-value'}
        />
      </NumberStepper>
    </DemoSection>
  );
};

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

/** 参考实现 custom-indicator 基准快照中的对勾圆图标 */
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

const RICH_TEXT_DEFAULT_VALUE: RichTextEditorJSONContent = {
  type: 'doc',
  html: '<h2>Launch brief</h2><p>Summarize the new onboarding flow, call out risk areas, and list the next owner actions.</p><blockquote>Keep the update short enough for the weekly product review.</blockquote>',
};

const RICH_TEXT_REVIEW_VALUE: RichTextEditorJSONContent = {
  type: 'doc',
  html: '<p><strong>Review note:</strong> The empty state is clear, but the CTA copy should better explain the next step.</p>',
};

const RichTextToolbar = () => (
  <RichTextEditor.Toolbar>
    <RichTextEditor.ToolbarGroup aria-label="Text formatting">
      <RichTextEditor.ToggleButton command="bold" aria-label="Bold" />
      <RichTextEditor.ToggleButton command="italic" aria-label="Italic" />
      <RichTextEditor.ToggleButton command="underline" aria-label="Underline" />
      <RichTextEditor.ToggleButton command="strike" aria-label="Strike" />
    </RichTextEditor.ToolbarGroup>
    <RichTextEditor.ToolbarGroup aria-label="Blocks">
      <RichTextEditor.ToggleButton command="heading1" aria-label="Heading 1" />
      <RichTextEditor.ToggleButton command="heading2" aria-label="Heading 2" />
      <RichTextEditor.ToggleButton command="bulletList" aria-label="Bullet list" />
      <RichTextEditor.ToggleButton command="orderedList" aria-label="Ordered list" />
      <RichTextEditor.ToggleButton command="blockquote" aria-label="Quote" />
    </RichTextEditor.ToolbarGroup>
    <RichTextEditor.ToolbarGroup aria-label="Link">
      <RichTextEditor.LinkPopover />
      <RichTextEditor.ActionButton command="undo" aria-label="Undo" />
      <RichTextEditor.ActionButton command="redo" aria-label="Redo" />
    </RichTextEditor.ToolbarGroup>
  </RichTextEditor.Toolbar>
);

type RichTextEditorVariantKey =
  | 'default'
  | 'controlled'
  | 'character-count'
  | 'placeholder'
  | 'disabled-and-read-only'
  | 'custom-composition'
  | 'extensible-commands';

const RichTextEditorVariantDemo = ({ variant }: { variant: RichTextEditorVariantKey }) => {
  const [value, setValue] = useState<RichTextEditorJSONContent>(RICH_TEXT_DEFAULT_VALUE);
  const [status, setStatus] = useState('等待编辑');

  if (variant === 'disabled-and-read-only') {
    return (
      <DemoSection label="rich-text-editor-disabled-and-read-only" isColumn>
        <RichTextEditor defaultValue={RICH_TEXT_DEFAULT_VALUE} isDisabled style={{ width: 640 }}>
          <RichTextEditor.Shell>
            <RichTextToolbar />
            <RichTextEditor.Content />
            <RichTextEditor.Footer>Disabled editor</RichTextEditor.Footer>
          </RichTextEditor.Shell>
        </RichTextEditor>
        <RichTextEditor defaultValue={RICH_TEXT_REVIEW_VALUE} isReadOnly style={{ width: 640 }}>
          <RichTextEditor.Shell>
            <RichTextToolbar />
            <RichTextEditor.Content />
            <RichTextEditor.Footer>Read-only editor keeps selection readable but blocks commands.</RichTextEditor.Footer>
          </RichTextEditor.Shell>
        </RichTextEditor>
      </DemoSection>
    );
  }

  if (variant === 'custom-composition') {
    return (
      <DemoSection label="rich-text-editor-custom-composition" isColumn>
        <RichTextEditor
          defaultValue={RICH_TEXT_REVIEW_VALUE}
          onValueChange={(_, details) => setStatus(`正文 ${details.characterCount} 字符`)}
          style={{ width: 680 }}
        >
          <RichTextEditor.BubbleMenu>
            <RichTextEditor.ToggleButton command="bold" aria-label="Bubble bold" />
            <RichTextEditor.ToggleButton command="italic" aria-label="Bubble italic" />
            <RichTextEditor.LinkPopover />
          </RichTextEditor.BubbleMenu>
          <RichTextEditor.Shell>
            <RichTextEditor.Toolbar>
              <RichTextEditor.ToolbarGroup>
                <RichTextEditor.ToggleButton command="heading2" aria-label="Heading" />
                <RichTextEditor.ToggleButton command="blockquote" aria-label="Quote" />
                <RichTextEditor.ToggleButton command="bulletList" aria-label="Bullets" />
              </RichTextEditor.ToolbarGroup>
            </RichTextEditor.Toolbar>
            <RichTextEditor.Content placeholder="记录这次设计 review 的结论…" />
            <RichTextEditor.Footer>
              <span>{status}</span>
              <RichTextEditor.CharacterCount />
            </RichTextEditor.Footer>
          </RichTextEditor.Shell>
        </RichTextEditor>
      </DemoSection>
    );
  }

  if (variant === 'extensible-commands') {
    return (
      <DemoSection label="rich-text-editor-extensible-commands" isColumn>
        <RichTextEditor
          defaultValue={RICH_TEXT_DEFAULT_VALUE}
          onValueChange={(_, details) => setStatus(`已同步 ${details.characterCount} 字符`)}
          style={{ width: 680 }}
        >
          <RichTextEditor.Shell>
            <RichTextToolbar />
            <RichTextEditor.Content />
            <RichTextEditor.Footer>
              <RichTextEditor.FloatingMenu>
                <RichTextEditor.CommandButton
                  command={(editor) => {
                    editor.runCommand('heading2');
                    setStatus('已运行自定义命令：标题');
                  }}
                >
                  标题
                </RichTextEditor.CommandButton>
                <RichTextEditor.CommandButton
                  command={(editor) => {
                    editor.setLink('https://vela-ui.local/docs/rich-text-editor');
                    setStatus('已插入参考链接');
                  }}
                >
                  参考链接
                </RichTextEditor.CommandButton>
              </RichTextEditor.FloatingMenu>
              <span>{status}</span>
            </RichTextEditor.Footer>
          </RichTextEditor.Shell>
        </RichTextEditor>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={`rich-text-editor-${variant}`} isColumn>
      <RichTextEditor
        value={variant === 'controlled' ? value : undefined}
        defaultValue={variant === 'controlled' ? undefined : variant === 'placeholder' ? { type: 'doc', html: '' } : RICH_TEXT_DEFAULT_VALUE}
        placeholder={variant === 'placeholder' ? 'Write a product update…' : undefined}
        maxLength={variant === 'character-count' ? 180 : undefined}
        onValueChange={(nextValue, details) => {
          if (variant === 'controlled') setValue(nextValue);
          setStatus(`更新：${details.characterCount} 字符`);
        }}
        style={{ width: 680 }}
      >
        <RichTextEditor.Shell>
          <RichTextToolbar />
          <RichTextEditor.Content />
          {variant === 'character-count' ? (
            <RichTextEditor.Footer>
              <span>{status}</span>
              <RichTextEditor.CharacterCount />
            </RichTextEditor.Footer>
          ) : (
            <RichTextEditor.Footer>
              <span>{variant === 'controlled' ? 'Controlled JSON value updates on every edit.' : status}</span>
              {variant === 'placeholder' && (
                <RichTextEditor.SuggestionMenu>
                  <RichTextEditor.CommandButton command={(editor) => editor.runCommand('heading2')}>
                    Add heading
                  </RichTextEditor.CommandButton>
                  <RichTextEditor.CommandButton command={(editor) => editor.runCommand('bulletList')}>
                    Add list
                  </RichTextEditor.CommandButton>
                </RichTextEditor.SuggestionMenu>
              )}
            </RichTextEditor.Footer>
          )}
        </RichTextEditor.Shell>
      </RichTextEditor>
    </DemoSection>
  );
};

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
  'cell-slider': <CellSliderDemo />,
  'cell-color-picker': <CellColorPickerDemo />,
  'rich-text-editor': <RichTextEditorVariantDemo variant="default" />,
};

export const formsVariantDemos: Record<string, ReactNode> = {
  'cell-color-picker-controlled': <CellColorPickerVariantDemo variant="controlled" />,
  'cell-color-picker-default': <CellColorPickerVariantDemo variant="default" />,
  'cell-color-picker-disabled': <CellColorPickerVariantDemo variant="disabled" />,
  'cell-color-picker-settings-group': <CellColorPickerVariantDemo variant="settings-group" />,
  'cell-color-picker-variants': <CellColorPickerVariantDemo variant="variants" />,
  'cell-color-picker-with-presets': <CellColorPickerVariantDemo variant="with-presets" />,
  'cell-select-controlled': <CellSelectVariantDemo variant="controlled" />,
  'cell-select-custom-value': <CellSelectVariantDemo variant="custom-value" />,
  'cell-select-default': <CellSelectVariantDemo variant="default" />,
  'cell-select-disabled': <CellSelectVariantDemo variant="disabled" />,
  'cell-select-font-family': <CellSelectVariantDemo variant="font-family" />,
  'cell-select-settings-group': <CellSelectVariantDemo variant="settings-group" />,
  'cell-select-variants': <CellSelectVariantDemo variant="variants" />,
  'cell-slider-controlled': <CellSliderVariantDemo variant="controlled" />,
  'cell-slider-default': <CellSliderVariantDemo variant="default" />,
  'cell-slider-disabled': <CellSliderVariantDemo variant="disabled" />,
  'cell-slider-integer-step': <CellSliderVariantDemo variant="integer-step" />,
  'cell-slider-secondary-group': <CellSliderVariantDemo variant="secondary-group" />,
  'cell-slider-settings-group': <CellSliderVariantDemo variant="settings-group" />,
  'cell-slider-variants': <CellSliderVariantDemo variant="variants" />,
  'cell-switch-controlled': <CellSwitchVariantDemo variant="controlled" />,
  'cell-switch-default': <CellSwitchVariantDemo variant="default" />,
  'cell-switch-disabled': <CellSwitchVariantDemo variant="disabled" />,
  'cell-switch-feature-announcement': <CellSwitchVariantDemo variant="feature-announcement" />,
  'cell-switch-secondary-group': <CellSwitchVariantDemo variant="secondary-group" />,
  'cell-switch-settings-group': <CellSwitchVariantDemo variant="settings-group" />,
  'cell-switch-variants': <CellSwitchVariantDemo variant="variants" />,
  'checkbox-button-group-controlled': <CheckboxButtonGroupVariantDemo variant="controlled" />,
  'checkbox-button-group-custom-indicator': <CheckboxButtonGroupVariantDemo variant="custom-indicator" />,
  'checkbox-button-group-default': <CheckboxButtonGroupVariantDemo variant="default" />,
  'checkbox-button-group-disabled-group': <CheckboxButtonGroupVariantDemo variant="disabled-group" />,
  'checkbox-button-group-grid-layout': <CheckboxButtonGroupVariantDemo variant="grid-layout" />,
  'checkbox-button-group-icon-cards': <CheckboxButtonGroupVariantDemo variant="icon-cards" />,
  'checkbox-button-group-no-indicator': <CheckboxButtonGroupVariantDemo variant="no-indicator" />,
  'checkbox-button-group-render-prop-children': <CheckboxButtonGroupVariantDemo variant="render-prop-children" />,
  'checkbox-button-group-subscription-plans': <CheckboxButtonGroupVariantDemo variant="subscription-plans" />,
  'checkbox-button-group-with-icons': <CheckboxButtonGroupVariantDemo variant="with-icons" />,
  'checkbox-button-group-with-ripple': <CheckboxButtonGroupVariantDemo variant="with-ripple" />,
  'drop-zone-compact-file-list': <DropZoneCompactFileListVariantDemo />,
  'drop-zone-custom-icon': <DropZoneCustomIconVariantDemo />,
  'drop-zone-custom-triggers': <DropZoneCustomTriggersVariantDemo />,
  'drop-zone-default': <DropZoneDefaultVariantDemo />,
  'drop-zone-disabled': <DropZoneDisabledVariantDemo />,
  'drop-zone-image-only': <DropZoneImageOnlyVariantDemo />,
  'drop-zone-max-size-limit': <DropZoneMaxSizeLimitVariantDemo />,
  'drop-zone-multiple-files': <DropZoneMultipleFilesVariantDemo />,
  'drop-zone-with-file-list': <DropZoneUploadProgressVariantDemo />,
  'inline-select-custom-indicator': <InlineSelectVariantDemo variant="custom-indicator" />,
  'inline-select-default': <InlineSelectVariantDemo variant="default" />,
  'inline-select-multi-select': <InlineSelectVariantDemo variant="multi-select" />,
  'inline-select-placements': <InlineSelectVariantDemo variant="placements" />,
  'inline-select-team-switcher': <InlineSelectVariantDemo variant="team-switcher" />,
  'native-select-controlled': <NativeSelectVariantDemo variant="controlled" />,
  'native-select-custom-indicator': <NativeSelectVariantDemo variant="custom-indicator" />,
  'native-select-default': <NativeSelectVariantDemo variant="default" />,
  'native-select-disabled-select': <NativeSelectVariantDemo variant="disabled-select" />,
  'native-select-form-example': <NativeSelectVariantDemo variant="form-example" />,
  'native-select-full-width': <NativeSelectVariantDemo variant="full-width" />,
  'native-select-invalid-state': <NativeSelectVariantDemo variant="invalid-state" />,
  'native-select-variants': <NativeSelectVariantDemo variant="variants" />,
  'native-select-with-description': <NativeSelectVariantDemo variant="with-description" />,
  'native-select-with-disabled-options': <NativeSelectVariantDemo variant="with-disabled-options" />,
  'native-select-with-groups': <NativeSelectVariantDemo variant="with-groups" />,
  'native-select-with-label': <NativeSelectVariantDemo variant="with-label" />,
  'number-stepper-controlled': <NumberStepperVariantDemo variant="controlled" />,
  'number-stepper-custom-icons': <NumberStepperVariantDemo variant="custom-icons" />,
  'number-stepper-custom-value': <NumberStepperVariantDemo variant="custom-value" />,
  'number-stepper-default': <NumberStepperVariantDemo variant="default" />,
  'number-stepper-disabled': <NumberStepperVariantDemo variant="disabled" />,
  'number-stepper-guest-picker': <NumberStepperVariantDemo variant="guest-picker" />,
  'number-stepper-min-max-values': <NumberStepperVariantDemo variant="min-max-values" />,
  'number-stepper-reversed-layout': <NumberStepperVariantDemo variant="reversed-layout" />,
  'number-stepper-sizes': <NumberStepperVariantDemo variant="sizes" />,
  'number-stepper-with-custom-buttons': <NumberStepperVariantDemo variant="with-custom-buttons" />,
  'number-stepper-with-format-options': <NumberStepperVariantDemo variant="with-format-options" />,
  'number-stepper-with-label': <NumberStepperVariantDemo variant="with-label" />,
  'number-stepper-with-step': <NumberStepperVariantDemo variant="with-step" />,
  'radio-button-group-controlled': <RadioButtonGroupVariantDemo variant="controlled" />,
  'radio-button-group-custom-indicator': <RadioButtonGroupVariantDemo variant="custom-indicator" />,
  'radio-button-group-default': <RadioButtonGroupVariantDemo variant="default" />,
  'radio-button-group-delivery-and-payment': <RadioButtonGroupVariantDemo variant="delivery-and-payment" />,
  'radio-button-group-disabled-group': <RadioButtonGroupVariantDemo variant="disabled-group" />,
  'radio-button-group-grid-layout': <RadioButtonGroupVariantDemo variant="grid-layout" />,
  'radio-button-group-icon-cards': <RadioButtonGroupVariantDemo variant="icon-cards" />,
  'radio-button-group-no-indicator': <RadioButtonGroupVariantDemo variant="no-indicator" />,
  'radio-button-group-render-prop-children': <RadioButtonGroupVariantDemo variant="render-prop-children" />,
  'radio-button-group-subscription-plans': <RadioButtonGroupVariantDemo variant="subscription-plans" />,
  'radio-button-group-with-icons': <RadioButtonGroupVariantDemo variant="with-icons" />,
  'radio-button-group-with-ripple': <RadioButtonGroupVariantDemo variant="with-ripple" />,
  'rich-text-editor-character-count': <RichTextEditorVariantDemo variant="character-count" />,
  'rich-text-editor-controlled': <RichTextEditorVariantDemo variant="controlled" />,
  'rich-text-editor-custom-composition': <RichTextEditorVariantDemo variant="custom-composition" />,
  'rich-text-editor-default': <RichTextEditorVariantDemo variant="default" />,
  'rich-text-editor-disabled-and-read-only': <RichTextEditorVariantDemo variant="disabled-and-read-only" />,
  'rich-text-editor-extensible-commands': <RichTextEditorVariantDemo variant="extensible-commands" />,
  'rich-text-editor-placeholder': <RichTextEditorVariantDemo variant="placeholder" />,
};
