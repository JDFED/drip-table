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
  type DripTableExtraOptions,
  type DripTableProps,
  type DripTableRecordTypeBase,
  type DripTableRecordTypeWithSubtable,
  type DripTableTableInformation,
} from '@/types';
import { validateDripTableProp, validateDripTableRequiredProps } from '@/utils/ajv';
import ErrorBoundary from '@/components/error-boundary';
import GenericRender, { type DripTableGenericRenderElement } from '@/components/generic-render';
import { useState, useTable } from '@/hooks';
import Table from '@/layouts/table';

import styles from './index.module.less';

const DripTableLayout = <
  RecordType extends DripTableRecordTypeWithSubtable<DripTableRecordTypeBase, NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
  ExtraOptions extends Partial<DripTableExtraOptions> = never,
>(props: DripTableProps<RecordType, ExtraOptions>): JSX.Element => {
  const ajv = props.ajv;
  if (ajv !== false) {
    const errorMessage = validateDripTableRequiredProps(props, ajv)
      || Object.entries(props)
        .map(([k, v]) => React.useMemo(() => validateDripTableProp(k, v, ajv), [k, v, ajv]))
        .filter(_ => _)
        .join('\n');
    if (errorMessage) {
      return (
        <pre className={styles['ajv-error']}>
          { `Props validate failed: ${errorMessage.includes('\n') ? '\n' : ''}${errorMessage}` }
        </pre>
      );
    }
  }

  const initialState = useTable();
  const [tableState, setTableState] = initialState._CTX_SOURCE === 'CONTEXT' ? useState(initialState) : [initialState, initialState.setTableState];
  const rootRef = useRef<HTMLDivElement>(null); // ProTable组件的ref

  const tableInfo = React.useMemo((): DripTableTableInformation<RecordType, ExtraOptions> => ({
    schema: props.schema,
    dataSource: props.dataSource,
    parent: props.__PARENT_INFO__,
  }), [props.schema, props.dataSource, props.__PARENT_INFO__]);

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
        <Table
          tableProps={props}
          tableInfo={tableInfo}
          tableState={tableState}
          setTableState={setTableState}
          header={
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
          footer={
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
        />
      </div>
    </ErrorBoundary>
  );
};

export default DripTableLayout;
