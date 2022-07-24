/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import get from 'lodash/get';

import { DripTableRecordTypeBase } from '@/types';

/**
 * 格式化变量用于提供给渲染函数
 * @param v 任意数据
 * @returns 渲染字符串
 */
export const stringify = (v: unknown) => {
  if (typeof v === 'object' && v !== null) {
    try {
      v = JSON.stringify(v);
    } catch {}
  }
  if (v === void 0) {
    return '';
  }
  return String(v);
};

/**
 * 格式化模板字符串，填充变量值
 * @param mode 格式化模式
 * @param text 模板字符串
 * @param rec 填充数据源对象
 * @returns 最终字符串
 */
export const finalizeString = (mode: 'plain' | 'key' | 'pattern' | 'script', text: string, rec: DripTableRecordTypeBase) => {
  let value = '';
  if (!mode || mode === 'plain') {
    value = stringify(text);
  } else if (mode === 'key') {
    value = stringify(get(rec, text, ''));
  } else if (mode === 'pattern') {
    value = stringify(text)
      .replace(/\{\{(.+?)\}\}/guis, (s, s1) => {
        try {
          return stringify(new Function('rec', `return ${s1}`)(rec));
        } catch (error) {
          return error instanceof Error
            ? `{{Render Error: ${error.message}}}`
            : '{{Unknown Render Error}}';
        }
      });
  } else if (mode === 'script') {
    try {
      value = stringify(new Function('rec', text)(rec));
    } catch (error) {
      value = error instanceof Error
        ? `Render Error: ${error.message}`
        : 'Unknown Render Error';
    }
  }
  return value;
};
