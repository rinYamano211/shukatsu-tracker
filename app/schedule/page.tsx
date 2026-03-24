"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { deleteDoc, doc } from "firebase/firestore";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";


export default function SchedulePage() {

  const [events, setEvents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const fetchEvents = async () => {
    const snapshot = await getDocs(collection(db, "events"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      }));
    setEvents(data);
  };

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
  };

  const handleAddEvent = async () => {
    if (!title || !selectedCompanyId || !selectedDate) return;

      const company = companies.find(c => c.id === selectedCompanyId);

      await addDoc(collection(db, "events"), {
        title,
        date: selectedDate,
        companyId: company.id,
        companyName: company.name,
      });

      // リセット
      setTitle("");
      setSelectedCompanyId("");
      setSelectedDate(null);

      await fetchEvents();
    };

    const handleEventClick = async (info: any) => {
      const confirmDelete = confirm(`「${info.event.title}」を削除しますか？`);

      if (!confirmDelete) return;

      await deleteDoc(doc(db, "events", info.event.id));

      await fetchEvents();
    };

    useEffect(() => {
      const fetchCompanies = async () => {
        const snapshot = await getDocs(collection(db, "companies"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanies(data);
      };

      fetchCompanies();
      fetchEvents();
    }, []);

    return (
      <div className="bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-xl font-bold mb-4 text-gray-900">スケジュール</h1>

          {/* イベント入力 */}
          {selectedDate && (
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold text-gray-800 mb-2">
                カレンダー
              </h2>

              <p className="text-sm font-medium text-gray-700 mb-2">
                日付: {selectedDate}
              </p>

              <input
                className="w-full border border-gray-300 p-2 rounded text-gray-800"
                placeholder="予定（例：1次面接）"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <select
                className="w-full border border-gray-300 p-2 rounded text-gray-800"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
              >
                <option value="">会社を選択</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddEvent}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  追加
                </button>

                <button
                  onClick={() => setSelectedDate(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

        {/* カレンダー */}
        <div className="bg-white p-4 rounded-xl shadow text-gray-800">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            eventColor="#2563eb"       // 背景（濃い青）
            eventTextColor="#ffffff"   // 文字（白）
            dayCellClassNames={(arg) => {
              return arg.isToday ? "bg-blue-50" : "";
            }}
          />
        </div>
      </div>
    </div>
  );
}