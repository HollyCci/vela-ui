import { useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import { isFileDropItem, parseColor, type Color, type Key } from 'react-aria-components';
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
import DropZone, {
  type DropZoneAreaProps,
  type DropZoneFileFormatIconColor,
} from '../../components/drop-zone';
import CellSwitch from '../../components/cell-switch';
import CellSelect from '../../components/cell-select';
import CellSlider from '../../components/cell-slider';
import CellColorPicker from '../../components/cell-color-picker';
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
    <Slider label="音量" defaultValue={40} style={{ width: 320 }} />
    <Slider label="进度" defaultValue={75} minValue={0} maxValue={100} style={{ width: 320 }} />
    <Slider label="禁用" defaultValue={20} isDisabled style={{ width: 320 }} />
  </DemoSection>
);

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
          <NativeSelect.Trigger aria-invalid="true" defaultValue="">
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
    <SearchField variant="secondary" placeholder="次级样式" defaultValue="拓词" style={{ width: 320 }} />
  </DemoSection>
);

const NumberFieldDemo = () => (
  <DemoSection isColumn>
    <NumberField label="每日单词量" defaultValue={50} minValue={0} maxValue={500} step={10} style={{ width: 280 }} />
    <NumberField variant="secondary" aria-label="次级数字输入" defaultValue={3} minValue={1} maxValue={10} style={{ width: 280 }} />
  </DemoSection>
);

const REMOVABLE_TAGS = ['React', 'TypeScript'];

