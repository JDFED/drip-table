import { SetStateAction, useContext, useReducer } from 'react';

import { Ctx } from './context';
import { DripTableGeneratorProps } from './typing';

// 使用最顶层组件的 props
export const useGlobalData: () => DripTableGeneratorProps = () => useContext(Ctx);

/**
 * 使用状态对象，设置属性时可传入部分
 * @param initState 初始状态
 * @returns [状态对象, 状态转移函数]
 */
export const useState = <T>(initState: T): [T, (action: SetStateAction<Partial<T>>) => void] => useReducer(
  (state: T, action: SetStateAction<Partial<T>>): T => {
    const data = typeof action === 'function'
      ? action(state)
      : action;
    return { ...state, ...data };
  },
  initState,
);
