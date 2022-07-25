/*
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import './index.module.less';

import RcCheckbox, { Props as RcCheckboxProps } from 'rc-checkbox';
import React from 'react';

export interface SelectProps extends RcCheckboxProps {}

const Checkbox = React.memo(({ ...props }: SelectProps) => (
  <RcCheckbox
    {...props}
    prefixCls="jfe-drip-table-checkbox"
  />
));

export default Checkbox;
