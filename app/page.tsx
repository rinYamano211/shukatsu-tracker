"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

type Company = {
  id: string;
  name: string;
  status: string;
};

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("todo");

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, "companies"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Company, "id">),
    }));
    setCompanies(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await addDoc(collection(db, "companies"), {
      name,
      status,
      createdAt: new Date(),
    });

    setName("");
    setStatus("todo");
    await fetchData();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-200 text-gray-700";
      case "applied":
        return "bg-yellow-200 text-yellow-800";
      case "interview":
        return "bg-blue-200 text-blue-800";
      case "offer":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    await deleteDoc(doc(db, "companies", id));
    await fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">
          ShukatsuTracker
        </h1>

        {/* フォーム */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">企業追加</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="w-full border p-2 rounded"
              type="text"
              placeholder="企業名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select
              className="w-full border p-2 rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">未応募</option>
              <option value="applied">応募済</option>
              <option value="interview">面接中</option>
              <option value="offer">内定</option>
            </select>

            <button
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              type="submit"
            >
              追加
            </button>
          </form>
        </div>

        {/* 一覧 */}
        <div className="space-y-3">
          {companies.length === 0 ? (
            <p className="text-center text-gray-500">
              データがありません
            </p>
          ) : (
            companies.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <span
                    className={`text-sm px-2 py-1 rounded ${statusColor(c.status)}`}
                  >
                    {c.status}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}