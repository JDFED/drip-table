/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : qianjing29 (qianjing29@jd.com)
 * @modifier : qianjing29 (qianjing29@jd.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */
import React from 'react';

import { type DripTableColumnSchema,
  type DripTableExtraOptions,
  type DripTableProps, type DripTableRecordTypeBase,
  type DripTableRecordTypeWithSubtable,
  type SchemaObject } from '@/types';

import DripTableBuiltInComponents, { DripTableBuiltInColumnSchema, DripTableBuiltInComponentEvent } from '..';
import { DripTableComponentProps } from '../component';

export type DTCGroupColumnSchema<CustomComponentSchema> = DripTableColumnSchema<'group', {
  /** 布局配置：水平排列对齐方式 */
  horizontalAlign?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
  /** 布局配置：垂直排列对齐方式 */
  verticalAlign?: 'top' | 'middle' | 'bottom';
  /** 布局配置：每行列数 */
  layout: number[];
  /** 布局配置：行列间隔 */
  gutter?: [number, number];
  /** 布局配置：是否自动换行 */
  wrap?: boolean;
  /** 布局配置：列偏移 */
  offset?: number[];
  /** 每个栅格栏的配置 */
  items: (DripTableBuiltInColumnSchema | NonNullable<CustomComponentSchema> | null)[];
}>;

interface DTCGroupProps<
  RecordType extends DripTableRecordTypeWithSubtable<DripTableRecordTypeBase, NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
  ExtraOptions extends Partial<DripTableExtraOptions> = never,
 > extends DripTableComponentProps<RecordType, DTCGroupColumnSchema<ExtraOptions['CustomColumnSchema']>> {
  extraComponents?: DripTableProps<RecordType, ExtraOptions>['components'];
  ext?: NonNullable<ExtraOptions['CustomComponentExtraData']>;
}

interface DTCGroupState {}

export default class DTCGroup<
 RecordType extends DripTableRecordTypeWithSubtable<DripTableRecordTypeBase, NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
 ExtraOptions extends Partial<DripTableExtraOptions> = never,
 > extends React.PureComponent<DTCGroupProps<RecordType, ExtraOptions>, DTCGroupState> {
  public static componentName: DTCGroupColumnSchema<DripTableExtraOptions['CustomColumnSchema']>['component'] = 'group';
  public static schema: SchemaObject = {
    properties: {
      horizontalAlign: { enum: ['start', 'end', 'center', 'space-around', 'space-between'] },
      verticalAlign: { enum: ['top', 'middle', 'bottom'] },
      layout: { type: 'array', items: { type: 'number' } },
      gutter: { type: 'array', items: { type: 'number' } },
      wrap: { type: 'boolean' },
      offset: { type: 'array', items: { type: 'number' } },
      items: {
        type: 'array',
        items: {
          oneOf: [
            { type: 'null' },
            {
              type: 'object',
              properties: {
                key: { type: 'string' },
                component: { type: 'string' },
                options: { type: 'object' },
                width: { typeof: ['string', 'number'] },
                align: { enum: ['left', 'center', 'right'] },
                verticalAlign: { enum: ['top', 'middle', 'bottom'] },
                dataIndex: {
                  anyOf: [
                    { type: 'array', items: { type: 'string' } },
                    { type: 'string' },
                  ],
                },
              },
              required: ['component'],
            },
          ],
        },
      },
    },
  };

  /**
   * 根据组件类型，生成表格渲染器
   * @param schema Schema
   * @returns 表格
   */
  public renderGenerator(schema: DripTableBuiltInColumnSchema | NonNullable<ExtraOptions['CustomColumnSchema']>) {
    if (schema.component) {
      const BuiltInComponent = DripTableBuiltInComponents[schema.component] as
        React.JSXElementConstructor<DripTableComponentProps<RecordType, DripTableBuiltInColumnSchema>> & { schema?: SchemaObject };
      if (BuiltInComponent) {
        return (
          <BuiltInComponent
            driver={this.props.driver}
            value={this.props.value}
            data={this.props.data}
            schema={schema as unknown as DripTableBuiltInColumnSchema}
            ext={this.props.ext}
            fireEvent={event => this.props.fireEvent?.(event)}
          />
        );
      }
    }
    const [libName, componentName] = schema.component.split('::');
    if (libName && componentName) {
      const ExtraComponent = this.props.extraComponents?.[libName]?.[componentName];
      if (ExtraComponent) {
        return (
          <ExtraComponent
            driver={this.props.driver}
            value={this.props.value}
            data={this.props.data}
            schema={schema as NonNullable<ExtraOptions['CustomColumnSchema']>}
            ext={this.props.ext}
            fireEvent={event => this.props.fireEvent?.(event as DripTableBuiltInComponentEvent)}
          />
        );
      }
    }
    return JSON.stringify(this.props.value);
  }

  public renderCell(row: number, col: number) {
    const schema = this.props.schema;
    const schemaItems = schema.options.items ?? [];
    let index = 0;
    for (let i = 0; i < row; i++) {
      index += schema.options.layout[i];
    }
    index += col;
    const schemaItem = schemaItems[index];
    return schemaItem ? this.renderGenerator(schemaItem) : null;
  }

  public render() {
    const { Row, Col } = this.props.driver.components;
    const schema = this.props.schema;
    const rowLength = schema.options.layout?.length;
    const rows = [...Array.from({ length: rowLength }).keys()];
    return (
      <div>
        {
           rows.map((row, index) => (
             <Row
               key={index}
               style={{
                 marginTop: schema.options.gutter?.[1],
                 marginBottom: schema.options.gutter?.[1],
               }}
               gutter={schema.options.gutter}
               justify={schema.options.horizontalAlign}
               align={schema.options.verticalAlign}
               wrap={schema.options.wrap}
             >
               { schema.options.layout[index]
               && [...Array.from({ length: schema.options.layout[index] || 1 }).keys()]
                 .map(col => <Col key={col}>{ this.renderCell(Number(row), Number(col)) }</Col>) }
             </Row>
           ))
         }
      </div>
    );
  }
}
