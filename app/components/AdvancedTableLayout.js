"use client";
import React from "react";
import { Rnd } from "react-rnd";
import useTableStore from "../store/useTableStore";

const AdvancedTableLayout = ({ onSave }) => {
  const { isEditMode, tables, updateTable, addTable, removeTable } = useTableStore();

  const handleTableChange = (id, newProps) => {
    updateTable(id, newProps);
  };

  const handleAddTable = () => {
    const newId = Math.max(...tables.map((t) => t.id), 0) + 1;
    addTable({ id: newId, x: 0, y: 0, width: 100, height: 100, rotation: 0 });
  };

  const handleSave = () => {
    onSave(tables);
  };

  return (
    <div className="relative w-full h-[calc(100vh-200px)] bg-gray-100 overflow-hidden border border-gray-300 rounded-lg">
      {tables.map((table) => (
        <Rnd
          key={table.id}
          size={{ width: table.width, height: table.height }}
          position={{ x: table.x, y: table.y }}
          onDragStop={(e, d) => handleTableChange(table.id, { x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => {
            handleTableChange(table.id, {
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              ...position,
            });
          }}
          style={{ transform: `rotate(${table.rotation}deg)` }}
          disableDragging={!isEditMode}
          enableResizing={isEditMode}
        >
          <div className="w-full h-full bg-blue-500 rounded-lg shadow-lg flex items-center justify-center cursor-move">
            <span className="text-white font-bold">테이블 {table.id}</span>
            {isEditMode && (
              <>
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  onClick={() => removeTable(table.id)}
                >
                  X
                </button>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={table.rotation}
                  onChange={(e) =>
                    handleTableChange(table.id, { rotation: parseInt(e.target.value) })
                  }
                  className="absolute bottom-0 left-0 w-full"
                />
              </>
            )}
          </div>
        </Rnd>
      ))}
      {isEditMode && (
        <div className="absolute bottom-4 right-4 space-x-2">
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleAddTable}>
            테이블 추가
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>
            저장
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedTableLayout;
