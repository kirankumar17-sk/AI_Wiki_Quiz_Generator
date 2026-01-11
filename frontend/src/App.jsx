import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, History, Loader2, X } from "lucide-react";
import QuizView from "./components/QuizView";

// Ensure this matches your backend URL
const API_BASE_URL = "https://wiki-quiz-backend-011u.onrender.com";

function App() {
  const [activeTab, setActiveTab] = useState("generate");
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/quizzes`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleGenerate = async () => {
    if (!urlInput) return;
    setLoading(true);
    setError("");
    setCurrentQuiz(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/generate`, { url: urlInput });
      setCurrentQuiz(res.data);
    } catch (err) {
      setError("Failed. Check URL or Backend Console.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openHistoryDetail = (item) => {
    // The history API returns the full object (including quiz_data)
    // We just need to parse the nested 'quiz_data' correctly if it's stored deeply
    // Based on our model, 'quiz_data' is a JSON field.
    // Let's create a normalized object for QuizView
    const normalizedData = {
      title: item.title,
      summary: item.summary,
      ...item.quiz_data // Spread the nested quiz JSON (questions, entities, etc)
    };
    setSelectedHistoryItem(normalizedData);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-slate-800 bg-slate-50">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-2 tracking-tight">WikiQuiz AI</h1>
          <p className="text-slate-500">Transform Wikipedia articles into interactive quizzes in seconds.</p>
        </header>

        {/* TABS */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${activeTab === "generate" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              <BookOpen size={18} className="mr-2" /> Generate
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${activeTab === "history" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              <History size={18} className="mr-2" /> History
            </button>
          </div>
        </div>

        {/* TAB 1: GENERATE */}
        {activeTab === "generate" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Wikipedia Article URL</label>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. https://en.wikipedia.org/wiki/Quantum_mechanics"
                  className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center disabled:opacity-70 transition-colors shadow-lg shadow-indigo-100"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                  {loading ? "Generating..." : "Generate Quiz"}
                </button>
              </div>
              {error && <p className="text-red-500 mt-3 text-sm bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
            </div>

            {currentQuiz && (
              // Merge quiz_data up to top level for the view
              <QuizView data={{ ...currentQuiz, ...currentQuiz.quiz_data }} />
            )}
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">ID</th>
                  <th className="p-4 font-semibold text-slate-600">Topic</th>
                  <th className="p-4 font-semibold text-slate-600">Date</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500">#{item.id}</td>
                    <td className="p-4 font-medium text-slate-800">{item.title}</td>
                    <td className="p-4 text-slate-500 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openHistoryDetail(item)}
                        className="text-indigo-600 font-bold text-sm hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && <p className="p-8 text-center text-slate-500">No history found.</p>}
          </div>
        )}
      </div>

      {/* MODAL FOR HISTORY DETAILS */}
      {modalOpen && selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h2 className="text-lg font-bold">Historical Quiz View</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <QuizView data={selectedHistoryItem} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;