/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import type { SchemaObject } from 'ajv';
import type React from 'react';

import type { AjvOptions } from '@/utils/ajv';
import type { DripTableBuiltInColumnSchema, DripTableBuiltInComponentEvent, DripTableComponentProps } from '@/components/built-in';
import type { DripTableGenericRenderElement } from '@/components/generic-render';

import type { DripTableDriver } from './driver';

export { SchemaObject } from 'ajv';

export interface DripTableColumnSchema<T = string, P extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * 组件类型标识符，自定义开发的业务组件以`命名空间::组件名称`格式填写；通过 components 属性传入组件库实现
   */
  component: T;
  /**
   * 对应组件类型的配置项
   */
  options: P;
  /**
   * @deprecated 已废弃，请使用 component 属性
   */
  'ui:type'?: T;
  /**
   * @deprecated 已废弃，请使用 options 属性
   */
  'ui:props'?: P;
  /**
   * 唯一标识，不做展示用，React 需要的 key。
   */
  key: string;
  /**
   * 表头，组件名
   */
  title: string;
  /**
   * 列数据在数据项中对应的路径，支持通过数组查询嵌套路径
   */
  dataIndex: string | string[];
  /**
   * 默认数据
   */
  defaultValue?: unknown;
  /**
   * 表格列宽
   */
  width?: string | number;
  /**
   * 表格列水平对齐方式
   */
  align?: 'left' | 'center' | 'right';
  /**
   * 表格列垂直对齐方式
   */
  verticalAlign?: 'top' | 'middle' | 'bottom';
  /**
   * 表头说明
   */
  description?: string;
  /**
   * 是否固定列
   */
  fixed?: 'left' | 'right' | boolean;
  /**
   * 用户可控制该列显示隐藏
   */
  hidable?: boolean;
  /**
   * 数据过滤器设置
   */
  filters?: {
    text: React.ReactNode;
    value: string | number | boolean;
  }[];
  /**
   * 默认数据过滤器值
   */
  defaultFilteredValue?: React.Key[] | null;
}

export type DripTableID = string | number | undefined;

export interface DripTableSchema<
  CustomColumnSchema extends DripTableColumnSchema = never,
  SubtableDataSourceKey extends React.Key = never,
> {
  /**
   * 表格标识符，当存在子表嵌套渲染、回调时可用于区分不同层级表格
   */
  id?: DripTableID;
  /**
   * 自定义表格类名
   */
  className?: string;
  /**
   * 自定义表格样式
   */
  style?: React.CSSProperties;
  /**
   * 内部表格组件类名
   */
  innerClassName?: string;
  /**
   * 内部表格组件样式
   */
  innerStyle?: React.CSSProperties;
  /**
   * 是否展示表格边框
   */
  bordered?: boolean;
  /**
   * 是否显示表头
   */
  showHeader?: boolean;
  /**
   * 是否展示头部以及配置
   */
  header?: {
    /**
     * 头部自定义样式
     */
    style?: React.CSSProperties;
    /**
     * 头部展示元素配置
     */
    elements?: DripTableGenericRenderElement[];
  } | boolean;
  /**
   * 是否展示尾部以及配置
   */
  footer?: {
    /**
     * 尾部自定义样式
     */
    style?: React.CSSProperties;
    /**
     * 尾部展示元素配置
     */
    elements?: DripTableGenericRenderElement[];
  };
  /**
   * 是否展示分页以及配置
   */
  pagination?: false | {
    size?: 'small' | 'default';
    pageSize: number;
    position?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
    showTotal?: boolean | string;
    total?: number;
    showLessItems?: boolean;
    showQuickJumper?: boolean;
    showSizeChanger?: boolean;
    hideOnSinglePage?: boolean;
  };
  size?: 'small' | 'middle' | 'large' | 'default';
  /**
   * 冻结表头
   */
  sticky?: boolean;
  /**
   * 固定列、固定表头滚动设置
   */
  scroll?: {
    x?: number | true | string;
    y?: number | string;
    scrollToFirstRowOnChange?: boolean;
  };
  /**
   * 是否支持选择栏
   */
  rowSelection?: boolean;
  /**
   * 是否可通过点击进入编辑模式
   */
  editable?: boolean;
  /**
   * 是否平均列宽
   */
  ellipsis?: boolean;
  /**
   * 是否开启虚拟滚动
   */
  virtual?: boolean;
  /**
   * 行高，用于虚拟滚动渲染
   */
  rowHeight?: number;
  /**
   * 虚拟列表滚动高度
   * @deprecated 请使用 scroll.y
   */
  scrollY?: number;
  /**
   * 列定义
   */
  columns: (CustomColumnSchema | DripTableBuiltInColumnSchema)[];
  /**
   * 表格行主键
   */
  rowKey?: string;
  /**
   * 子表设置项
   */
  subtable?: {
    /**
     * 父表获取子表数据源键名
     */
    dataSourceKey: SubtableDataSourceKey;
  } & DripTableSchema<CustomColumnSchema, SubtableDataSourceKey>;
}

