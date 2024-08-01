"use client";

import React, { useCallback, useRef } from "react";
import { Rnd } from "react-rnd";

const AdvancedTableLayout = ({
  tables,
  isEditMode,
  onSaveLayout,
  onUpdateTable,
  renderContent,
}) => {
  const containerRef = useRef(null);

  const getAbsolutePosition = useCallback((x, y) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      return {
        x: x,
        y: y,
      };
    }
    return { x, y };
  }, []);

  const handleDragStop = useCallback(
    (id) => (e, d) => {
      const { x, y } = getAbsolutePosition(d.x, d.y);
      onUpdateTable(id, { x, y });
    },
    [getAbsolutePosition, onUpdateTable]
  );

  const handleResizeStop = useCallback(
    (id) => (e, direction, ref, delta, position) => {
      const { x, y } = getAbsolutePosition(position.x, position.y);
      onUpdateTable(id, {
        width: parseInt(ref.style.width),
        height: parseInt(ref.style.height),
        x,
        y,
      });
    },
    [getAbsolutePosition, onUpdateTable]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-200px)] bg-gray-100 overflow-hidden border border-gray-300 rounded-lg"
    >
      {tables.map((table) => (
        <Rnd
          key={table.id}
          size={{ width: table.width, height: table.height }}
          position={{ x: table.x, y: table.y }}
          onDragStop={handleDragStop(table.id)}
          onResizeStop={handleResizeStop(table.id)}
          bounds="parent"
          disableDragging={!isEditMode}
          enableResizing={isEditMode}
        >
          <div className="w-full h-full bg-gray-200 rounded-lg shadow-lg flex items-center justify-center cursor-move">
            <div className="absolute top-2 left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {table.tableId}
            </div>
            <div className="w-full h-full p-2 pt-10">{renderContent(table)}</div>
          </div>
        </Rnd>
      ))}
      {isEditMode && (
        <div className="absolute bottom-4 right-4 space-x-2">
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
