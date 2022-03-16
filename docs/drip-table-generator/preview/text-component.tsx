/**
 * This file is part of the drip-table project.
 * @link     : https://ace.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */

import { DripTableComponentProps, DripTableComponentSchema, DripTableRecordTypeBase, indexValue } from 'drip-table';
import React from 'react';

export interface TextSchema extends DripTableComponentSchema {
  /** 字体大小 */
  fontSize?: string;
  /** 兜底文案 */
  noDataValue?: string;
}

interface TextProps<RecordType extends DripTableRecordTypeBase> extends DripTableComponentProps<RecordType, TextSchema> { }

interface TextState {}

export default class TextComponent<RecordType extends DripTableRecordTypeBase> extends React.PureComponent<TextProps<RecordType>, TextState> {
  private get fontSize() {
    let fontSize = String(this.props.schema.fontSize || '').trim();
    if ((/^[0-9]+$/uig).test(fontSize)) {
      fontSize += 'px';
    }
    return fontSize;
  }

  public render(): JSX.Element {
    const { schema, data } = this.props;
    const { dataIndex,
      noDataValue } = schema;
    const value = indexValue(data, dataIndex, '');
    const contentStr = `${value || noDataValue}`;
    return (
      <div style={{ fontSize: this.fontSize, color: '#6d0fff' }}>
        { contentStr }
      </div>
    );
  }
}
