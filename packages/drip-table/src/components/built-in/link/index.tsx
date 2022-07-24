/*
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import React from 'react';

import { DripTableColumnSchema, DripTableRecordTypeBase, SchemaObject } from '@/types';

import { DripTableComponentProps } from '../component';
import { finalizeString } from '../utils';

export type DTCLinkColumnSchema = DripTableColumnSchema<'link', {
  mode?: 'single' | 'multiple';
  name?: string;
  label?: string;
  href?: string;
  event?: string;
  target?: string;
  operates?: {
    name?: string;
    label?: string;
    href?: string;
    event?: string;
    target?: string;
  }[];
}>;

export interface DTCLinkEvent {
  type: 'drip-link-click';
  payload: string;
}

interface DTCLinkProps<RecordType extends DripTableRecordTypeBase> extends DripTableComponentProps<RecordType, DTCLinkColumnSchema> { }

interface DTCLinkState {}

export default class DTCLink<RecordType extends DripTableRecordTypeBase> extends React.PureComponent<DTCLinkProps<RecordType>, DTCLinkState> {
  public static componentName: DTCLinkColumnSchema['component'] = 'link';
  public static schema: SchemaObject = {
    properties: {
      mode: { enum: ['single', 'multiple'] },
      name: { type: 'string' },
      label: { type: 'string' },
      href: { type: 'string' },
      event: { type: 'string' },
      target: { type: 'string' },
      operates: {
        type: 'array',
        items: {
          properties: {
            name: { type: 'string' },
            label: { type: 'string' },
            href: { type: 'string' },
            event: { type: 'string' },
            target: { type: 'string' },
          },
        },
      },
    },
  };

  private get configured() {
    const options = this.props.schema.options;
    if (options.mode === 'multiple') {
      if (options.operates) {
        return true;
      }
      return false;
    }
    if (options.mode === 'single' && (finalizeString('pattern', options.href || '', this.props.data) || options.event)) {
      return true;
    }
    return false;
  }

  public render(): JSX.Element {
    const options = this.props.schema.options;
    const Alert = this.props.driver.components.Alert;
    if (!this.configured) {
      return <Alert type="error" showIcon message="属性配置错误" />;
    }
    if (options.mode === 'single') {
      const event = options.event;
      if (event) {
        return (
          <a
            onClick={() => {
              if (this.props.preview) {
                return;
              }
              this.props.fireEvent({ type: 'drip-link-click', payload: event });
            }}
          >
            { options.label }
          </a>
        );
      }
      return <a href={finalizeString('pattern', options.href || '', this.props.data)} target={options.target}>{ options.label }</a>;
    }
    return (
      <div>
        {
          options.operates?.map((config, index) => {
            const event = config.event;
            if (event) {
              return (
                <a
                  style={{ marginRight: '5px' }}
                  key={config.name || index}
                  onClick={() => {
                    if (this.props.preview) {
                      return;
                    }
                    this.props.fireEvent({ type: 'drip-link-click', payload: event });
                  }}
                >
                  { config.label }
                </a>
              );
            }
            return (
              <a
                style={{ marginRight: '5px' }}
                key={config.name || index}
                href={finalizeString('pattern', config.href || '', this.props.data)}
                target={config.target}
              >
                { config.label }
              </a>
            );
          })
        }
      </div>
    );
  }
}
