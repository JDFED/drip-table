/*
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import React from 'react';

import {
  type DripTableExtraOptions,
  type DripTableProps,
  type DripTableRecordTypeBase,
  type DripTableRecordTypeWithSubtable,
  type SchemaObject,
} from '@/types';
import { validateDripTableColumnSchema } from '@/utils/ajv';
import DripTableBuiltInComponents from '@/components/built-in';
import { type IDripTableContext, DripTableContext } from '@/context';
import { useState, useTable } from '@/hooks';
import DripTableLayout from '@/layouts';

import styles from './index.module.less';

/**
 * 暴露给外部直接操作实例的接口
 */
export interface DripTableWrapperContext extends IDripTableContext {
  /**
   * 通过接口选择行
   *
   * @param indexes 行号数组
   */
  select: (indexes: number[]) => void;
}

// 组件提供给外部的公共接口
const createTableContext = <
  RecordType extends DripTableRecordTypeWithSubtable<DripTableRecordTypeBase, NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
  ExtraOptions extends Partial<DripTableExtraOptions> = never,
>(props: DripTableProps<RecordType, ExtraOptions>): DripTableWrapperContext => {
  const initialState = useTable();
  const [state, setState] = useState(initialState);

  const select = (indexes: number[]) => {
    let selectedKeys: React.Key[] = [];
    const { dataSource, schema: { rowKey } } = props;
    if (dataSource && rowKey) {
      indexes.forEach((index) => {
        const data = dataSource[index];
        if (data) {
          const value = data[rowKey];
          const key = typeof value === 'string' || typeof value === 'number'
            ? value
            : index;
          selectedKeys.push(key);
        }
      });
    } else {
      selectedKeys = [...indexes];
    }
    setState({ selectedRowKeys: selectedKeys });
  };

  const handler: DripTableWrapperContext = {
    ...state,
    setTableState: setState,
    select,
    _CTX_SOURCE: 'PROVIDER', // context 来源于 drip-table-provider
  };
  return handler;
};

const DripTableWrapper: <
  RecordType extends DripTableRecordTypeWithSubtable<DripTableRecordTypeBase, NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
  ExtraOptions extends Partial<DripTableExtraOptions> = never,
> (props: React.PropsWithoutRef<DripTableProps<RecordType, ExtraOptions>> & React.RefAttributes<DripTableWrapperContext>) =>
(React.ReactElement | null) = React.forwardRef((props, ref) => {
  const tableProps = React.useMemo(
    () => {
      let rtp = props;
      // 兼容旧版本数据
      if (rtp.schema?.columns?.some(c => c['ui:type'] || c['ui:props'])) {
        rtp = {
          ...rtp,
          schema: Object.assign(
            {},
            rtp.schema,
            {
              columns: rtp.schema?.columns?.map((column) => {
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
          ),
        };
      }
      // 列 ajv 校验
      const ajv = rtp.ajv;
      if (ajv !== false) {
        rtp = {
          ...rtp,
          schema: Object.assign(
            {},
            rtp.schema,
            {
              columns: rtp.schema?.columns?.map((column) => {
                let schema: SchemaObject | undefined;
                const BuiltInComponent = DripTableBuiltInComponents[column.component];
                if (BuiltInComponent) {
                  schema = BuiltInComponent.schema;
                } else {
                  const [libName, componentName] = column.component.split('::');
                  if (libName && componentName) {
                    const ExtraComponent = rtp.components?.[libName]?.[componentName];
                    if (ExtraComponent) {
                      schema = ExtraComponent.schema;
                    }
                  }
                }
                if (schema) {
                  const errorMessage = validateDripTableColumnSchema(column, schema, ajv);
                  if (errorMessage) {
                    return {
                      component: 'text',
                      options: {
                        mode: 'static',
                        static: errorMessage,
                        className: styles['jfe-drip-table-column-ajv-error'],
                      },
                    } as typeof column;
                  }
                }
                return column;
              }),
            },
          ),
        };
      }
      return rtp;
    },
    [props],
  );

  const ConfigProvider = tableProps.driver.components.ConfigProvider;
  const context = createTableContext(tableProps);
  React.useImperativeHandle(ref, () => context);
  return (
    <ConfigProvider locale={tableProps?.driver.locale}>
      <DripTableContext.Provider {...tableProps} value={context}>
        <DripTableLayout {...tableProps} />
      </DripTableContext.Provider>
    </ConfigProvider>
  );
});

export default DripTableWrapper;
