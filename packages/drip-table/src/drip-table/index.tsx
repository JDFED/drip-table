/*
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import classnames from 'classnames';
import React, { useRef } from 'react';

import {
  type DripTableDriver,
  type DripTableExtraOptions,
  type DripTableFilters,
  type DripTablePagination,
  type DripTableReactComponentProps,
  type DripTableRecordTypeBase,
  type DripTableRecordTypeWithSubtable,
  type DripTableSchema,
  type DripTableTableInformation,
  type SchemaObject,
} from '@/types';
import { type DripTableDriverTableProps } from '@/types/driver/table';
import { AjvOptions, validateDripTableColumnSchema, validateDripTableProps } from '@/utils/ajv';
import ErrorBoundary from '@/components/error-boundary';
import GenericRender, { DripTableGenericRenderElement } from '@/components/generic-render';
import RichText from '@/components/rich-text';
import { useState, useTable } from '@/hooks';

import DripTableWrapper from '..';
import DripTableBuiltInComponents, { DripTableBuiltInColumnSchema, DripTableBuiltInComponentEvent, DripTableComponentProps } from './components';
import VirtualTable from './virtual-table';

import styles from './index.module.less';

export interface DripTableProps<
  RecordType extends DripTableRecordTypeWithSubtable<DripTableRecordTypeBase, NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
  ExtraOptions extends Partial<DripTableExtraOptions> = never,
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
   * 粘性头部和滚动条设置项
   */
  sticky?: {
    offsetHeader?: number;
    offsetScroll?: number;
    getContainer?: () => HTMLElement;
  };
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
    parentTable: DripTableTableInformation<RecordType>,
    subtable: DripTableTableInformation<RecordType>,
  ) => React.ReactNode;
  /**
   * 子表底部自定义渲染函数
   */
  subtableFooter?: (
    record: RecordType,
    recordIndex: number,
    parentTable: DripTableTableInformation<RecordType>,
    subtable: DripTableTableInformation<RecordType>,
  ) => React.ReactNode;
  /**
   * 获取指定行是否可展开
   */
  rowExpandable?: (
    record: RecordType,
    parentTable: DripTableTableInformation<RecordType>,
  ) => boolean;
  /**
   * 行展开自定义渲染函数
   */
  expandedRowRender?: (
    record: RecordType,
    index: number,
    parentTable: DripTableTableInformation<RecordType>,
  ) => React.ReactNode;
  /**
   * 生命周期：组件加载完成
   */
  componentDidMount?: (currentTable: DripTableTableInformation<RecordType>) => void;
  /**
   * 生命周期：组件更新完成
   */
  componentDidUpdate?: (currentTable: DripTableTableInformation<RecordType>) => void;
  /**
   * 生命周期：组件即将卸载
   */
  componentWillUnmount?: (currentTable: DripTableTableInformation<RecordType>) => void;
  /**
   * 点击行
   */
  onRowClick?: (
    record: RecordType | RecordType[],
    index: number | string | (number | string)[],
    parentTable: DripTableTableInformation<RecordType>,
  ) => void;
  /**
   * 双击行
   */
  onRowDoubleClick?: (
    record: RecordType | RecordType[],
    index: number | string | (number | string)[],
    parentTable: DripTableTableInformation<RecordType>,
  ) => void;
  /**
   * 选择行变化
   */
  onSelectionChange?: (
    selectedKeys: React.Key[],
    selectedRows: RecordType[],
    currentTable: DripTableTableInformation<RecordType>,
  ) => void;
  /**
   * 搜索触发
   */
  onSearch?: (
    searchParams: { searchKey?: number | string; searchStr: string } | Record<string, unknown>,
    currentTable: DripTableTableInformation<RecordType>,
  ) => void;
  /**
   * 点击添加按钮触发
   */
  onInsertButtonClick?: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    currentTable: DripTableTableInformation<RecordType>,
  ) => void;
  /**
   * 过滤器触发
   */
  onFilterChange?: (
    filters: DripTableFilters,
    currentTable: DripTableTableInformation<RecordType>,
  ) => void;
  /**
   * 页码/页大小变化
   */
  onPageChange?: (
    currentPage: number,
    pageSize: number,
    currentTable: DripTableTableInformation<RecordType>,
  ) => void;
  /**
   * 过滤器、分页器 等配置变化
   */
  onChange?: (
    options: {
      pagination: DripTablePagination;
      filters: DripTableFilters;
    },
    currentTable: DripTableTableInformation<RecordType>,
  ) => void;
  /**
   * 用户修改展示的列时
   */
  onDisplayColumnKeysChange?: (
    displayColumnKeys: React.Key[],
    currentTable: DripTableTableInformation<RecordType>,
  ) => void;
  /**
   * 通用事件机制
   */
  onEvent?: (
    event: DripTableBuiltInComponentEvent | NonNullable<ExtraOptions['CustomComponentEvent']>,
    record: RecordType,
    index: number,
    currentTable: DripTableTableInformation<RecordType>,
  ) => void;
}