export type DripTableRecordTypeBase = Record<string, unknown>;

export type DripTableRecordTypeWithSubtable<
  RecordType extends DripTableRecordTypeBase,
  SubtableDataSourceKey extends React.Key
> = RecordType & { [key in SubtableDataSourceKey]?: RecordType[]; }

export interface DripTableExtraOptions {
  CustomColumnSchema: DripTableColumnSchema;
  CustomComponentEvent: EventLike;
  CustomComponentExtraData: unknown;
  SubtableDataSourceKey: React.Key;
}

/**
 * 表格信息
 */
export interface DripTableTableInformation<
  RecordType extends DripTableRecordTypeWithSubtable<DripTableRecordTypeBase, NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
  ExtraOptions extends Partial<DripTableExtraOptions> = never,
> {
  /**
   * 表格 Schema
   */
  schema: DripTableSchema<NonNullable<ExtraOptions['CustomColumnSchema']>, NonNullable<ExtraOptions['SubtableDataSourceKey']>>;
  /**
   * 表格数据
   */
  dataSource: readonly RecordType[];
  /**
   * 所属数据（通常用于子表寻找父级行数据）
   */
  record?: RecordType;
  /**
   * 表格父级信息
   */
  parent?: DripTableTableInformation<RecordType, ExtraOptions>;
}

export interface DripTablePagination {
  onChange?: (page: number, pageSize?: number) => void;
  size?: 'small' | 'default';
  pageSize?: number;
  total?: number;
  showTotal?: (total: number, range?: [number, number]) => string;
  current?: number;
  position?: ('topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight')[];
  showLessItems?: boolean;
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
  hideOnSinglePage?: boolean;
}

export type DripTableFilters = Record<string, (React.Key | boolean)[] | null>;

export type { DripTableDriver, DripTableReactComponent, DripTableReactComponentProps } from './driver';

/**
 * 指定子表格的参数
 */
export interface DripTableSubtableProps {
  /**
   * 数据源总条数
   */
  total?: number;
  /**
   * 指定表是否默认展开所有子表
   */
  defaultExpandAllRows?: boolean;
  /**
   * 指定表默认展开子表键列表
   */
  defaultExpandedRowKeys?: React.Key[];
}

/**
 * 表格组件属性
 */
export interface DripTableProps<
  RecordType extends DripTableRecordTypeWithSubtable<DripTableRecordTypeBase, NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
  ExtraOptions extends Partial<DripTableExtraOptions> = never,
