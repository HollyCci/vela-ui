import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Checkbox } from '@heroui/react';
import {
  Button,
  Tree,
  TreeHeader,
  TreeItem,
  TreeItemContent,
  TreeSection,
  useDragAndDrop,
  type DragAndDropOptions,
  type DropPosition,
  type GridListSectionProps,
  type Key,
  type TreeData,
  type TreeItemContentRenderProps,
  type TreeItemProps as RACTreeItemProps,
  type TreeItemRenderProps,
  type TreeProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type FileTreeSize = 'sm' | 'md' | 'lg';
export type FileTreeShowGuideLines = boolean | 'hover';

export type FileTreeProps<T extends object = object> = Omit<
  TreeProps<T>,
  'className' | 'style'
> & {
  /** 尺寸变体，控制行高/字号/缩进宽度（原站 API） */
  size?: FileTreeSize;
  /** 禁用展开收起动画（原站 API；CSS 通过 [data-reduce-motion=true] 关闭 indicator 过渡） */
  reduceMotion?: boolean;
  /** 缩进参考线：true 常显 / false 隐藏 / 'hover' 悬停树时显示（原站 API） */
  showGuideLines?: FileTreeShowGuideLines;
  className?: string;
  style?: CSSProperties;
};

/** Item 的 icon 渲染函数入参（原站 API） */
export type FileTreeItemRenderProps = {
  isExpanded: boolean;
  hasChildItems: boolean;
  allowsDragging: boolean;
};

export type FileTreeItemProps = Omit<
  RACTreeItemProps,
  'className' | 'style' | 'textValue' | 'children'
> & {
  /** 嵌套子行（叶子行可省略） */
  children?: ReactNode;
  /** 行文本内容（原站 API，必填） */
  title: ReactNode;
  /** 标签前图标，可为渲染函数（原站 API） */
  icon?: ReactNode | ((props: FileTreeItemRenderProps) => ReactNode);
  /** 拖拽手柄图标，false 隐藏（原站 API，默认 GripVertical） */
  dragIcon?: ReactNode | false;
  /** typeahead 文本；缺省时从字符串 title 推导 */
  textValue?: string;
  className?: string;
  style?: CSSProperties;
};

export type FileTreeIndicatorProps = {
  children?: ReactNode;
  className?: string;
};

export type FileTreeSectionProps<T extends object = object> = Omit<
  GridListSectionProps<T>,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type FileTreeHeaderProps = Parameters<typeof TreeHeader>[0] & {
  className?: string;
};

type FileTreeContextValue = {
  size: FileTreeSize;
  showGuideLines: FileTreeShowGuideLines;
};

const FileTreeContext = createContext<FileTreeContextValue>({
  size: 'md',
  showGuideLines: true,
});

/** 默认展开指示器：ChevronRight，展开时由 CSS 旋转 90°（[data-expanded]） */
const Indicator = ({ children, className }: FileTreeIndicatorProps) => {
  if (isValidElement<{ className?: string }>(children)) {
    const merged = {
      className: clsx('file-tree__indicator', children.props.className, className),
      'data-slot': 'file-tree-indicator',
    };
    return cloneElement(children, merged as Partial<{ className?: string }>);
  }

  return (
    <svg
      className={clsx('file-tree__indicator', className)}
      data-slot="file-tree-indicator"
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M5.47 13.03a.75.75 0 0 1 0-1.06L9.44 8 5.47 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};
Indicator.displayName = 'FileTree.Indicator';

const GripVerticalIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);
GripVerticalIcon.displayName = 'FileTree.GripVerticalIcon';

/** 每个父级层级一条竖向参考线，left 由 CSS 变量按层级计算（与原站内联样式一致） */
const GuideLines = ({ level }: { level: number }) => {
  const { showGuideLines } = useContext(FileTreeContext);

  return (
    <>
      {Array.from({ length: Math.max(level - 1, 0) }, (_, lineIndex) => (
        <div
          // eslint-disable-next-line react/no-array-index-key -- 参考线按层级序号定位，顺序稳定
          key={lineIndex}
          aria-hidden="true"
          data-slot="file-tree-guide-line"
          className={clsx(
            'file-tree__guide-line',
            showGuideLines === 'hover' && 'file-tree__guide-line--hover',
            showGuideLines === false && 'file-tree__guide-line--none',
          )}
          style={{
            left: `calc(var(--file-tree-item-px) + ${lineIndex} * var(--file-tree-indent) + var(--file-tree-indent) / 2)`,
          }}
        />
      ))}
    </>
  );
};
GuideLines.displayName = 'FileTree.GuideLines';

/**
 * 包装 RAC TreeItem：role="row"、aria-expanded、data-expanded/data-has-child-items/data-level
 * 均由 RAC 提供；chevron 为 slot="chevron" 的 RAC Button（展开切换与本地化 aria-label 由 RAC 注入）。
 */
const Item = ({
  title,
  icon,
  dragIcon,
  textValue,
  className,
  style,
  children,
  ...rest
}: FileTreeItemProps) => {
  const { size } = useContext(FileTreeContext);

  // 原站 Anatomy 允许把自定义 <FileTree.Indicator> 作为 Item 子元素传入：
  // 提取后渲染进 chevron 按钮，其余子元素作为嵌套行交给 RAC
  const childArray = Children.toArray(children);
  const indicatorChild = childArray.find(
    (child) => isValidElement(child) && child.type === Indicator,
  );
  const nestedChildren = childArray.filter((child) => child !== indicatorChild);

  // 原站在 item 上内联 --tree-item-level，CSS 据此计算 item-content 缩进
  const itemStyle = useCallback(
    ({ level }: TreeItemRenderProps & { defaultStyle: CSSProperties }): CSSProperties => ({
      ['--tree-item-level' as string]: level,
      ...style,
    }),
    [style],
  );

  const renderContent = (renderProps: TreeItemContentRenderProps) => {
    const iconNode =
      typeof icon === 'function'
        ? icon({
            isExpanded: renderProps.isExpanded,
            hasChildItems: renderProps.hasChildItems,
            allowsDragging: renderProps.allowsDragging ?? false,
          })
        : icon;

    return (
      <div className="file-tree__item-content" data-slot="file-tree-item-content">
        <GuideLines level={renderProps.level} />
        {renderProps.allowsDragging && dragIcon !== false && (
          <Button slot="drag" data-slot="file-tree-drag-handle" className="file-tree__drag-handle">
            {dragIcon ?? <GripVerticalIcon />}
          </Button>
        )}
        {renderProps.selectionMode === 'multiple' &&
          renderProps.selectionBehavior === 'toggle' && (
            <span className="file-tree__checkbox" data-slot="file-tree-checkbox">
              <Checkbox slot="selection">
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox>
            </span>
          )}
        <Button slot="chevron" className="file-tree__chevron">
          {indicatorChild ?? <Indicator />}
        </Button>
        {/* 与原站快照一致：传了 icon 或是文件夹行时渲染图标占位 */}
        {(icon !== undefined || renderProps.hasChildItems) && (
          <span className="file-tree__icon" data-slot="file-tree-icon">
            {iconNode}
          </span>
        )}
        <span className="file-tree__label" data-slot="file-tree-label">
          {title}
        </span>
      </div>
    );
  };

  return (
    <TreeItem
      data-slot="file-tree-item"
      textValue={textValue ?? (typeof title === 'string' ? title : '')}
      className={clsx('file-tree__item', `file-tree__item--${size}`, className)}
      style={itemStyle}
      {...rest}
    >
      <TreeItemContent>{renderContent}</TreeItemContent>
      {nestedChildren}
    </TreeItem>
  );
};
Item.displayName = 'FileTree.Item';

function Section<T extends object>({ className, ...rest }: FileTreeSectionProps<T>) {
  return <TreeSection className={clsx('file-tree__section', className)} {...rest} />;
}
Section.displayName = 'FileTree.Section';

const SectionHeader = ({ className, ...rest }: FileTreeHeaderProps) => (
  <TreeHeader className={clsx('file-tree__section-header', className)} {...rest} />
);
SectionHeader.displayName = 'FileTree.Header';

/**
 * 基于 RAC Tree 的文件树（原站底座）：渲染 role="treegrid"，展开收起、单选/多选、
 * 键盘导航（方向键/typeahead）、拖拽均由 RAC 提供。
 */
function FileTreeRoot<T extends object>({
  size = 'md',
  reduceMotion = false,
  showGuideLines = true,
  className,
  ...rest
}: FileTreeProps<T>) {
  const contextValue = useMemo(
    () => ({ size, showGuideLines }),
    [size, showGuideLines],
  );

  return (
    <FileTreeContext.Provider value={contextValue}>
      <Tree
        data-slot="file-tree"
        data-reduce-motion={reduceMotion ? 'true' : undefined}
        className={clsx('file-tree', `file-tree--${size}`, className)}
        {...rest}
      />
    </FileTreeContext.Provider>
  );
}
FileTreeRoot.displayName = 'FileTree';

/** useFileTree 的节点约束（原站 API：必须有 id，children 可选） */
export type FileTreeNode = {
  id: Key;
  children?: FileTreeNode[];
};

export type UseFileTreeOptions<T extends FileTreeNode> = {
  items: T[];
  /** 自定义叶子判定，默认 children 为空即叶子 */
  isLeaf?: (node: T) => boolean;
};

export type UseFileTreeResult<T extends FileTreeNode> = {
  /** 全部分支节点 key，可直接用于 defaultExpandedKeys */
  expandableKeys: string[];
  /** 按叶子谓词过滤树并裁剪空分支 */
  filterTree: (predicate: (node: T) => boolean) => T[];
  /** 拍平后的全部叶子节点 */
  leaves: T[];
};

/** 树形数据工具 hook（原站 API） */
export function useFileTree<T extends FileTreeNode>({
  items,
  isLeaf,
}: UseFileTreeOptions<T>): UseFileTreeResult<T> {
  const leafCheck = useCallback(
    (node: T) =>
      isLeaf !== undefined ? isLeaf(node) : node.children === undefined || node.children.length === 0,
    [isLeaf],
  );

  const expandableKeys = useMemo(() => {
    const keys: string[] = [];
    const walk = (nodes: T[]) => {
      for (const node of nodes) {
        if (!leafCheck(node)) {
          keys.push(String(node.id));
          walk((node.children ?? []) as T[]);
        }
      }
    };
    walk(items);
    return keys;
  }, [items, leafCheck]);

  const leaves = useMemo(() => {
    const result: T[] = [];
    const walk = (nodes: T[]) => {
      for (const node of nodes) {
        if (leafCheck(node)) result.push(node);
        else walk((node.children ?? []) as T[]);
      }
    };
    walk(items);
    return result;
  }, [items, leafCheck]);

  const filterTree = useCallback(
    (predicate: (node: T) => boolean): T[] => {
      const filterNodes = (nodes: T[]): T[] =>
        nodes.flatMap((node) => {
          if (leafCheck(node)) return predicate(node) ? [node] : [];
          const filteredChildren = filterNodes((node.children ?? []) as T[]);
          return filteredChildren.length > 0
            ? [{ ...node, children: filteredChildren }]
            : [];
        });
      return filterNodes(items);
    },
    [items, leafCheck],
  );

  return { expandableKeys, filterTree, leaves };
}

export type UseFileTreeDragOptions<T extends object> = {
  /** RAC useTreeData 返回的可变树数据管理器 */
  tree: TreeData<T>;
  /** 自定义拖拽数据，默认每个 key 序列化为 text/plain */
  getItems?: DragAndDropOptions['getItems'];
  /** 移动成功后的回调（原站 API） */
  onMove?: (keys: Set<Key>, target: { key: Key; dropPosition: DropPosition }) => void;
};

export type UseFileTreeDragResult = {
  dragAndDropHooks: ReturnType<typeof useDragAndDrop>['dragAndDropHooks'];
};

/** 为 FileTree 接好 RAC useDragAndDrop 的拖拽 hook（原站 API） */
export function useFileTreeDrag<T extends object>({
  tree,
  getItems,
  onMove,
}: UseFileTreeDragOptions<T>): UseFileTreeDragResult {
  const { dragAndDropHooks } = useDragAndDrop({
    getItems:
      getItems ?? ((keys) => [...keys].map((key) => ({ 'text/plain': String(key) }))),
    onMove: (event) => {
      if (event.target.dropPosition === 'before') {
        tree.moveBefore(event.target.key, event.keys);
      } else if (event.target.dropPosition === 'after') {
        tree.moveAfter(event.target.key, event.keys);
      } else {
        // drop on：依次挂到目标节点子级末尾
        let index = tree.getItem(event.target.key)?.children?.length ?? 0;
        for (const key of event.keys) {
          tree.move(key, event.target.key, index);
          index += 1;
        }
      }
      onMove?.(event.keys, {
        key: event.target.key,
        dropPosition: event.target.dropPosition,
      });
    },
  });

  return { dragAndDropHooks };
}

const FileTree = Object.assign(FileTreeRoot, {
  Item,
  Indicator,
  Section,
  Header: SectionHeader,
});

export default FileTree;
