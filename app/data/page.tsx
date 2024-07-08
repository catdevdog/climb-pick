"use client";

import React, { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useFirebase } from "@/hooks/useFirebase";
import { TypePlace } from "@/types/place";
import { ref, onValue, remove } from "firebase/database";
import { database } from "@/firebase/firebasedb";
import Button from "@/components/Button";
import { formatTimestamp } from "@/utils";

interface ConnectItem {
  timestamp: string;
  timestamp_kr: string;
  visit_count: number;
  coord: string;
}

type DataType = {
  "connect-id": { [key: string]: ConnectItem };
  places: { [key: string]: TypePlace };
};

export default function AdminPage() {
  const { user, loading, error } = useAuth();
  const { saveUser, getPlaces, savePlaces } = useFirebase();
  const [data, setData] = useState<DataType>({ "connect-id": {}, places: {} });
  const [editItem, setEditItem] = useState<any | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedColumns, setSelectedColumns] = useState<any>({});

  useEffect(() => {
    if (user) {
      const dbRef = ref(database);
      const unsubscribe = onValue(dbRef, (snapshot) => {
        const value = snapshot.val();
        setData(value || { "connect-id": {}, places: {} });

        const newSelectedColumns: { [key: string]: boolean } = {};
        ["connect-id", "places"].forEach((type) => {
          const firstItem = Object.values(value?.[type] || {})[0];
          if (firstItem) {
            Object.keys(firstItem).forEach((key) => {
              newSelectedColumns[`${type}-${key}`] = true;
            });
          }
        });
        setSelectedColumns(newSelectedColumns);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = (type: "connect-id" | "places") => {
    const itemsArray = Object.entries(data[type]);
    if (sortConfig !== null) {
      itemsArray.sort((a, b) => {
        if (a[1][sortConfig.key] < b[1][sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[1][sortConfig.key] > b[1][sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return itemsArray;
  };

  const paginatedItems = (items: [string, any][]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const renderPagination = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button
          size="small"
          color="black"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </Button>
        {pageNumbers.map((number) => (
          <span
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-3 py-1 rounded-md ${
              currentPage === number ? "bg-gray-300" : ""
            }`}
          >
            {number}
          </span>
        ))}
        <Button
          size="small"
          color="black"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        >
          Next
        </Button>
      </div>
    );
  };

  const renderTable = (type: "connect-id" | "places") => {
    const items = sortedItems(type);
    const paginatedData = paginatedItems(items);

    const allKeys = Object.keys(Object.values(data[type])[0] || {});
    const visibleKeys = allKeys.filter(
      (key) => selectedColumns[`${type}-${key}`]
    );

    return (
      <div>
        <div className="mb-4 px-4">
          {allKeys.map((key: string) => (
            <label key={key} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={selectedColumns[`${type}-${key}`] || false}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedColumns((prev: any) => ({
                    ...prev,
                    [`${type}-${key}`]: event.target.checked,
                  }))
                }
              />
              <span className="ml-2">{key}</span>
            </label>
          ))}
        </div>
        <table className="w-screen block overflow-auto bg-white">
          <thead>
            <tr>
              {visibleKeys.map((key: string) => (
                <th
                  key={key}
                  className="px-2 py-1 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => requestSort(key)}
                >
                  {key}
                  {sortConfig?.key === key &&
                    (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                </th>
              ))}
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(([id, item]: [string, any]) => (
              <tr key={id} className="border-t">
                {visibleKeys.map((key: string) => (
                  <td key={key} className="px-2 py-1 whitespace-wrap text-sm">
                    {key === "timestamp"
                      ? formatTimestamp(new Date(item[key]))
                      : typeof item[key] === "object"
                      ? JSON.stringify(item[key])
                      : String(item[key])}
                  </td>
                ))}
                <td className="px-2 py-1 whitespace-nowrap">
                  {/* <Button color='primary' size="small" onClick={() => handleEdit(type, id, item)}>
                    Edit
                  </Button>
                  <Button color='danger' size="small" onClick={() => handleDelete(type, id)}>
                    Delete
                  </Button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {renderPagination(items.length)}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Please sign in to access the admin page.</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {(["connect-id", "places"] as const).map((type) => (
        <div key={type} className="mb-8">
          <h2 className="text-xl font-semibold mb-2 capitalize">{type}</h2>
          {renderTable(type)}
        </div>
      ))}

      {/* ... (Edit item modal remains the same) */}
    </div>
  );
}
