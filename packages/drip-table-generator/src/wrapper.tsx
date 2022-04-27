import classnames from 'classnames';
import { DripTableExtraOptions, DripTableRecordTypeBase, DripTableSchema } from 'drip-table';
import DripTableDriverAntDesign from 'drip-table-driver-antd';
import React, { useImperativeHandle, useState } from 'react';

import { useGlobalData } from './hooks';
import AttributeLayout from './layout/attribute-layout';
import ComponentLayout from './layout/component-layout';
import EditableTable from './layout/editable-table';
import PreviewTable from './layout/preview-table';
import ToolLayout from './layout/tool-layout';
import { defaultState, DripTableColumn, DripTableGeneratorState, GlobalStore, setState } from './store';
import { DripTableGeneratorProps } from './typing';
import { filterAttributes } from './utils';

import styles from './index.module.less';

export type GeneratorWrapperHandler = {
  getState: () => DripTableGeneratorState;
}

const Wrapper = <
RecordType extends DripTableRecordTypeBase = DripTableRecordTypeBase,
ExtraOptions extends DripTableExtraOptions = DripTableExtraOptions,
>(props: DripTableGeneratorProps<RecordType, ExtraOptions> & {
    store: GlobalStore;
  }, ref: React.ForwardedRef<GeneratorWrapperHandler>) => {
  const {
    style = {},
    driver,
    showComponentLayout = true,
    componentLayoutStyle = {},
    rightLayoutStyle = {},
    showToolLayout = true,
    dataSource = [],
    schema,
    customComponentPanel,
    customGlobalConfigPanel,
    customComponents,
  } = useGlobalData();
  const initialData = { previewDataSource: dataSource } as DripTableGeneratorState;
  if (schema) {
    initialData.globalConfigs = filterAttributes(schema, 'columns') as Omit<DripTableSchema<DripTableColumn>, 'columns'>;
    initialData.columns = schema.columns?.map((item, index) => ({ index, sort: index, ...item }));
  }
  const originState: DripTableGeneratorState = props.store ? props.store[0] : defaultState();
  setState(originState, { ...initialData });
  const store = useState(originState);
  const [state] = store;

  useImperativeHandle(ref, () => ({
    getState: () => state,
  }));

  let leftLayoutWidth = '280px';
  if (typeof componentLayoutStyle.width === 'number') {
    leftLayoutWidth = `${componentLayoutStyle.width}px`;
  } else if (typeof componentLayoutStyle.width === 'string') {
    leftLayoutWidth = componentLayoutStyle.width;
  }

  return (
    <div className={styles.wrapper} style={style}>
      { showComponentLayout && (
        <ComponentLayout store={store} width={componentLayoutStyle.width} customComponentPanel={customComponentPanel} />
      ) }
      <div
        className={classnames(styles['layout-right-wrapper'], { [styles.preview]: !state.isEdit })}
        style={showComponentLayout ? { width: `calc(100% - ${leftLayoutWidth})`, ...rightLayoutStyle } : { width: '100%' }}
      >
        <div className={styles['layout-right-title']}>
          <span style={{ margin: '0 12px', fontWeight: 'bold' }}>可视区</span>
          { showToolLayout && <ToolLayout store={store} /> }
        </div>
        <div className={styles['layout-right-workstation']}>
          { state.isEdit
            ? <EditableTable driver={driver || DripTableDriverAntDesign} customComponents={customComponents} store={store} />
            : <PreviewTable driver={driver || DripTableDriverAntDesign} customComponents={customComponents} store={store} /> }
          <AttributeLayout
            customComponentPanel={customComponentPanel}
            customGlobalConfigPanel={customGlobalConfigPanel}
            driver={driver || DripTableDriverAntDesign}
            store={store}
          />
        </div>
      </div>
    </div>
  );
};

export default Wrapper;
