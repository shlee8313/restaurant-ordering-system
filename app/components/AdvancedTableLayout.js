"use client";

import React, { useCallback, useRef } from "react";
import { Rnd } from "react-rnd";

const AdvancedTableLayout = ({
  tables,
  isEditMode,
  onSaveLayout,
  onUpdateTable,
  renderContent,
  onAddTable,
  onRemoveTable,
}) => {
  const containerRef = useRef(null);

  const handleDragStop = useCallback(
    (tableId) => (e, d) => {
      console.log(`Drag stopped for table ${tableId}:`, { x: d.x, y: d.y });
      onUpdateTable(tableId, { x: d.x, y: d.y });
    },
    [onUpdateTable]
  );

  const handleResizeStop = useCallback(
    (id) => (e, direction, ref, delta, position) => {
      onUpdateTable(id, {
        width: ref.offsetWidth,
        height: ref.offsetHeight,
        x: position.x,
        y: position.y,
      });
    },
    [onUpdateTable]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-80px)] bg-gray-100  border border-gray-300 rounded-lg"
    >
      {tables.map((table) => (
        <Rnd
          key={table.tableId}
          size={{ width: table.width, height: table.height }}
          position={{ x: table.x, y: table.y }}
          onDragStop={handleDragStop(table.tableId)}
          onResizeStop={handleResizeStop(table.tableId)}
          bounds="parent"
          disableDragging={!isEditMode}
          enableResizing={isEditMode}
          minWidth={80}
          minHeight={80}
        >
          <div className="w-full h-full bg-gray-200 rounded-lg shadow-lg flex flex-col ">
            <div className="absolute top-2 left-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
              {table.tableId}
            </div>
            {isEditMode && (
              <button
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full"
                onClick={() => onRemoveTable(table.id)}
              >
                X
              </button>
            )}
            <div className="w-full h-full p-2 pt-10 ">{renderContent(table)}</div>
          </div>
        </Rnd>
      ))}
      {isEditMode && (
        <div className="absolute bottom-4 right-4 space-x-2">
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={onAddTable}>
            테이블 추가
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => onSaveLayout(tables)}
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedTableLayout;