const TagDemo = () => {
  const [tags, setTags] = useState(REMOVABLE_TAGS);
  const handleRemove = (tag: string) =>
    setTags((prev) => prev.filter((item) => item !== tag));

  return (
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

const SORT_OPTIONS = [
  { id: 'created', label: '按创建时间排序' },
  { id: 'updated', label: '按更新时间排序' },
  { id: 'name', label: '按名称排序' },
];

const InlineSelectDemo = () => {
  const [sortKey, setSortKey] = useState<Key | null>('created');
  const handleSortChange = (value: Key | null) => setSortKey(value);
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

/** 从文件名提取大写扩展名作为格式徽标 */
const getFileFormat = (name: string) => {
  const ext = name.includes('.') ? name.split('.').pop() : undefined;
  return ext !== undefined && ext !== '' ? ext.toUpperCase() : 'FILE';
};

const UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
const UPLOAD_ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);
const IMAGE_ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif']);

type DemoUploadFileLike = {
  name: string;
  size?: number;
  type?: string;
};

type DemoUploadFile = {
  id: string;
  name: string;
  format: string;
  color: DropZoneFileFormatIconColor;
  size: string;
  status: 'complete' | 'failed';
  reason?: string;
};

const formatFileSize = (size?: number) => {
  if (typeof size !== 'number') return '大小未知';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1).replace(/\.0$/, '')} MB`;
};

const getFileExtension = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

const getUploadFailureReason = (file: DemoUploadFileLike) => {
  const extension = getFileExtension(file.name);
  if (!UPLOAD_ALLOWED_EXTENSIONS.has(extension)) return '仅支持 PDF、DOC、DOCX';
  if (typeof file.size === 'number' && file.size > UPLOAD_MAX_BYTES) return '超过 20MB 限制';
  return undefined;
};

const getUploadIconColor = (
  format: string,
  status: DemoUploadFile['status'],
): DropZoneFileFormatIconColor => {
  if (status === 'failed') return 'red';
  if (format === 'PDF') return 'orange';
  if (format === 'DOC' || format === 'DOCX') return 'blue';
  return 'gray';
};

const createUploadFile = (
  file: DemoUploadFileLike,
  id: string,
  forcedFailureReason?: string,
): DemoUploadFile => {
  const reason = forcedFailureReason ?? getUploadFailureReason(file);
  const status = reason === undefined ? 'complete' : 'failed';
  const format = getFileFormat(file.name);

  return {
    id,
    name: file.name,
    format,
    color: getUploadIconColor(format, status),
    size: formatFileSize(file.size),
    status,
    reason,
  };
};

const createImageUploadFile = (file: DemoUploadFileLike, id: string): DemoUploadFile => {
  const extension = getFileExtension(file.name);
  const isImage =
    IMAGE_ALLOWED_EXTENSIONS.has(extension) ||
    (typeof file.type === 'string' && file.type.startsWith('image/'));
  const reason = isImage ? undefined : '仅支持 PNG、JPG、WEBP、GIF';
  const status = reason === undefined ? 'complete' : 'failed';

  return {
    id,
    name: file.name,
    format: getFileFormat(file.name),
    color: status === 'failed' ? 'red' : 'purple',
    size: formatFileSize(file.size),
    status,
    reason,
  };
};

type DemoFileEntryProps = {
  file: DemoUploadFile;
  onRemove: (id: string) => void;
};

/** 回显条目：单独成组件以便事件处理具名（JSX 内禁匿名函数） */
const DemoFileEntry = ({ file, onRemove }: DemoFileEntryProps) => {
  const handleRemove = () => onRemove(file.id);
  const meta =
    file.status === 'failed' ? `${file.size} | ${file.reason ?? '校验失败'}` : `${file.size} | 已添加`;

  return (
    <DropZone.FileItem status={file.status}>
      <DropZone.FileFormatIcon format={file.format} color={file.color} />
      <DropZone.FileInfo>
        <DropZone.FileName>{file.name}</DropZone.FileName>
        <DropZone.FileMeta>{meta}</DropZone.FileMeta>
      </DropZone.FileInfo>
      <DropZone.FileRemoveTrigger aria-label={`移除 ${file.name}`} onPress={handleRemove} />
    </DropZone.FileItem>
  );
};

type DemoStatusFile = {
  id: string;
  name: string;
  format: string;
  color: 'green' | 'orange';
  size: string;
  status: 'uploading' | 'failed';
  progress?: number;
};

const INITIAL_STATUS_FILES: DemoStatusFile[] = [
  {
    id: 'spring-students',
    name: '学员名单-2026春季班.xlsx',
    format: 'XLSX',
    color: 'green',
    size: '1.2 MB',
    status: 'uploading',
    progress: 45,
  },
  {
    id: 'course-backup',
    name: '课件备份.zip',
    format: 'ZIP',
    color: 'orange',
    size: '18 MB',
    status: 'failed',
  },
];

const INITIAL_COMPACT_FILES: DemoUploadFile[] = [
  createUploadFile({ name: '课程合同.pdf', size: 640 * 1024 }, 'compact-contract'),
  createUploadFile({ name: '课堂记录.docx', size: 1.4 * 1024 * 1024 }, 'compact-notes'),
];

const INITIAL_MAX_SIZE_FILES: DemoUploadFile[] = [
  createUploadFile({ name: '课程说明.pdf', size: 820 * 1024 }, 'max-size-valid'),
  createUploadFile({ name: '完整资料包.docx', size: 24.6 * 1024 * 1024 }, 'max-size-invalid'),
];

type DemoStatusFileEntryProps = {
  file: DemoStatusFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
};

const DemoStatusFileEntry = ({ file, onRemove, onRetry }: DemoStatusFileEntryProps) => {
  const handleRemove = () => onRemove(file.id);
  const handleRetry = () => onRetry(file.id);
  const meta =
    file.status === 'failed'
      ? `${file.size} | 上传失败`
      : `${file.size} | ${file.progress === 35 ? '重新上传中…' : '上传中…'}`;

  return (
    <DropZone.FileItem status={file.status}>
      <DropZone.FileFormatIcon format={file.format} color={file.color} />
      <DropZone.FileInfo>
        <DropZone.FileName>{file.name}</DropZone.FileName>
        <DropZone.FileMeta>{meta}</DropZone.FileMeta>
        {file.status === 'uploading' && (
          <DropZone.FileProgress value={file.progress ?? 45} aria-label={`${file.name} 上传进度`}>
            <DropZone.FileProgressTrack>
              <DropZone.FileProgressFill />
            </DropZone.FileProgressTrack>
          </DropZone.FileProgress>
        )}
        {file.status === 'failed' && (
          <DropZone.FileRetryTrigger onPress={handleRetry}>重试</DropZone.FileRetryTrigger>
        )}
      </DropZone.FileInfo>
      <DropZone.FileRemoveTrigger aria-label={`移除 ${file.name}`} onPress={handleRemove} />
    </DropZone.FileItem>
  );
};

const useDropZoneUploadFiles = () => {
  const [uploadFiles, setUploadFiles] = useState<DemoUploadFile[]>([]);

  const handleDrop: NonNullable<DropZoneAreaProps['onDrop']> = (event) => {
    const batchId = Date.now().toString(36);
    const uploadItems = event.items.filter(isFileDropItem);

    void Promise.all(
      uploadItems.map(async (item, index) => {
        const id = `${batchId}-drop-${index}`;
        try {
          const file = await item.getFile();
          return createUploadFile(file, id);
        } catch {
          return createUploadFile(
            { name: item.name, type: item.type },
            id,
            '无法读取拖放文件',
          );
        }
      }),
    ).then((files) => {
      if (files.length > 0) setUploadFiles(files);
    });
  };
  // 文件选择器：DropZone.Input 的 onSelect（原站 API 签名 FileList）
  const handleSelect = (files: FileList) => {
    const batchId = Date.now().toString(36);
    setUploadFiles(
      Array.from(files).map((file, index) => createUploadFile(file, `${batchId}-select-${index}`)),
    );
  };
  const handleRemoveFile = (id: string) =>
    setUploadFiles((prev) => prev.filter((file) => file.id !== id));

  return { handleDrop, handleSelect, handleRemoveFile, uploadFiles };
};

const DropZoneDefaultVariantDemo = () => {
  const { handleDrop, handleSelect, handleRemoveFile, uploadFiles } = useDropZoneUploadFiles();

  return (
    <DemoSection label="拖放高亮 + 文件选择回显" isColumn>
      <DropZone style={{ width: 420 }}>
        <DropZone.Area onDrop={handleDrop}>
          <DropZone.Icon />
          <DropZone.Label>拖拽文件到此处上传</DropZone.Label>
          <DropZone.Description>支持 PDF、Word，单个不超过 20MB</DropZone.Description>
          <DropZone.Trigger>选择文件</DropZone.Trigger>
        </DropZone.Area>
        <DropZone.Input accept=".pdf,.doc,.docx" multiple onSelect={handleSelect} />
        {uploadFiles.length > 0 && (
          <DropZone.FileList>
            {uploadFiles.map((file) => (
              <DemoFileEntry key={file.id} file={file} onRemove={handleRemoveFile} />
            ))}
          </DropZone.FileList>
        )}
      </DropZone>
    </DemoSection>
  );
};

const DropZoneMultipleFilesVariantDemo = () => {
  const { handleDrop, handleSelect, handleRemoveFile, uploadFiles } = useDropZoneUploadFiles();

  return (
    <DemoSection label="多文件上传" isColumn>
      <DropZone style={{ width: 420 }}>
        <DropZone.Area onDrop={handleDrop}>
          <DropZone.Icon />
          <DropZone.Label>一次拖入多个课件文件</DropZone.Label>
          <DropZone.Description>支持批量选择，列表会按本次选择结果刷新</DropZone.Description>
          <DropZone.Trigger>批量选择</DropZone.Trigger>
        </DropZone.Area>
        <DropZone.Input accept=".pdf,.doc,.docx" multiple onSelect={handleSelect} />
        {uploadFiles.length > 0 && (
          <DropZone.FileList>
            {uploadFiles.map((file) => (
              <DemoFileEntry key={file.id} file={file} onRemove={handleRemoveFile} />
            ))}
          </DropZone.FileList>
        )}
      </DropZone>
    </DemoSection>
  );
};

const DropZoneCustomIconVariantDemo = () => {
  const { handleSelect, handleRemoveFile, uploadFiles } = useDropZoneUploadFiles();

  return (
    <DemoSection label="自定义图标" isColumn>
      <DropZone style={{ width: 420 }}>
        <DropZone.Area>
          <DropZone.Icon>
            <BookIcon />
          </DropZone.Icon>
          <DropZone.Label>上传课程资料</DropZone.Label>
          <DropZone.Description>图标 slot 可替换为业务图标</DropZone.Description>
          <DropZone.Trigger>选择资料</DropZone.Trigger>
        </DropZone.Area>
        <DropZone.Input accept=".pdf,.doc,.docx" multiple onSelect={handleSelect} />
        {uploadFiles.length > 0 && (
          <DropZone.FileList>
            {uploadFiles.map((file) => (
              <DemoFileEntry key={file.id} file={file} onRemove={handleRemoveFile} />
            ))}
          </DropZone.FileList>
        )}
      </DropZone>
    </DemoSection>
  );
};

const DropZoneCustomTriggersVariantDemo = () => {
  const { handleSelect, handleRemoveFile, uploadFiles } = useDropZoneUploadFiles();

  return (
    <DemoSection label="自定义触发器" isColumn>
      <DropZone style={{ width: 420 }}>
        <DropZone.Area>
          <DropZone.Icon />
          <DropZone.Label>从多个入口选择文件</DropZone.Label>
          <DropZone.Description>多个 Trigger 会共享根组件提供的隐藏 input</DropZone.Description>
          <div style={{ display: 'flex', gap: 8 }}>
            <DropZone.Trigger>上传合同</DropZone.Trigger>
            <DropZone.Trigger>上传附件</DropZone.Trigger>
          </div>
        </DropZone.Area>
        <DropZone.Input accept=".pdf,.doc,.docx" multiple onSelect={handleSelect} />
        {uploadFiles.length > 0 && (
          <DropZone.FileList>
            {uploadFiles.map((file) => (
              <DemoFileEntry key={file.id} file={file} onRemove={handleRemoveFile} />
            ))}
          </DropZone.FileList>
        )}
      </DropZone>
    </DemoSection>
  );
};

const DropZoneImageOnlyVariantDemo = () => {
  const [imageFiles, setImageFiles] = useState<DemoUploadFile[]>([]);
  const handleSelect = (files: FileList) => {
    const batchId = Date.now().toString(36);
    setImageFiles(
      Array.from(files).map((file, index) =>
        createImageUploadFile(file, `${batchId}-image-${index}`),
      ),
    );
  };
  const handleRemoveFile = (id: string) =>
    setImageFiles((prev) => prev.filter((file) => file.id !== id));

  return (
    <DemoSection label="仅图片" isColumn>
      <DropZone style={{ width: 420 }}>
        <DropZone.Area>
          <DropZone.Icon />
          <DropZone.Label>上传封面图</DropZone.Label>
          <DropZone.Description>仅接收 PNG、JPG、WEBP、GIF</DropZone.Description>
          <DropZone.Trigger>选择图片</DropZone.Trigger>
        </DropZone.Area>
        <DropZone.Input accept="image/png,image/jpeg,image/webp,image/gif" multiple onSelect={handleSelect} />
        {imageFiles.length > 0 && (
          <DropZone.FileList>
            {imageFiles.map((file) => (
              <DemoFileEntry key={file.id} file={file} onRemove={handleRemoveFile} />
            ))}
          </DropZone.FileList>
        )}
      </DropZone>
    </DemoSection>
  );
};

const DropZoneMaxSizeLimitVariantDemo = () => {
  const [files, setFiles] = useState<DemoUploadFile[]>(INITIAL_MAX_SIZE_FILES);
  const handleRemoveFile = (id: string) => setFiles((prev) => prev.filter((file) => file.id !== id));

  return (
    <DemoSection label="大小限制反馈" isColumn>
      <DropZone style={{ width: 420 }}>
        <DropZone.Area>
          <DropZone.Icon />
          <DropZone.Label>上传小于 20MB 的文档</DropZone.Label>
          <DropZone.Description>超过限制的文件会进入失败状态</DropZone.Description>
          <DropZone.Trigger>选择文件</DropZone.Trigger>
        </DropZone.Area>
        <DropZone.Input accept=".pdf,.doc,.docx" multiple onSelect={() => undefined} />
        <DropZone.FileList>
          {files.map((file) => (
            <DemoFileEntry key={file.id} file={file} onRemove={handleRemoveFile} />
          ))}
        </DropZone.FileList>
      </DropZone>
    </DemoSection>
  );
};

const DropZoneCompactFileListVariantDemo = () => {
  const [files, setFiles] = useState<DemoUploadFile[]>(INITIAL_COMPACT_FILES);
  const handleRemoveFile = (id: string) => setFiles((prev) => prev.filter((file) => file.id !== id));

  return (
    <DemoSection label="紧凑文件列表" isColumn>
      <DropZone style={{ width: 360 }}>
        <DropZone.FileList>
          {files.map((file) => (
            <DemoFileEntry key={file.id} file={file} onRemove={handleRemoveFile} />
          ))}
        </DropZone.FileList>
      </DropZone>
    </DemoSection>
  );
};

const DropZoneUploadProgressVariantDemo = () => {
  const [statusFiles, setStatusFiles] = useState<DemoStatusFile[]>(INITIAL_STATUS_FILES);
  const handleRemoveStatusFile = (id: string) =>
    setStatusFiles((prev) => prev.filter((file) => file.id !== id));
  const handleRetryStatusFile = (id: string) =>
    setStatusFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, status: 'uploading', progress: 35 } : file,
      ),
    );

  return (
    <DemoSection label="上传进度与失败重试">
      <DropZone style={{ width: 420 }}>
        <DropZone.FileList>
          {statusFiles.map((file) => (
            <DemoStatusFileEntry
              key={file.id}
              file={file}
              onRemove={handleRemoveStatusFile}
              onRetry={handleRetryStatusFile}
            />
          ))}
        </DropZone.FileList>
      </DropZone>
    </DemoSection>
  );
};

const DropZoneDisabledVariantDemo = () => (
  <DemoSection label="整体禁用" isColumn>
    <DropZone isDisabled style={{ width: 420 }}>
      <DropZone.Area>
        <DropZone.Icon />
        <DropZone.Label>上传入口已锁定</DropZone.Label>
        <DropZone.Description>禁用状态会同时阻止拖放与文件选择</DropZone.Description>
        <DropZone.Trigger>选择文件</DropZone.Trigger>
      </DropZone.Area>
      <DropZone.Input accept=".pdf,.doc,.docx" multiple onSelect={() => undefined} />
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
  const [slot, setSlot] = useState<Key | null>('evening');
  const handleSlotChange = (value: Key | null) => setSlot(value);
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
  const [accent, setAccent] = useState(() => parseColor('#3B82F6'));
  const handleAccentChange = (color: Color) => setAccent(color);

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
  'cell-slider': <CellSliderDemo />,
  'cell-color-picker': <CellColorPickerDemo />,
};

export const formsVariantDemos: Record<string, ReactNode> = {
  'drop-zone-compact-file-list': <DropZoneCompactFileListVariantDemo />,
  'drop-zone-custom-icon': <DropZoneCustomIconVariantDemo />,
  'drop-zone-custom-triggers': <DropZoneCustomTriggersVariantDemo />,
  'drop-zone-default': <DropZoneDefaultVariantDemo />,
  'drop-zone-disabled': <DropZoneDisabledVariantDemo />,
  'drop-zone-image-only': <DropZoneImageOnlyVariantDemo />,
  'drop-zone-max-size-limit': <DropZoneMaxSizeLimitVariantDemo />,
  'drop-zone-multiple-files': <DropZoneMultipleFilesVariantDemo />,
  'drop-zone-with-file-list': <DropZoneUploadProgressVariantDemo />,
};
