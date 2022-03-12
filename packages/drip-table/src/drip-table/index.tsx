/*
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import classnames from 'classnames';
import React, { useRef } from 'react';

import { DripTableDriver, DripTableFilters, DripTableReactComponentProps, DripTableRecordTypeBase, DripTableSchema, EventLike } from '@/types';
import { DripTableDriverTableProps } from '@/types/driver/table';
import ErrorBoundary from '@/components/ErrorBoundary';
import RichText from '@/components/RichText';
import { useState, useTable } from '@/hooks';

import { DripTableColumnSchema, DripTablePagination } from '..';
import DripTableBuiltInComponents, { DripTableBuiltInColumnSchema, DripTableBuiltInComponentEvent, DripTableComponentProps, DripTableComponentSchema } from './components';
import Header from './header';
import VirtualTable from './virtual-table';

import styles from './index.module.css';

export interface DripTableProps<
  RecordType extends DripTableRecordTypeBase,
  CustomComponentSchema extends DripTableComponentSchema = never,
  CustomComponentEvent extends EventLike = never,
  Ext = unknown,
> {
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
  schema: DripTableSchema<CustomComponentSchema>;
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
   * 附加数据
   */
  ext?: Ext;
  /**
   * 数据源总条数
   */
  total?: number;
  /**
   * 当前页码
   */
  currentPage?: number;
  /**
   * 加载中
   */
  loading?: boolean;
  /**
   * 组件库
   */
  components?: {
    [libName: string]: {
      [componentName: string]: React.JSXElementConstructor<DripTableComponentProps<RecordType, DripTableComponentSchema, CustomComponentEvent, Ext>>;
    };
  };
  /**
   * 子表顶部自定义渲染函数
   */
  subtableTitle?: (record: RecordType, index: number, subtableData: readonly DripTableRecordTypeBase[]) => React.ReactNode;
  /**
   * 子表底部自定义渲染函数
   */
  subtableFooter?: (record: RecordType, index: number, subtableData: readonly DripTableRecordTypeBase[]) => React.ReactNode;
  /**
   * 获取指定行是否可展开
   */
  rowExpandable?: (record: RecordType) => boolean;
  /**
   * 行展开自定义渲染函数
   */
  expandedRowRender?: (record: RecordType, index: number) => React.ReactNode;
  /** 生命周期 */
  componentDidMount?: () => void;
  componentDidUpdate?: () => void;
  componentWillUnmount?: () => void;
  /**
   * 点击行
   */
  onRowClick?: (record: RecordType | RecordType[], index?: number | string | (number | string)[]) => void;
  /**
   * 双击行
   */
  onRowDoubleClick?: (record: RecordType | RecordType[], index?: number | string | (number | string)[]) => void;
  /**
   * 选择行变化
   */
  onSelectionChange?: (selectedKeys: React.Key[], selectedRows: RecordType[]) => void;
  /**
   * 搜索触发
   */
  onSearch?: (searchParams: { searchKey?: number | string; searchStr: string } | Record<string, unknown>) => void;
  /**
   * 点击添加按钮触发
   */
  onInsertButtonClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  /**
   * 过滤器触发
   */
  onFilterChange?: (filters: DripTableFilters) => void;
  /**
   * 页码/页大小变化
   */
  onPageChange?: (currentPage: number, pageSize: number) => void;
  /**
   * 过滤器、分页器 等配置变化
   */
  onChange?: (pagination: DripTablePagination, filters: DripTableFilters) => void;
  /**
   * 用户修改展示的列时
   */
  onDisplayColumnKeysChange?: (displayColumnKeys: React.Key[]) => void;
  /**
   * 通用事件机制
   */
  onEvent?: (event: DripTableBuiltInComponentEvent | CustomComponentEvent, record: RecordType, index: number) => void;
}

const DripTable = <
  RecordType extends DripTableRecordTypeBase,
  CustomComponentSchema extends DripTableComponentSchema = never,
  CustomComponentEvent extends EventLike = never,
  Ext = unknown,