> extends DripTableSubtableProps {
  /**
   * 底层组件驱动
   */
  driver: DripTableDriver;
  /**
   * 样式表类名
   */
  className?: string;
  /**
   * 自定义样式表
   */
  style?: React.CSSProperties;
  /**
   * 表单 Schema
   */
  schema: DripTableSchema<NonNullable<ExtraOptions['CustomColumnSchema']>, NonNullable<ExtraOptions['SubtableDataSourceKey']>>;
  /**
   * 数据源
   */
  dataSource: RecordType[];
  /**
   * 当前选中的行键
   */
  selectedRowKeys?: React.Key[];
  /**
   * 当前显示的列键
   */
  displayColumnKeys?: React.Key[];
  /**
   * 当前页码
   */
  currentPage?: number;
  /**
   * 加载中
   */
  loading?: boolean;
  /**
   * 冻结表头和滚动条设置项
   */
  sticky?: {
    offsetHeader?: number;
    offsetScroll?: number;
    getContainer?: () => HTMLElement;
  };
  /**
   * 子表参数匹配设置，可用于覆盖父表参数透传
   */
  subtableProps?: {
    /**
     * 根据子表 id 进行匹配
     */
    subtableID?: DripTableID;
    /**
     * 根据子表所在行 KEY 匹配
     */
    recordKeys?: unknown[];
    /**
     * 默认兜底设置
     */
    default?: boolean;
    /**
     * 子表参数
     */
    properties: DripTableSubtableProps;
  }[];
  /**
   * 表格单元格组件库
   */
  components?: {
    [libName: string]: {
      [componentName: string]:
      React.JSXElementConstructor<
      DripTableComponentProps<
      RecordType,
      NonNullable<ExtraOptions['CustomColumnSchema']>,
      NonNullable<ExtraOptions['CustomComponentEvent']>,
      NonNullable<ExtraOptions['CustomComponentExtraData']>
      >
      > & { schema?: SchemaObject };
    };
  };
  /**
   * 组件插槽，可通过 Schema 控制自定义区域渲染
   */
  slots?: {
    [componentType: string]: React.JSXElementConstructor<{
      style?: React.CSSProperties;
      className?: string;
      slotType: string;
      driver: DripTableDriver;
      schema: DripTableSchema<NonNullable<ExtraOptions['CustomColumnSchema']>, NonNullable<ExtraOptions['SubtableDataSourceKey']>>;
      dataSource: readonly RecordType[];
      onSearch: (searchParams: Record<string, unknown>) => void;
    }>;
  };
  /**
   * Schema 校验配置项
   */
  ajv?: AjvOptions | false;
  /**
   * 自定义组件附加透传数据
   */
  ext?: NonNullable<ExtraOptions['CustomComponentExtraData']>;
  /**
   * 顶部自定义渲染函数
   */
  title?: (data: readonly RecordType[]) => React.ReactNode;
  /**
   * 底部自定义渲染函数
   */
  footer?: (data: readonly RecordType[]) => React.ReactNode;
  /**
   * 子表顶部自定义渲染函数
   */
  subtableTitle?: (
    record: RecordType,
    recordIndex: number,
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => React.ReactNode;
  /**
   * 子表底部自定义渲染函数
   */
  subtableFooter?: (
    record: RecordType,
    recordIndex: number,
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => React.ReactNode;
  /**
   * 获取指定行是否可展开
   */
  rowExpandable?: (
    record: RecordType,
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => boolean;
  /**
   * 行展开自定义渲染函数
   */
  expandedRowRender?: (
    record: RecordType,
    index: number,
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => React.ReactNode;
  /**
   * 生命周期：组件加载完成
   */
  componentDidMount?: (tableInfo: DripTableTableInformation<RecordType, ExtraOptions>) => void;
  /**
   * 生命周期：组件更新完成
   */
  componentDidUpdate?: (tableInfo: DripTableTableInformation<RecordType, ExtraOptions>) => void;
  /**
   * 生命周期：组件即将卸载
   */
  componentWillUnmount?: (tableInfo: DripTableTableInformation<RecordType, ExtraOptions>) => void;
  /**
   * 点击行
   */
  onRowClick?: (
    record: RecordType | RecordType[],
    index: number | string | (number | string)[],
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 双击行
   */
  onRowDoubleClick?: (
    record: RecordType | RecordType[],
    index: number | string | (number | string)[],
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 选择行变化
   */
  onSelectionChange?: (
    selectedKeys: React.Key[],
    selectedRows: RecordType[],
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 搜索触发
   */
  onSearch?: (
    searchParams: { searchKey?: number | string; searchStr: string } | Record<string, unknown>,
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 点击添加按钮触发
   */
  onInsertButtonClick?: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 过滤器触发
   */
  onFilterChange?: (
    filters: DripTableFilters,
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 页码/页大小变化
   */
  onPageChange?: (
    currentPage: number,
    pageSize: number,
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 过滤器、分页器 等配置变化
   */
  onChange?: (
    options: {
      pagination: DripTablePagination;
      filters: DripTableFilters;
    },
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 数据源编辑变化事件
   */
  onDataSourceChange?: (
    dataSource: RecordType[],
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 用户修改展示的列时
   */
  onDisplayColumnKeysChange?: (
    displayColumnKeys: React.Key[],
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 通用事件机制
   */
  onEvent?: (
    event: DripTableBuiltInComponentEvent | NonNullable<ExtraOptions['CustomComponentEvent']>,
    record: RecordType,
    index: number,
    tableInfo: DripTableTableInformation<RecordType, ExtraOptions>,
  ) => void;
  /**
   * 渲染子表时用于透传父级信息，仅限内部使用
   * @internal
   */
  __PARENT_INFO__?: DripTableTableInformation<RecordType, ExtraOptions>;
}

export type EventLike<T = { type: string }> = T extends { type: string } ? T : never;
export interface DripTableCustomEvent<TN> extends EventLike<{ type: 'custom' }> { name: TN }
