"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";

type Company = {
  id: string;
  name: string;
  status: string;
  url?: string;
  memo?: string;
};

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("todo");
  const [url, setUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

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

    if (editingId) {
      // 更新
      await updateDoc(doc(db, "companies", editingId), {
        name,
        status,
        url,
        memo,
      });
    } else {
      // 新規
      await addDoc(collection(db, "companies"), {
        name,
        status,
        url,
        memo,
        createdAt: new Date(),
      });
    }
  
    // リセット
    setName("");
    setStatus("todo");
    setUrl("");
    setMemo("");
    setEditingId(null);
    
    await fetchData();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-200 text-gray-800";
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
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          ShukatsuTracker
        </h1>

        {/* フォーム */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-800">企業追加</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 企業名 */}
            <input
              className="w-full border border-gray-300 p-2 rounded text-gray-800 placeholder-gray-400"
              type="text"
              placeholder="企業名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* URL */}
            <input
              className="w-full border border-gray-300 p-2 rounded text-gray-800 placeholder-gray-400"
              type="text"
              placeholder="企業URL（https://〜）"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            {/* メモ */}
            <textarea
              className="w-full border border-gray-300 p-2 rounded text-gray-800 placeholder-gray-400"
              placeholder="メモ（志望理由・面接対策など）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />

            {/* ステータス */}
            <select
              className="w-full border border-gray-300 p-2 rounded text-gray-800 placeholder-gray-400"
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
              {editingId ? "更新" : "追加"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                  setStatus("todo");
                  setUrl("");
                  setMemo("");
                }}
                className="w-full bg-gray-300 py-2 rounded mt-2"
              >
                キャンセル
              </button>
            )}

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
                className="bg-white p-4 rounded-xl shadow flex justify-between items-start"
              >
                {/* 左：内容 */}
                <div>
                  <div className="font-medium text-gray-900">{c.name}</div>

                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm underline block"
                    >
                      企業サイト
                    </a>
                  )}

                  {c.memo && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                      {c.memo}
                    </p>
                  )}

                  <span
                    className={`text-sm px-2 py-1 rounded ${statusColor(c.status)}`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* 右：操作ボタン */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setName(c.name);
                      setStatus(c.status);
                      setUrl(c.url || "");
                      setMemo(c.memo || "");
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    編集
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}