const DripTable = <
  RecordType extends DripTableRecordTypeWithSubtable<DripTableRecordTypeBase, NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
  ExtraOptions extends Partial<DripTableExtraOptions> = never,
>(props: DripTableProps<RecordType, ExtraOptions>): JSX.Element => {
  if (props.schema && props.schema.columns.some(c => c['ui:type'] || c['ui:props'])) {
    props = {
      ...props,
      schema: {
        ...props.schema,
        columns: props.schema.columns.map((column) => {
          // 兼容旧版本数据
          if ('ui:type' in column || 'ui:props' in column) {
            const key = column.key;
            if ('ui:type' in column) {
              console.warn(`[DripTable] Column ${key} "ui:type" is deprecated, please use "component" instead.`);
            }
            if ('ui:props' in column) {
              console.warn(`[DripTable] Column ${key} "ui:props" is deprecated, please use "options" instead.`);
            }
            return {
              ...Object.fromEntries(Object.entries(column).filter(([k]) => k !== 'ui:type' && k !== 'ui:props')),
              options: column['ui:props'] || column.options || void 0,
              component: column['ui:type'] || column.component,
            } as typeof column;
          }
          return column;
        }),
      },
    };
  }

  if (props.ajv !== false) {
    const errorMessage = validateDripTableProps(props, props.ajv);
    if (errorMessage) {
      return (
        <div className={styles['ajv-error']}>
          { `Props validate failed: ${errorMessage}` }
        </div>
      );
    }
  }

  const Table = props.driver.components?.Table;
  const Popover = props.driver.components?.Popover;
  const QuestionCircleOutlined = props.driver.icons?.QuestionCircleOutlined;
  type TableColumn = NonNullable<DripTableReactComponentProps<typeof Table>['columns']>[number];

  const initialState = useTable();
  const initialPagination = props.schema?.pagination || void 0;
  const [tableState, setTableState] = initialState._CTX_SOURCE === 'CONTEXT' ? useState(initialState) : [initialState, initialState.setTableState];
  const rootRef = useRef<HTMLDivElement>(null); // ProTable组件的ref

  const tableInfo = React.useMemo((): DripTableTableInformation<RecordType> => ({ id: props.schema.id, dataSource: props.dataSource }), [props.schema.id, props.dataSource]);

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

  React.useEffect(() => {
    props.componentDidMount?.(tableInfo);
    return () => {
      props.componentWillUnmount?.(tableInfo);
    };
  });

  React.useEffect(() => {
    props.componentDidUpdate?.(tableInfo);
  }, [props]);

  /**
   * 根据组件类型，生成表格渲染器
   * @param schema Schema
   * @returns 表格
   */
  const renderGenerator = (schema: DripTableBuiltInColumnSchema | NonNullable<ExtraOptions['CustomColumnSchema']>): (value: unknown, record: RecordType, index: number) => JSX.Element | string | null => {
    if ('component' in schema) {
      const BuiltInComponent = DripTableBuiltInComponents[schema.component] as
        React.JSXElementConstructor<DripTableComponentProps<RecordType, DripTableBuiltInColumnSchema>> & { schema?: SchemaObject };
      if (BuiltInComponent) {
        if (props.ajv !== false) {
          const errorMessage = validateDripTableColumnSchema(schema, BuiltInComponent.schema, props.ajv);
          if (errorMessage) {
            return () => (
              <div className={styles['ajv-error']}>
                { `Schema validate failed: ${errorMessage}` }
              </div>
            );
          }
        }
        return (value, record, index) => (
          <BuiltInComponent
            driver={props.driver}
            value={value ?? schema.defaultValue}
            data={record}
            schema={schema as unknown as DripTableBuiltInColumnSchema}
            ext={props.ext}
            fireEvent={event => props.onEvent?.(event, record, index, tableInfo)}
          />
        );
      }
      const [libName, componentName] = schema.component.split('::');
      if (libName && componentName) {
        const ExtraComponent = props.components?.[libName]?.[componentName];
        if (ExtraComponent) {
          if (props.ajv !== false) {
            const errorMessage = validateDripTableColumnSchema(schema, ExtraComponent.schema, props.ajv);
            if (errorMessage) {
              return () => (
                <div className={styles['ajv-error']}>
                  { `Schema validate failed: ${errorMessage}` }
                </div>
              );
            }
          }
          return (value, record, index) => (
            <ExtraComponent
              driver={props.driver}
              value={value ?? schema.defaultValue}
              data={record}
              schema={schema as NonNullable<ExtraOptions['CustomColumnSchema']>}
              ext={props.ext}
              fireEvent={event => props.onEvent?.(event, record, index, tableInfo)}
            />
          );
        }
      }
    }
    return () => <div className={styles['ajv-error']}>{ `Unknown column component: ${schema.component}` }</div>;
  };

  /**
   * 根据列 Schema，生成表格列配置
   * @param schemaColumn Schema Column
   * @returns 表格列配置
   */
  const columnGenerator = (schemaColumn: DripTableBuiltInColumnSchema | NonNullable<ExtraOptions['CustomColumnSchema']>): TableColumn => {
    let width = String(schemaColumn.width).trim();
    if ((/^[0-9]+$/uig).test(width)) {
      width += 'px';
    }
    const column: TableColumn = {
      width,
      className: classnames(props.className, {
        [styles[`drip-table-vertical-${schemaColumn.verticalAlign}`]]: schemaColumn.verticalAlign,
      }),
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
    className: props.schema.innerClassName,
    style: props.schema.innerStyle,
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
        hideOnSinglePage: props.schema.pagination?.hideOnSinglePage,
      },
    scroll: props.schema.scroll,
    loading: props.loading,
    size: props.schema.size,
    bordered: props.schema.bordered,
    showHeader: props.schema.showHeader,
    sticky: props.schema.sticky
      ? props.sticky ?? true
      : false,
    title: props.title,
    footer: props.footer,
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
                      <DripTableWrapper<RecordType, ExtraOptions>
                        {...props}
                        schema={
                            Object.fromEntries(
                              Object.entries(subtable)
                                .filter(([key]) => key !== 'dataSourceKey'),
                            ) as DripTableSchema<NonNullable<ExtraOptions['CustomColumnSchema']>, NonNullable<ExtraOptions['SubtableDataSourceKey']>>
                          }
                        dataSource={record[subtable.dataSourceKey] as RecordType[]}
                        title={
                            props.subtableTitle
                              ? subtableData => props.subtableTitle?.(
                                record,
                                index,
                                tableInfo,
                                { id: subtable.id, dataSource: subtableData },
                              )
                              : void 0
                          }
                        footer={
                            props.subtableFooter
                              ? subtableData => props.subtableFooter?.(
                                record,
                                index,
                                tableInfo,
                                { id: subtable.id, dataSource: subtableData },
                              )
                              : void 0
                          }
                      />
                    )
                    : void 0
                }
                { expandedRowRender?.(record, index, tableInfo) }
              </React.Fragment>
            ),
            rowExpandable: (record) => {
              if (rowExpandable?.(record, tableInfo)) {
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
          props.onSelectionChange?.(selectedKeys, selectedRows, tableInfo);
        },
      }
      : void 0,
    onChange: (pagination, filters) => {
      const current = pagination.current ?? tableState.pagination.current;
      const pageSize = pagination.pageSize ?? tableState.pagination.pageSize;
      setTableState({ pagination: { ...tableState.pagination, current, pageSize }, filters });
      props.onFilterChange?.(filters, tableInfo);
      props.onPageChange?.(current, pageSize, tableInfo);
      props.onChange?.({ pagination, filters }, tableInfo);
    },
  };

  const header = React.useMemo<{ style?: React.CSSProperties; schemas: DripTableGenericRenderElement[] } | null>(
    () => {
      if (props.schema.header === true) {
        return {
          schemas: [
            { type: 'display-column-selector', selectorButtonType: 'primary' },
            { type: 'spacer', span: 'flex-auto' },
            { type: 'search' },
            { type: 'insert-button', showIcon: true },
          ],
        };
      }
      if (!props.schema.header || !props.schema.header.elements?.length) {
        return null;
      }
      return {
        style: props.schema.header.style,
        schemas: props.schema.header.elements,
      };
    },
    [props.schema.header],
  );

  const footer = React.useMemo<{ style?: React.CSSProperties; schemas: DripTableGenericRenderElement[] } | null>(
    () => {
      if (props.schema.footer === true) {
        return {
          schemas: [
            { type: 'display-column-selector', span: 8 },
            { type: 'search', span: 8 },
            { type: 'insert-button', span: 4 },
          ],
        };
      }
      if (!props.schema.footer || !props.schema.footer.elements?.length) {
        return null;
      }
      return {
        style: props.schema.footer.style,
        schemas: props.schema.footer.elements,
      };
    },
    [props.schema.footer],
  );

  return (
    <ErrorBoundary driver={props.driver}>
      <div
        className={classnames(props.className, props.schema.className)}
        style={Object.assign({}, props.style, props.schema.style)}
        ref={rootRef}
      >
        {
          header
            ? (
              <GenericRender
                style={header.style}
                schemas={header.schemas}
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
                scroll={{
                  ...props.schema.scroll,
                  x: props.schema.scroll?.x || '100vw',
                  y: props.schema.scroll?.y || 300,
                }}
              />
            )
            : <Table {...tableProps} />
        }
        {
          footer
            ? (
              <GenericRender
                style={footer.style}
                schemas={footer.schemas}
                tableProps={props}
                tableState={tableState}
                setTableState={setTableState}
              />
            )
            : null
        }
      </div>
    </ErrorBoundary>
  );
};

export default DripTable;
