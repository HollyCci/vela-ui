import {
  forwardRef,
  useCallback,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type FileTreeSize = 'sm' | 'md' | 'lg';

export type FileTreeNode = {
  key: string;
  label: string;
  icon?: ReactNode;
  children?: FileTreeNode[];
  isDisabled?: boolean;
};

export type FileTreeProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  nodes: FileTreeNode[];
  size?: FileTreeSize;
  /** 默认展开的节点 key */
  defaultExpandedKeys?: string[];
  /** 选中的节点 key（受控） */
  selectedKey?: string;
  onSelect?: (key: string) => void;
  /** 无数据时的提示文案 */
  emptyText?: string;
};

type TreeItemProps = {
  node: FileTreeNode;
  level: number;
  size: FileTreeSize;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (key: string) => void;
  onSelect?: (key: string) => void;
};

const TreeItem = ({
  node,
  level,
  size,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
}: TreeItemProps) => {
  const hasChildren = node.children !== undefined && node.children.length > 0;

  const handleChevronClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      onToggle(node.key);
    },
    [onToggle, node.key],
  );

  const handleItemClick = useCallback(() => {
    onSelect?.(node.key);
  }, [onSelect, node.key]);

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-disabled={node.isDisabled || undefined}
      aria-level={level}
      tabIndex={node.isDisabled ? -1 : 0}
      data-selected={isSelected || undefined}
      data-expanded={hasChildren && isExpanded ? 'true' : undefined}
      data-has-child-items={hasChildren ? 'true' : undefined}
      className={clsx('file-tree__item', `file-tree__item--${size}`)}
      onClick={handleItemClick}
      style={{ ['--tree-item-level' as string]: String(level) }}
    >
      <div className="file-tree__item-content">
        <span
          className="file-tree__chevron"
          role="presentation"
          onClick={hasChildren ? handleChevronClick : undefined}
        >
          <span className="file-tree__indicator" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </span>
        </span>
        {node.icon !== undefined && <span className="file-tree__icon">{node.icon}</span>}
        <span className="file-tree__label">{node.label}</span>
      </div>
    </div>
  );
};
TreeItem.displayName = 'FileTree.Item';

type TreeBranchProps = Omit<TreeItemProps, 'isExpanded' | 'isSelected' | 'level'> & {
  level: number;
  expandedKeys: Set<string>;
  selectedKey?: string;
};

const TreeBranch = ({
  node,
  level,
  size,
  expandedKeys,
  selectedKey,
  onToggle,
  onSelect,
}: TreeBranchProps) => {
  const isExpanded = expandedKeys.has(node.key);
  return (
    <>
      <TreeItem
        node={node}
        level={level}
        size={size}
        isExpanded={isExpanded}
        isSelected={node.key === selectedKey}
        onToggle={onToggle}
        onSelect={onSelect}
      />
      {isExpanded && node.children !== undefined && (
        <div role="group">
          {node.children.map((child) => (
            <TreeBranch
              key={child.key}
              node={child}
              level={level + 1}
              size={size}
              expandedKeys={expandedKeys}
              selectedKey={selectedKey}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  );
};
TreeBranch.displayName = 'FileTree.Branch';

const FileTree = forwardRef<HTMLDivElement, FileTreeProps>(
  (
    {
      nodes,
      size = 'md',
      defaultExpandedKeys = [],
      selectedKey,
      onSelect,
      emptyText = '暂无数据',
      className,
      ...rest
    },
    ref,
  ) => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
      () => new Set(defaultExpandedKeys),
    );

    const handleToggle = useCallback((key: string) => {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    }, []);

    const isEmpty = nodes.length === 0;

    return (
      <div
        ref={ref}
        role="tree"
        data-empty={isEmpty ? 'true' : undefined}
        className={clsx('file-tree', `file-tree--${size}`, className)}
        {...rest}
      >
        {isEmpty
          ? emptyText
          : nodes.map((node) => (
              <TreeBranch
                key={node.key}
                node={node}
                level={1}
                size={size}
                expandedKeys={expandedKeys}
                selectedKey={selectedKey}
                onToggle={handleToggle}
                onSelect={onSelect}
              />
            ))}
      </div>
    );
  },
);

FileTree.displayName = 'FileTree';

export default FileTree;
