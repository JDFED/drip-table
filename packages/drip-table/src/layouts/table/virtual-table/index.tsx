import ResizeObserver from 'rc-resize-observer';
import React, { useEffect, useRef, useState } from 'react';
import { VariableSizeGrid } from 'react-window';

import { DripTableDriver, DripTableRecordTypeBase } from '@/types';
import { DripTableDriverTableProps } from '@/types/driver/table';
import { indexValue } from '@/utils/operator';

import styles from './index.module.css';

// 根据size来控制行高
const rowHeightMap = {
  small: 49,
  middle: 54,
  large: 88,
};

function VirtualTable<RecordType extends DripTableRecordTypeBase>(props: { driver: DripTableDriver } & DripTableDriverTableProps<RecordType>) {
  const { columns = [], scroll, size, driver } = props;
  const Table = driver.components.Table;
  const [tableWidth, setTableWidth] = useState(0);

  const rowHeight = rowHeightMap[size || 'middle'] || rowHeightMap.middle;

  // 减去已经设定的宽度，剩下的宽度均分
  const initWidthColumn = columns.filter(c => c.width && c.width !== 'undefined');
  const widthColumnCount = columns.length - initWidthColumn.length;
  const initWidth = initWidthColumn.reduce((summary, c) => summary + ((typeof c.width === 'string' ? Number.parseFloat(c.width) : c.width) || 0), 0);
  const restWidth = tableWidth - initWidth;
  // 如果当设定宽度大于table宽度，则默认剩余平均宽度为100
  const restWidthAvg = restWidth > 0 ? Math.floor(restWidth / widthColumnCount) : 100;
  const mergedColumns = columns.map((column) => {
    if (column.width && column.width !== 'undefined') {
      if (typeof column.width === 'string') {
        column.width = Number(column.width.replace('px', ''));
      }
      return column;
    }

    return {
      ...column,
      width: restWidthAvg,
    };
  });

  const fixedColumns = mergedColumns.filter(c => c.fixed);
  const fixedColumnsWidth = fixedColumns.reduce((summary, c) => summary + ((typeof c.width === 'string' ? Number.parseFloat(c.width) : c.width) || 0), 0);

  const gridRef = useRef<VariableSizeGrid>(null);
  const fixedGridRef = useRef<VariableSizeGrid>(null);

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      rowIndex: 0,
      shouldForceUpdate: true,
    });
  };

  useEffect(() => resetVirtualGrid, [tableWidth]);

  const renderVirtualList: NonNullable<typeof props['components']>['body'] = (rawData, { scrollbarSize, ref, onScroll }) => {
    const totalHeight = rawData.length * rowHeight;

    const renderCell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
      const columnItem = mergedColumns[columnIndex];
      const dataItem = rawData[rowIndex];
      const value = columnItem.dataIndex ? indexValue(dataItem, columnItem.dataIndex) : dataItem;
      return (
        <div className={styles['virtual-table-cell']} style={style}>
          {
            columnItem.render
              ? columnItem.render(value, dataItem, rowIndex)
              : String(value)
          }
        </div>
      );
    };

    const scrollY = (typeof scroll?.y === 'string' ? Number.parseFloat(scroll?.y) : scroll?.y) || 0;
    // 暂时用盖住的方式来展示，背景色也强制白色，层级999应该暂时满足了
    return (
      <div style={{ position: 'relative' }}>
        {
          fixedColumns.length > 0
            ? (
              <VariableSizeGrid
                ref={fixedGridRef}
                style={{ overflowY: 'hidden', position: 'absolute', top: 0, left: 0, zIndex: 999, width: fixedColumnsWidth, background: '#fff' }}
                className="virtual-grid"
                columnCount={fixedColumns.length}
                columnWidth={(index: number) => {
                  const width = Number.parseFloat(String(fixedColumns[index].width)) || 0;
                  return totalHeight > scrollY && index === fixedColumns.length - 1
                    ? width - scrollbarSize - 1
                    : width;
                }}
                height={scrollY}
                rowCount={rawData.length}
                rowHeight={() => rowHeight}
                width={fixedColumnsWidth}
              >
                { renderCell }
              </VariableSizeGrid>
            )
            : null
        }
        <VariableSizeGrid
          ref={gridRef}
          className="virtual-grid"
          columnCount={mergedColumns.length}
          columnWidth={(index: number) => {
            const { width } = mergedColumns[index];
            return totalHeight > scrollY && index === mergedColumns.length - 1
              ? (width as number) - scrollbarSize - 1
              : (width as number);
          }}
          height={scrollY}
          rowCount={rawData.length}
          rowHeight={() => rowHeight}
          width={tableWidth}
          onScroll={({ scrollLeft, scrollTop, scrollUpdateWasRequested }: { scrollLeft: number; scrollTop: number; scrollUpdateWasRequested: boolean }) => {
            onScroll({ scrollLeft });
            if (!scrollUpdateWasRequested) {
              fixedGridRef.current?.scrollTo({ scrollLeft: 0, scrollTop });
            }
          }}
        >
          { renderCell }
        </VariableSizeGrid>
      </div>
    );
  };

  return (
    <ResizeObserver
      onResize={({ width }) => {
        setTableWidth(width);
      }}
    >
      <Table
        {...props}
        columns={mergedColumns}
        components={{
          body: renderVirtualList,
        }}
      />
    </ResizeObserver>
  );
}

export default VirtualTable;