>(props: DripTableProps<RecordType, CustomComponentSchema, CustomComponentEvent, Ext>): JSX.Element => {
  const Table = props.driver.components?.Table;
  const Popover = props.driver.components?.Popover;
  const QuestionCircleOutlined = props.driver.icons?.QuestionCircleOutlined;
  type TableColumn = NonNullable<DripTableReactComponentProps<typeof Table>['columns']>[number];

  const initialState = useTable();
  const initialPagination = props.schema?.pagination || void 0;
  const [tableState, setTableState] = initialState._CTX_SOURCE === 'CONTEXT' ? useState(initialState) : [initialState, initialState.setTableState];
  const rootRef = useRef<HTMLDivElement>(null); // ProTable组件的ref

  React.useEffect(() => {
    setTableState(state => ({
      pagination: {
        ...state.pagination,
        pageSize: initialPagination?.pageSize || 10,
      },
    }));
  }, [initialPagination?.pageSize]);

  React.useEffect(() => {
    setTableState(state => ({
      displayColumnKeys: props.displayColumnKeys || props.schema.columns.filter(c => c.hidable).map(c => c.key),
    }));
  }, [props.displayColumnKeys]);

  /**
   * 根据组件类型，生成表格渲染器
   * @param schema Schema
   * @returns 表格
   */
  const renderGenerator = (schema: CustomComponentSchema | DripTableBuiltInColumnSchema): (value: unknown, record: RecordType, index: number) => JSX.Element | string | null => {
    const uiType = 'ui:type' in schema ? schema['ui:type'] : void 0;
    if (uiType) {
      const BuiltInComponent = DripTableBuiltInComponents[uiType] as React.JSXElementConstructor<DripTableComponentProps<RecordType, DripTableColumnSchema<DripTableBuiltInColumnSchema['ui:type'], DripTableComponentSchema>>>;
      if (BuiltInComponent) {
        return (value, record, index) => (
          <BuiltInComponent
            driver={props.driver}
            value={value}
            data={record}
            schema={{ ...schema, ...schema['ui:props'], 'ui:type': uiType }}
            ext={props.ext}
            fireEvent={event => props.onEvent?.(event, record, index)}
          />
        );
      }
    }
    const [libName, componentName] = schema['ui:type'].split('::');
    if (libName && componentName) {
      const ExtraComponent = props.components?.[libName]?.[componentName];
      if (ExtraComponent) {
        return (value, record, index) => (
          <ExtraComponent
            driver={props.driver}
            value={value}
            data={record}
            schema={schema}
            ext={props.ext}
            fireEvent={event => props.onEvent?.(event, record, index)}
          />
        );
      }
    }
    return value => JSON.stringify(value);
  };

  /**
   * 根据列 Schema，生成表格列配置
   * @param schemaColumn Schema Column
   * @returns 表格列配置
   */
  const columnGenerator = (schemaColumn: CustomComponentSchema | DripTableBuiltInColumnSchema): TableColumn => {
    let width = String(schemaColumn.width).trim();
    if ((/^[0-9]+$/uig).test(width)) {
      width += 'px';
    }
    const column: TableColumn = {
      width,
      align: schemaColumn.align,
      title: schemaColumn.title,
      dataIndex: schemaColumn.dataIndex,
      fixed: schemaColumn.fixed,
      filters: schemaColumn.filters,
      defaultFilteredValue: schemaColumn.defaultFilteredValue,
    };
    if (schemaColumn.description) {
      column.title = (
        <div>
          <span style={{ marginRight: '6px' }}>{ schemaColumn.title }</span>
          <Popover placement="top" title="" content={<RichText html={schemaColumn.description} />}>
            <QuestionCircleOutlined />
          </Popover>
        </div>
      );
    }
    if (props.schema.ellipsis) {
      column.ellipsis = true;
    }
    if (!column.render) {
      column.render = renderGenerator(schemaColumn) as TableColumn['render'];
    }
    return column;
  };

  const tableProps: DripTableDriverTableProps<RecordType> = {
    rowKey: props.schema.rowKey ?? 'key',
    columns: React.useMemo(
      () => props.schema.columns
        .filter(column => !column.hidable || tableState.displayColumnKeys.includes(column.key))
        .map(columnGenerator),
      [props.schema.columns, tableState.displayColumnKeys],
    ),
    dataSource: React.useMemo(
      () => props.dataSource.map((item, index) => {
        const rowKey = props.schema.rowKey ?? 'key';
        return {
          ...item,
          [rowKey]: typeof item[rowKey] === 'undefined' ? index : item[rowKey],
        };
      }),
      [props.dataSource, props.schema.rowKey],
    ),
    pagination: props.schema.pagination === false
      ? false as const
      : {
        size: props.schema.pagination?.size === void 0 ? 'small' : props.schema.pagination.size,
        pageSize: tableState.pagination.pageSize,
        total: props.total === void 0 ? props.dataSource.length : props.total,
        current: props.currentPage || tableState.pagination.current,
        position: [props.schema.pagination?.position || 'bottomRight'],
        showLessItems: props.schema.pagination?.showLessItems,
        showQuickJumper: props.schema.pagination?.showQuickJumper,
        showSizeChanger: props.schema.pagination?.showSizeChanger,
      },
    loading: props.loading,
    size: props.schema.size,
    bordered: props.schema.bordered,
    showHeader: props.schema.showHeader,
    sticky: props.schema.virtual ? false : props.schema.sticky,
    expandable: React.useMemo(
      () => {
        const subtable = props.schema.subtable;
        const expandedRowRender = props.expandedRowRender;
        const rowExpandable = props.rowExpandable;
        if (subtable || expandedRowRender) {
          return {
            expandedRowRender: (record, index) => (
              <React.Fragment>
                {
                  subtable && Array.isArray(record[subtable.dataSourceKey])
                    ? (
                      <Table<DripTableRecordTypeBase>
                        columns={subtable.columns.map(columnGenerator)}
                        dataSource={(record[subtable.dataSourceKey] as DripTableRecordTypeBase[]).map((subItem, subIndex) => {
                          const rowKey = subtable.rowKey ?? 'key';
                          return {
                            ...subItem,
                            [rowKey]: typeof subItem[rowKey] === 'undefined' ? subIndex : subItem[rowKey],
                          };
                        })}
                        rowKey={subtable.rowKey ?? 'key'}
                        size={subtable.size ?? 'middle'}
                        bordered={subtable.bordered}
                        showHeader={subtable.showHeader}
                        pagination={{
                          hideOnSinglePage: true,
                        }}
                        title={subtableData => (
                          props.subtableTitle
                            ? props.subtableTitle(record, index, subtableData)
                            : void 0
                        )}
                        footer={subtableData => (
                          props.subtableFooter
                            ? props.subtableFooter(record, index, subtableData)
                            : void 0
                        )}
                      />
                    )
                    : void 0
                }
                { expandedRowRender?.(record, index) }
              </React.Fragment>
            ),
            rowExpandable: (record) => {
              if (rowExpandable?.(record)) {
                return true;
              }
              if (subtable) {
                const ds = record[subtable.dataSourceKey];
                return Array.isArray(ds) && ds.length > 0;
              }
              return false;
            },
          };
        }
        return void 0;
      },
      [props.schema.subtable, props.expandedRowRender, props.rowExpandable],
    ),
    rowSelection: props.schema.rowSelection && !props.schema.virtual
      ? {
        selectedRowKeys: props.selectedRowKeys || tableState.selectedRowKeys,
        onChange: (selectedKeys, selectedRows) => {
          setTableState({ selectedRowKeys: [...selectedKeys] });
          props.onSelectionChange?.(selectedKeys, selectedRows);
        },
      }
      : void 0,
    onChange: (pagination, filters) => {
      const current = pagination.current ?? tableState.pagination.current;
      const pageSize = pagination.pageSize ?? tableState.pagination.pageSize;
      setTableState({ pagination: { ...tableState.pagination, current, pageSize }, filters });
      props.onFilterChange?.(filters);
      props.onPageChange?.(current, pageSize);
      props.onChange?.(pagination, filters);
    },
  };

  return (
    <ErrorBoundary driver={props.driver}>
      <div
        className={classnames(styles['drip-table-wrapper'], props.className)}
        style={props.style}
        ref={rootRef}
      >
        {
          props.schema.header
            ? (
              <Header
                tableProps={props}
                tableState={tableState}
                setTableState={setTableState}
              />
            )
            : null
          }
        {
          props.schema.virtual
            ? (
              <VirtualTable
                {...tableProps}
                driver={props.driver}
                scroll={{ y: props.schema.scrollY || 300, x: '100vw' }}
              />
            )
            : <Table {...tableProps} />
        }
      </div>
    </ErrorBoundary>
  );
};

export default DripTable;
