/*
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import classNames from 'classnames';
import RcPagination, { PaginationProps as RcPaginationProps } from 'rc-pagination';
import React from 'react';

import Select from '../select';
import MiniSelect from './mini-select';

import styles from './index.module.less';

const Pagination = React.memo((props: RcPaginationProps & { align?: 'left' | 'center' | 'right'; size?: 'small' | 'default' }) => (
  <RcPagination
    {...props}
    prefixCls="jfe-drip-table-pagination"
    className={classNames({
      [styles['jfe-drip-table-pagination--mini']]: props.size === 'small',
      [styles['jfe-drip-table-pagination--left']]: props.align === 'left',
      [styles['jfe-drip-table-pagination--center']]: props.align === 'center',
      [styles['jfe-drip-table-pagination--right']]: props.align === void 0 || props.align === 'right',
    })}
    prevIcon={(
      <button className={styles['jfe-drip-table-pagination-item-link']} type="button" tabIndex={-1}>
        <span role="img" aria-label="left" className={styles['jfe-drip-table-pagination-jump-prev__icon']}>
          <svg viewBox="64 64 896 896" focusable="false" data-icon="left" width="1em" height="1em" fill="currentColor" aria-hidden="true">
            <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z" />
          </svg>
        </span>
      </button>
    )}
    nextIcon={(
      <button className={styles['jfe-drip-table-pagination-item-link']} type="button" tabIndex={-1}>
        <span role="img" aria-label="right" className={styles['jfe-drip-table-pagination-jump-next__icon']}>
          <svg viewBox="64 64 896 896" focusable="false" data-icon="right" width="1em" height="1em" fill="currentColor" aria-hidden="true">
            <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z" />
          </svg>
        </span>
      </button>
    )}
    selectPrefixCls="jfe-drip-table-select"
    selectComponentClass={props.size === 'small' ? MiniSelect : Select}
  />
));

export default Pagination;
