/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import { DripTableColumnSchema, DripTableDriver, DripTableRecordTypeBase, EventLike } from '@/types';

import { DripTableBuiltInComponentEvent } from '.';

export interface DripTableComponentProps<
  RecordType extends DripTableRecordTypeBase,
  ColumnSchema extends DripTableColumnSchema,
  ComponentEvent extends EventLike = never,
  ComponentExtraData = unknown,
> {
  /**
   * 底层渲染驱动
   */
  driver: DripTableDriver;
  /**
   * 当前渲染列参数
   */
  schema: ColumnSchema;
  /**
   * 当前渲染行数据结构（`list[i]`）
   */
  data: RecordType;
  /**
   * 当前渲染单元格数据（`data[schema.dataIndex]`）
   */
  value: unknown;
  /**
   * 是否可通过点击进入编辑模式
   */
  editable?: boolean;
  /**
   * 单元格数据改变事件（例如编辑模式）
   */
  onChange?: (value: unknown) => void;
  /**
   * 最外层额外透传的数据
   */
  ext?: ComponentExtraData;
  /**
   * 是否处于预览模式（不响应事件）
   */
  preview?: boolean | {
    /**
     * 自定义列渲染函数
     */
    columnRenderer?: (columnSchema: ColumnSchema, columnElement: JSX.Element) => JSX.Element;
  };
  onClick?: (name: string) => void;
  /**
   * 自定义事件触发器
   */
  fireEvent: (event: ComponentEvent | DripTableBuiltInComponentEvent) => void;
}
