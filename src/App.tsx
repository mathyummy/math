import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const classOptions = {
  "807": [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 26],
  "808": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25]
};

const pageRanges = {
  "4-2": { start: 133, end: 147 },
  "4-3": { start: 149, end: 168 }
};

const API_URL = "https://script.google.com/macros/s/AKfycbzeJvf_tEB2ZLDo6A_I9KnA5tedWHSsc3CeHRazXt23VmykDuLFYR3eFbitDC_Ve7sN/exec";

export default function App() {
  const [selectedClass, setSelectedClass] = useState("807");
  const [seatNumber, setSeatNumber] = useState(1);
  const [chapter, setChapter] = useState("4-2");
  const [page, setPage] = useState(133);
  const [data, setData] = useState([]);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const range = pageRanges[chapter];
    if (page < range.start || page > range.end) {
      setPage(range.start);
    }
  }, [chapter]);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(rows => {
        const [headers, ...values] = rows;
        const records = values.map(row =>
          Object.fromEntries(row.map((val, i) => [headers[i], val]))
        );
        setData(records);
      });
  }, []);

  const handleSubmit = async () => {
    const payload = {
      class: selectedClass,
      seat: seatNumber,
      chapter,
      page,
      date: today
    };

    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    });

    alert("送出成功！");
    setData(prev => [...prev, payload]);
  };

  const generateChartData = (cls, chap) => {
    return classOptions[cls].map(seat => {
      const entry = data
        .filter(d => d.class === cls && Number(d.seat) === seat && d.chapter === chap)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      return { seat, page: entry ? Number(entry.page) : 0 };
    });
  };

  return (
    <div style={{ padding: "1rem", display: "grid", gap: "2rem" }}>
      <div>
        <h2>進度填寫</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <label>班級：</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="807">807</option>
              <option value="808">808</option>
            </select>
          </div>
          <div>
            <label>座號：</label>
            <select value={seatNumber} onChange={e => setSeatNumber(Number(e.target.value))}>
              {classOptions[selectedClass].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            <label>章節：</label>
            <select value={chapter} onChange={e => setChapter(e.target.value)}>
              <option value="4-2">4-2</option>
              <option value="4-3">4-3</option>
            </select>
          </div>
          <div>
            <label>頁碼：</label>
            <input type="number" value={page} min={pageRanges[chapter].start} max={pageRanges[chapter].end} onChange={e => setPage(Number(e.target.value))} />
          </div>
        </div>
        <p>今天日期：{today}</p>
        <button onClick={handleSubmit}>送出進度</button>
      </div>

      <div>
        <h2>進度統計圖</h2>
        {["807", "808"].map(cls =>
          ["4-2", "4-3"].map(chap => (
            <div key={cls + chap} style={{ marginBottom: "2rem" }}>
              <h3>{cls} 班 {chap} 進度圖</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={generateChartData(cls, chap)}>
                  <XAxis dataKey="seat" />
                  <YAxis domain={[0, pageRanges[chap].end]} />
                  <Tooltip />
                  <Bar dataKey="page" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))
        )}
      </div>
    </div>
  );
}