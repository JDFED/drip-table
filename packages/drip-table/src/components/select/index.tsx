/*
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import classNames from 'classnames';
import RcSelect, { SelectProps as RcSelectProps } from 'rc-select';
import React from 'react';

import styles from './index.module.less';

export interface SelectProps extends RcSelectProps {
  mini?: boolean;
}

const Select = Object.assign(
  {},
  RcSelect,
  React.memo(({ mini, ...props }: SelectProps) => (
    <RcSelect
      {...props}
      prefixCls="jfe-drip-table-select"
      className={classNames({
        [styles['jfe-drip-table-select-sm']]: mini,
      })}
      listHeight={256}
      listItemHeight={24}
      inputIcon={(
        <span role="img" aria-label="down" className={styles['jfe-drip-table-select-suffix']}>
          <svg viewBox="64 64 896 896" focusable="false" data-icon="down" width="1em" height="1em" fill="currentColor" aria-hidden="true">
            <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z" />
          </svg>
        </span>
      )}
      menuItemSelectedIcon={null}
    />
  )),
);

export default Select;
