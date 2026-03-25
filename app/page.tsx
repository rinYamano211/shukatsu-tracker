"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { query, where } from "firebase/firestore";

const TAG_OPTIONS = [
  // 働き方
  "リモート可",
  "フレックス",
  "残業少なめ",

  // 技術領域
  "組み込み",
  "Web系",
  "IoT",

  // 開発形態
  "自社開発",
  "受託開発",
  "SIer",

  // 年収
  "年収400万台",
  "年収600万台",
  "年収800万以上",
];

type Company = {
  id: string;
  name: string;
  status: string;
  url?: string;
  memo?: string;
  tags?: string[];
};


export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("todo");
  const [url, setUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");

  const fetchData = async () => {
      const constraints = [];

      if (filterStatus !== "all") {
        constraints.push(where("status", "==", filterStatus));
      }

      if (filterTag !== "all") {
        constraints.push(where("tags", "array-contains", filterTag));
      }

      const q = query(collection(db, "companies"), ...constraints);

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Company, "id">),
      }));

    setCompanies(data);
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterTag]);

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
        tags,
      });
    } else {
      // 新規
      await addDoc(collection(db, "companies"), {
        name,
        status,
        url,
        memo,
        tags,
        createdAt: new Date(),
      });
    }
  
    // リセット
    setName("");
    setStatus("todo");
    setUrl("");
    setMemo("");
    setEditingId(null);
    setTags([]);

    await fetchData();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-600";

      case "applied":
        return "bg-yellow-100 text-yellow-700";

      case "interview":
        return "bg-blue-100 text-blue-700";

      case "offer":
        return "bg-green-100 text-green-700";

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
    <div className="bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 text-center">
          ShukatsuTracker
        </h1>

        {/* フォーム */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-gray-800">企業追加</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-sm text-gray-600 mb-1 block">企業名</label>
            <input
              className="w-full border border-gray-200 bg-white shadow-sm p-2 rounded-lg text-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              type="text"
              placeholder="企業名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="text-sm text-gray-600 mb-1 block">URL</label>
            <input
              className="w-full border border-gray-200 bg-white shadow-sm p-2 rounded-lg text-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              type="text"
              placeholder="企業URL（https://〜）"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <label className="text-sm text-gray-600 mb-1 block">メモ</label>
            <textarea
              className="w-full border border-gray-200 bg-white shadow-sm p-2 rounded-lg text-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              placeholder="メモ（志望理由・面接対策など）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />

            <label className="text-sm text-gray-600 mb-1 block">タグ</label>
            <div>
              <p className="text-sm font-medium mb-2">条件タグ</p>

              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <label
                    key={tag}
                    className={`px-3 py-1 rounded-full text-xs border cursor-pointer transition
                    ${
                      tags.includes(tag)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={tag}
                      checked={tags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTags([...tags, tag]);
                        } else {
                          setTags(tags.filter((t) => t !== tag));
                        }
                      }}
                      className="hidden"
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </div>

            <label className="text-sm text-gray-600 mb-1 block">ステータス</label>
            <select
              className="w-full border border-gray-200 bg-white shadow-sm p-2 rounded-lg text-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">未応募</option>
              <option value="applied">応募済</option>
              <option value="interview">面接中</option>
              <option value="offer">内定</option>
            </select>

            <div className="pt-4 md:text-left">
              <button className="w-full md:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
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
                    setTags([]);
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {["all", "todo", "applied", "interview", "offer"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-sm rounded-full border ${
                filterStatus === s
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", ...TAG_OPTIONS].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 rounded-full text-xs border transition
                ${
                  filterTag === tag
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
            >
              {tag === "all" ? "全タグ" : tag}
            </button>
          ))}
        </div>

        {/* 一覧 */}
        <div className="space-y-4">
          {companies.length === 0 ? (
            <p className="text-center text-gray-500">
              データがありません
            </p>
          ) : (
            companies.map((c) => (
              <div key={c.id} className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="text-base font-bold text-gray-900">{c.name}</div>

                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>

                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    className="text-xs text-gray-400 hover:text-blue-500 mt-1 block"
                  >
                    企業サイト
                  </a>
                )}

                {c.tags && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {c.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {c.memo && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                    {c.memo}
                  </p>
                )}

                <div className="flex gap-2 mt-3 text-xs">
                  <button
                    className="px-2 py-1 rounded-md text-blue-600 hover:bg-blue-50 active:scale-95 transition"
                    onClick={() => {
                      setEditingId(c.id);
                      setName(c.name);
                      setStatus(c.status);
                      setUrl(c.url || "");
                      setMemo(c.memo || "");
                      setTags(c.tags || []);
                    }}
                  >
                    編集
                  </button>

                  <button
                    className="px-2 py-1 rounded-md text-red-600 hover:bg-red-50 active:scale-95 transition"
                    onClick={() => handleDelete(c.id)}
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