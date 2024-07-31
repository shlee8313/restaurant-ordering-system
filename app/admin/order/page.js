"use client";

import React, { useEffect } from "react";
import AdvancedTableLayout from "../../components/AdvancedTableLayout";
import useTableStore from "../../store/useTableStore";

const OrderPage = () => {
  const { tables, setTables, isEditMode, toggleEditMode } = useTableStore();

  useEffect(() => {
    if (tables.length === 0) {
      const initialTables = [
        { id: 1, x: 20, y: 20, width: 100, height: 100, rotation: 0 },
        { id: 2, x: 150, y: 20, width: 100, height: 100, rotation: 0 },
        { id: 3, x: 280, y: 20, width: 100, height: 100, rotation: 0 },
        { id: 4, x: 20, y: 150, width: 100, height: 100, rotation: 0 },
        { id: 5, x: 150, y: 150, width: 100, height: 100, rotation: 0 },
      ];
      setTables(initialTables);
    }
  }, [tables, setTables]);

  const handleSave = (newTables) => {
    setTables(newTables);
    console.log("New table layout saved:", newTables);
    toggleEditMode();
  };

  return (
    <div className="bg-white rounded-lg shadow p-1">
      <AdvancedTableLayout isEditMode={isEditMode} onSave={handleSave} initialTables={tables} />
    </div>
  );
};

export default OrderPage;
