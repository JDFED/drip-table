/**
 * ## DUMI CONFIG ##
 * transform: true
 * inline: true
 */

import 'antd/dist/antd.css';
import 'jsoneditor-react/es/editor.min.css';
import 'drip-table/dist/index.css';

import { CloseCircleTwoTone, CloudSyncOutlined } from '@ant-design/icons';
import { Button, message, Tabs } from 'antd';
import DripTable, { DripTableInstance } from 'drip-table';
import DripTableDriverAntDesign from 'drip-table-driver-antd';
import { JsonEditor } from 'jsoneditor-react';
import React from 'react';

import { initSchema, mockData, SampleRecordType, SubtableDataSourceKey } from '../../demo-data';
import { CustomColumnSchema, CustomComponentEvent, CustomComponents } from './custom-components';

import styles from './sample.module.less';

const Demo = () => {
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState<{ key: string; values: unknown[] }[] | undefined>(void 0);
  const [pageNum, setPageNum] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [dataBase, setDataBase] = React.useState(mockData);
  const [totalNum, setTotalNum] = React.useState(dataBase.length);
  const [dataSource, setDataSource] = React.useState(dataBase);
  const [schema, setSchema] = React.useState(initSchema);
  const [editVisible, setEditVisible] = React.useState(false);
  const [allSelected, setAllSelected] = React.useState(false);
  const dripTable: React.MutableRefObject<DripTableInstance | null> = React.useRef(null);

  React.useEffect(
    () => {
      setDataBase(mockData);
    },
    [mockData],
  );

  React.useEffect(
    () => {
      const filteredDataSource = dataBase.filter(ds => !filters?.length || filters.some(f => f.values?.includes(ds[f.key])));
      setTotalNum(filteredDataSource.length);
      setDataSource(filteredDataSource.slice((pageNum - 1) * pageSize, Math.min(pageNum * pageSize, filteredDataSource.length)));
    },
    [dataBase, filters, pageSize, pageNum],
  );

  const fetchPageData = (nextFilters: Record<string, string[]>, nextPageSize: number, nextPageNum: number) => {
    if (loading) {
      return;
    }
    setTimeout(
      () => {
        setLoading(false);
        setFilters(Object.entries(nextFilters).map(([key, values]) => ({ key, values })));
        setPageSize(nextPageSize);
        setPageNum(nextPageNum);
      },
      500,
    );
    setLoading(true);
  };

  function selectAllRecord() {
    const tableInstance = dripTable.current;
    const allKeys = dataSource.map((rec, idx) => idx);
    if (tableInstance) {
      const selectedKeys = tableInstance.selectedRowKeys;
      if (selectedKeys.length < allKeys.length) {
        tableInstance.select(allKeys);
        setAllSelected(true);
      } else {
        tableInstance.select([]);
        setAllSelected(false);
      }
    }
  }

  return (
    <React.Fragment>
      <div style={{ padding: '0 0 30px', textAlign: 'left' }}>
        <Button style={{ marginRight: '5px' }} type="primary" onClick={() => { setEditVisible(!editVisible); }}>编辑</Button>
        <Button style={{ marginRight: '5px' }} type="primary" onClick={selectAllRecord}>
          { allSelected && '取消' }
          全选
        </Button>
      </div>
      <DripTable<SampleRecordType, {
        CustomColumnSchema: CustomColumnSchema;
        CustomComponentEvent: CustomComponentEvent;
        SubtableDataSourceKey: SubtableDataSourceKey;
      }>
        ref={dripTable}
        driver={DripTableDriverAntDesign}
        schema={schema}
        loading={loading}
        total={totalNum}
        dataSource={dataSource}
        components={React.useMemo(() => ({ custom: CustomComponents }), [])}
        slots={React.useMemo(() => ({
          'header-slot-sample': React.memo((props) => {
            const [state, setState] = React.useState({ count: 0 });
            return (
              <div className={props.className} style={{ border: '1px solid #1890ff', borderRadius: '3px' }}>
                <Button type="primary" onClick={() => setState(st => ({ count: st.count + 1 }))}>Header Slot Sample</Button>
                <span style={{ padding: '0 8px', color: '#1890ff' }}>{ `Count: ${state.count}` }</span>
              </div>
            );
          }),
          default: props => <div>{ `未知插槽类型：${props.slotType}` }</div>,
        }), [])}
        subtableTitle={React.useMemo(() => (record, index, tableInfo) => (
          <div style={{ textAlign: 'center' }}>{ `“表格(id:${tableInfo.parent.schema.id})”行“${tableInfo.parent.record.name}”的子表 （${tableInfo.dataSource.length} 条）` }</div>
        ), [])}
        subtableFooter={React.useMemo(() => (record, index, tableInfo) => (
          tableInfo.schema.id === 'sample-table-sub-level-1'
            ? (
              <div
                style={{ cursor: 'pointer', textAlign: 'center', userSelect: 'none' }}
                onClick={() => {
                  message.info(`加载更多“表格(id:${tableInfo.parent.schema.id})”行“${record.name}”(${index})的子表数据，已有 ${tableInfo.dataSource.length} 条`);
                  console.log('expandable-footer-click', record, index, tableInfo);
                }}
              >
                <CloudSyncOutlined />
                <span style={{ marginLeft: '5px' }}>加载更多</span>
              </div>
            )
            : void 0
        ), [])}
        rowExpandable={React.useMemo(() => (record, parent) => parent.schema.id === 'sample-table' && record.id === 5, [])}
        expandedRowRender={React.useMemo(() => (record, index, parent) => (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>{ `“表格(id:${parent.schema.id})”行“${record.name}”的展开自定义渲染` }</div>
        ), [])}
        onEvent={React.useMemo(() => (event, record, index) => {
          if (event.type === 'drip-link-click') {
            const name = event.payload;
            message.info(`你点击了第${index + 1}行“${record.name} (ID: ${record.id})”的“${name}”事件按钮。`);
            console.log(name, record, index);
          } else if (event.type === 'custom') {
            message.info(`自定义事件“${event.name}”触发于行“${record.name} (ID: ${record.id})”的自定义组件。`);
            console.log(event, record, index);
          }
        }, [])}
        onFilterChange={React.useMemo(() => (...args) => { console.log('onFilterChange', ...args); }, [])}
        onPageChange={React.useMemo(() => (...args) => { console.log('onPageChange', ...args); }, [])}
        onChange={React.useMemo(() => ({ pagination: nextPagination, filters: nextFilters }) => {
          console.log('onChange', nextPagination, nextFilters);
          fetchPageData(nextFilters, nextPagination.pageSize ?? pageSize, nextPagination.current ?? pageNum);
        }, [])}
        onDataSourceChange={React.useMemo(() => (ds) => {
          setDataSource(ds);
        }, [])}
        onSelectionChange={React.useMemo(() => (selectedKeys, selectedRows) => {
          setAllSelected(selectedRows.length >= dataSource.length);
        }, [])}
        onSearch={React.useMemo(() => searchParams => console.log(searchParams), [])}
        onInsertButtonClick={React.useMemo(() => event => console.log(event), [])}
      />
      <div className={styles['popup-wrapper']} style={{ height: editVisible ? '70vh' : '0' }} />
      <div className={styles['popup-layer']} style={{ height: editVisible ? '70%' : '0' }}>
        <div style={{ position: 'absolute', right: '10px', top: '8px', zIndex: 1 }}>
          <CloseCircleTwoTone style={{ fontSize: '24px' }} onClick={() => { setEditVisible(!editVisible); }} />
        </div>
        <div className={styles['popup-main']}>
          <Tabs className={styles['popup-tabs']} size="small">
            <Tabs.TabPane key="SCHEMA" tab="SCHEMA" className={styles['json-edit-tab']}>
              <JsonEditor
                value={schema}
                onChange={(d: typeof schema) => {
                  setSchema(d);
                  setPageSize(d.pagination ? d.pagination.pageSize || 0 : 10);
                }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane key="DATA" tab="DATA" className={styles['json-edit-tab']}>
              <JsonEditor
                value={dataBase}
                onChange={(d: typeof dataBase) => { setDataBase(d); }}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Demo;
