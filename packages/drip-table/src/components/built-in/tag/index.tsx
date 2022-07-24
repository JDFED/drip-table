/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : helloqian12138 (johnhello12138@163.com)
 * @modifier : helloqian12138 (johnhello12138@163.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */

import React from 'react';

import { DripTableColumnSchema, DripTableRecordTypeBase, SchemaObject } from '@/types';
import { indexValue } from '@/utils/operator';

import { DripTableComponentProps } from '../component';

export type DTCTagColumnSchema = DripTableColumnSchema<'tag', {
  /** 字体颜色 */
  color?: string | 'success' | 'processing' | 'error' | 'default' | 'warning';
  /** 边框颜色 */
  borderColor?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** 圆角半径 */
  radius?: number;
  /** 前缀 */
  prefix?: string;
  /** 后缀 */
  suffix?: string;
  /** 静态文案 */
  content?: string;
  /** 枚举 */
  tagOptions?: { label: string; value: string | number; color?: 'success' | 'processing' | 'error' | 'default' | 'warning' }[];
}>;

interface DTCTagProps<RecordType extends DripTableRecordTypeBase> extends DripTableComponentProps<RecordType, DTCTagColumnSchema> { }

interface DTCTagState { }

export default class DTCTag<RecordType extends DripTableRecordTypeBase> extends React.PureComponent<DTCTagProps<RecordType>, DTCTagState> {
  public static componentName: DTCTagColumnSchema['component'] = 'tag';
  public static schema: SchemaObject = {
    properties: {
      color: { type: 'string' },
      borderColor: { type: 'string' },
      backgroundColor: { type: 'string' },
      radius: { type: 'number' },
      prefix: { type: 'string' },
      suffix: { type: 'string' },
      content: { type: 'string' },
      /** 枚举 */
      tagOptions: {
        type: 'array',
        items: {
          properties: {
            label: { type: 'string' },
            value: { typeof: ['string', 'number'] },
            color: { enum: ['success', 'processing', 'error', 'default', 'warning'] },
          },
          required: ['label', 'value'],
        },
      },
    },
  };

  private get value() {
    const schema = this.props.schema;
    const dataIndex = schema.dataIndex;
    return indexValue(this.props.data, dataIndex, '');
  }

  public render() {
    const Tag = this.props.driver.components.Tag;
    const options = this.props.schema.options;
    const value = this.value;
    const tagOption = options.tagOptions?.find(item => item.value === value);
    return (
      <div>
        { options.prefix || '' }
        <Tag
          color={tagOption ? tagOption.color : options.color}
          style={{
            color: options.color,
            borderColor: options.borderColor,
            backgroundColor: options.backgroundColor,
            borderRadius: options.radius,
          }}
        >
          { options.content || tagOption?.label || value }
        </Tag>
        { options.suffix || '' }
      </div>
    );
  }
}
