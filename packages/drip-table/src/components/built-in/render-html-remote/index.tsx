/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */

import React from 'react';

import { DripTableColumnSchema, DripTableRecordTypeBase, SchemaObject } from '@/types';
import RichText from '@/components/rich-text';

import { DripTableComponentProps } from '../component';

const CACHE_RENDERER = new Map<string, Promise<string>>();

export type DTCRenderHTMLRemoteColumnSchema = DripTableColumnSchema<'render-html-remote', {
  url: string;
}>;

interface DTCRenderHTMLRemoteProps<RecordType extends DripTableRecordTypeBase> extends DripTableComponentProps<RecordType, DTCRenderHTMLRemoteColumnSchema> { }

interface DTCRenderHTMLRemoteState {
  render: string;
}

export default class DTCRenderHTMLRemote<RecordType extends DripTableRecordTypeBase> extends React.PureComponent<DTCRenderHTMLRemoteProps<RecordType>, DTCRenderHTMLRemoteState> {
  public static componentName: DTCRenderHTMLRemoteColumnSchema['component'] = 'render-html-remote';
  public static schema: SchemaObject = {
    properties: {
      url: { type: 'string' },
    },
    required: ['url'],
  };

  public state = {
    render: '',
  };

  private async fetch() {
    const url = this.props.schema.options.url;
    if (!CACHE_RENDERER.has(url)) {
      CACHE_RENDERER.set(url, new Promise((resolve, reject) => {
        fetch(url)
          .then(res => res.text())
          .then((res) => {
            resolve(res);
            return res;
          })
          .catch((error: unknown) => {
            CACHE_RENDERER.delete(url);
            throw error;
          });
      }));
    }
    const promise = CACHE_RENDERER.get(url);
    if (promise) {
      const render = await promise;
      if (this.props.schema.options.url === url) {
        this.setState({ render });
      }
    }
  }

  public componentDidMount() {
    this.fetch();
  }

  public componentDidUpdate(prevProps: DTCRenderHTMLRemoteProps<RecordType>) {
    if (this.props.schema.options.url !== prevProps.schema.options.url) {
      this.fetch();
    }
  }

  public render(): JSX.Element {
    const { Alert, Spin } = this.props.driver.components;
    if (!this.state.render) {
      return <Spin tip="Loading" />;
    }
    try {
      const html = new Function('rec', this.state.render)(this.props.data);
      if (typeof html === 'object') {
        return (
          <div>{ Object.prototype.toString.call(html) }</div>
        );
      }
      return <RichText html={html || ''} />;
    } catch (error) {
      console.error(error);
    }
    return <Alert message="渲染异常" showIcon type="error" />;
  }
}
