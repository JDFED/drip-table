/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */

import classnames from 'classnames';
import React from 'react';

import { DripTableColumnSchema, DripTableRecordTypeBase, SchemaObject } from '@/types';
import { indexValue, stringify } from '@/drip-table/utils';

import { DripTableComponentProps } from '../component';

import styles from './index.module.less';

export type DTCTextColumnSchema = DripTableColumnSchema<'text', {
  /**
   * 字体大小
   */
  fontSize?: string;
  /**
   * 展示模式：
   * {'single'}   单行文本；
   * {'multiple'} 多行文本；
   * {'custom'}   自定义文本；
   */
  mode?: 'single' | 'multiple' | 'custom';
  /**
   * 自定义格式化字符串
   */
  format?: string;
  /**
   * 内容展示翻译文案
   */
  i18n?: Record<string, string>;
  /**
   * 兜底文案
   */
  defaultValue?: string;
  /**
   * 前缀文案
   */
  prefix?: string;
  /**
   * 后缀文案
   */
  suffix?: string;
  /**
   * 多行文本段落配置
   */
  parts?: {
    dataIndex: string | string[];
    /**
     * 内容展示翻译文案
     */
    i18n?: Record<string, string>;
    /**
     * 前缀文案
     */
    prefix?: string;
    /**
     * 后缀文案
     */
    suffix?: string;
  }[];
  /**
   * 最大行数
   */
  maxRow?: number;
  /**
   *  行高
   */
  lineHeight?: number;
  /**
   * 超出部分显示省略号
   */
  ellipsis?: boolean;
}>;

interface DTCTextProps<RecordType extends DripTableRecordTypeBase> extends DripTableComponentProps<RecordType, DTCTextColumnSchema> { }

interface DTCTextState {}

const translate = (i18n: Record<string, string> | undefined, origin: string) => {
  if (typeof origin === 'string' && i18n && origin in i18n) {
    return i18n[origin];
  }
  return origin;
};

export default class DTCText<RecordType extends DripTableRecordTypeBase> extends React.PureComponent<DTCTextProps<RecordType>, DTCTextState> {
  public static componentName: DTCTextColumnSchema['component'] = 'text';
  public static schema: SchemaObject = {
    properties: {
      fontSize: { type: 'string' },
      mode: { enum: ['single', 'multiple', 'custom'] },
      format: { type: 'string' },
      i18n: {},
      defaultValue: { type: 'string' },
      prefix: { type: 'string' },
      suffix: { type: 'string' },
      parts: {
        type: 'array',
        items: {
          properties: {
            dataIndex: {
              anyOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } },
              ],
            },
            i18n: {},
            prefix: { type: 'string' },
            suffix: { type: 'string' },
          },
        },
      },
      maxRow: { type: 'number' },
      lineHeight: { type: 'number' },
      ellipsis: { type: 'boolean' },
    },
  };

  private get configured() {
    const schema = this.props.schema;
    const options = schema.options;
    if (options.mode === 'custom') {
      if (options.format) {
        return true;
      }
      return false;
    }
    if (options.mode === 'multiple') {
      if (options.parts) {
        return options.parts.length > 0;
      }
      return false;
    }
    if (options.mode === 'single') {
      if (typeof schema.dataIndex === 'object') {
        return Object.keys(schema.dataIndex).length > 0;
      }
      return !!schema.dataIndex;
    }
    return false;
  }

  private get fontSize() {
    let fontSize = String(this.props.schema.options.fontSize || '').trim();
    if ((/^[0-9]+$/uig).test(fontSize)) {
      fontSize += 'px';
    }
    return fontSize;
  }

  private get lineHeight() {
    return this.props.schema.options.lineHeight || 1.5;
  }

  private get wrapperClassName(): string | null {
    const maxRow = this.props.schema.options.maxRow;
    const classNames: string[] = [];
    if (this.props.schema.options.ellipsis) {
      classNames.push(styles['text-ellipsis']);
    }
    if (maxRow) {
      classNames.push(styles['max-row']);
    }
    return classnames(classNames);
  }

  private get rawTextStyles(): React.CSSProperties {
    const lineHeight = this.lineHeight;
    const textStyles: React.CSSProperties = {
      fontSize: this.fontSize,
      lineHeight,
    };
    return textStyles;
  }

  private get wrapperStyles(): React.CSSProperties {
    const rawTextStyles = this.rawTextStyles;
    const maxRow = this.props.schema.options.maxRow;
    const lineHeight = this.lineHeight;
    const wrapperStyles: React.CSSProperties = Object.assign({}, rawTextStyles);
    if (maxRow) {
      wrapperStyles.WebkitLineClamp = maxRow;
      wrapperStyles.maxHeight = `${maxRow * lineHeight}em`;
    }
    return wrapperStyles;
  }

  private get rawText(): string[] {
    const { schema, data } = this.props;
    const { dataIndex, options } = schema;
    const { mode, format, prefix, suffix, parts: params } = options;
    const defaultValue = 'defaultValue' in options ? options.defaultValue : String(schema.defaultValue ?? '');
    if (mode === 'custom') {
      return (format || '')
        .replace(/\{\{(.+?)\}\}/guis, (s, s1) => {
          try {
            return stringify(new Function('rec', `return ${s1}`)(data));
          } catch (error) {
            return error instanceof Error
              ? `{{Render Error: ${error.message}}}`
              : '{{Unknown Render Error}}';
          }
        })
        .split('\n');
    }
    if (mode === 'single') {
      return `${prefix ?? ''}${translate(schema.options.i18n, indexValue(data, dataIndex, defaultValue)) ?? ''}${suffix ?? ''}`.split('\n');
    }
    if (mode === 'multiple') {
      return (params || [])
        .map((config, i) => `${config.prefix || ''}${translate(config.i18n, indexValue(data, config.dataIndex, defaultValue)) ?? ''}${config.suffix || ''}`)
        .join('\n')
        .split('\n');
    }
    return [];
  }

  public render(): JSX.Element {
    const Tooltip = this.props.driver.components.Tooltip;
    const Alert = this.props.driver.components.Alert;
    const wrapperClassName = this.wrapperClassName;
    const wrapperStyles = this.wrapperStyles;
    if (!this.configured) {
      return <Alert message="未配置字段" showIcon type="error" />;
    }
    const rawTextEl: JSX.Element | JSX.Element[] = this.rawText.map((s, i) => <div key={i}>{ stringify(s) }</div>);
    const wrapperEl = <div className={classnames(wrapperClassName, styles['word-break'])} style={wrapperStyles}>{ rawTextEl }</div>;
    if (this.props.schema.options.maxRow) {
      return (
        <Tooltip title={<div className={styles['word-break']} style={this.rawTextStyles}>{ rawTextEl }</div>}>
          { wrapperEl }
        </Tooltip>
      );
    }
    return wrapperEl;
  }
}
