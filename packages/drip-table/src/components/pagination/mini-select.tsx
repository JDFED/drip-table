/*
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : Emil Zhai (root@derzh.com)
 * @modifier : Emil Zhai (root@derzh.com)
 * @copyright: Copyright (c) 2021 JD Network Technology Co., Ltd.
 */

import React from 'react';

import Select from '../select';

const MiniSelect = Object.assign(
  {},
  Select,
  React.memo((props: React.ComponentProps<typeof Select>) => (<Select {...props} mini />)),
);

export default MiniSelect;
