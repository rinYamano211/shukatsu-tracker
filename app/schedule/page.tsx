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

type Event = {
  id: string;
  title: string;
  start: string;
  companyId: string;
  type: "interview" | "deadline" | "task";
};

export default function SchedulePage() {

  const [events, setEvents] = useState<Event[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [type, setType] = useState<"interview" | "deadline" | "task">("interview");

  const fetchEvents = async () => {
    const snapshot = await getDocs(collection(db, "events"));
    const data = snapshot.docs.map((doc) => {
      const event = { id: doc.id, ...doc.data() } as any;

      const company = companies.find(c => c.id === event.companyId);

      return {
        id: event.id,
        title: company
          ? `${event.title}（${company.name}）`
          : event.title,
        start: event.start || event.date, // ← 保険
        companyId: event.companyId,
        type: event.type,
      };
    });
    setEvents(data);
  };

  const handleDateClick = (info: any) => {
    if (selectedDate === info.dateStr) {
      setSelectedDate(null); // ← もう一回押したら閉じる
    } else {
      setSelectedDate(info.dateStr);
    }
  };

  const handleAddEvent = async () => {
    if (!title || !selectedCompanyId || !selectedDate) return;

      const company = companies.find(c => c.id === selectedCompanyId);
      if (!company) return;

      await addDoc(collection(db, "events"), {
        title,
        start: selectedDate,
        companyId: company.id,
        type,
      });

      // リセット
      setTitle("");
      setSelectedCompanyId("");
      setSelectedDate(null);

      await fetchEvents();
    };

    const handleEventClick = (info: any) => {
      setSelectedDate(info.event.startStr);
      setTitle(info.event.title);
      setSelectedCompanyId(info.event.extendedProps.companyId);
    };

    useEffect(() => {
      const init = async () => {
        const snapshot = await getDocs(collection(db, "companies"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanies(data);

        await fetchEvents();
      };

      init();
    }, []);

    return (
      <div className="bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">スケジュール</h1>

          {/* イベント入力 */}
          {selectedDate && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-3">
              <h2 className="font-semibold text-gray-800 mb-2">
                カレンダー
              </h2>

              <p className="text-sm font-medium text-gray-700 mb-2">
                日付: {selectedDate}
              </p>

              <input
                className="w-full border border-gray-200 p-2 rounded-lg text-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="予定（例：1次面接）"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <select
                className="w-full border border-gray-200 p-2 rounded-lg text-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-400"
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

              <select value={type} onChange={(e) => {
                const value = e.target.value as "interview" | "deadline" | "task";
                setType(value);
              }}>
                <option value="interview">面接</option>
                <option value="deadline">締切</option>
                <option value="task">タスク</option>
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleAddEvent}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:scale-95 transition"
                >
                  追加
                </button>

                <button
                  onClick={() => setSelectedDate(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

        {/* カレンダー */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-gray-800">
          <FullCalendar
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events.map(e => ({
              ...e,
              color:
                e.type === "interview"
                  ? "#2563eb"
                  : e.type === "deadline"
                  ? "#ef4444"
                  : "#9ca3af",
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            dayMaxEventRows={2}
            height="auto"
            contentHeight="auto"
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