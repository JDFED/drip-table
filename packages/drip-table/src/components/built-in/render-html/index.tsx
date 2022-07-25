/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */

import React from 'react';

import { DripTableColumnSchema, DripTableRecordTypeBase, SchemaObject } from '@/types';
import ErrorBoundary from '@/components/error-boundary';
import RichText from '@/components/rich-text';

import { DripTableComponentProps } from '../component';

export type DTCRenderHTMLColumnSchema = DripTableColumnSchema<'render-html', {
  render: string;
}>;

interface DTCRenderHTMLProps<RecordType extends DripTableRecordTypeBase> extends DripTableComponentProps<RecordType, DTCRenderHTMLColumnSchema> { }

interface DTCRenderHTMLState { }

export default class DTCRenderHTML<RecordType extends DripTableRecordTypeBase> extends React.PureComponent<DTCRenderHTMLProps<RecordType>, DTCRenderHTMLState> {
  public static componentName: DTCRenderHTMLColumnSchema['component'] = 'render-html';
  public static schema: SchemaObject = {
    properties: {
      render: { type: 'string' },
    },
    required: ['render'],
  };

  public render(): JSX.Element {
    const { data, schema: { options } } = this.props;
    const Alert = this.props.driver.components.Alert;
    try {
      const html = new Function('rec', options.render)(data);
      if (typeof html === 'object') {
        return (
          <div>{ Object.prototype.toString.call(html) }</div>
        );
      }
      return <ErrorBoundary driver={this.props.driver}><RichText html={html || ''} /></ErrorBoundary>;
    } catch (error) {
      console.error(error);
    }
    return <Alert type="error" showIcon message="渲染异常" />;
  }
}
