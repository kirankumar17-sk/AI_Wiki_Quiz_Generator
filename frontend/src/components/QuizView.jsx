import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, BookOpen, Layers, Award } from 'lucide-react';

const QuizView = ({ data }) => {
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    // Handle selecting an option
    const handleSelect = (qIndex, option) => {
        if (showResults) return; // Prevent changing after submission
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    // Calculate score
    const calculateScore = () => {
        let correct = 0;
        data.quiz.forEach((q, index) => {
            if (answers[index] === q.answer) correct++;
        });
        return correct;
    };

    return (
        <div className="space-y-8 animate-fade-in">

            {/* 1. Article Summary Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{data.title}</h2>
                <p className="text-slate-600 leading-relaxed">{data.summary}</p>

                {/* Entities Chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {data.key_entities.people.slice(0, 3).map((p, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{p}</span>
                    ))}
                    {data.key_entities.organizations.slice(0, 3).map((o, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">{o}</span>
                    ))}
                </div>
            </div>

            {/* 2. Quiz Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Layers className="text-indigo-600" />
                        Knowledge Check
                    </h3>
                    {showResults && (
                        <span className="bg-green-100 text-green-800 px-4 py-1 rounded-lg font-bold">
                            Score: {calculateScore()} / {data.quiz.length}
                        </span>
                    )}
                </div>

                {data.quiz.map((q, index) => {
                    const isCorrect = answers[index] === q.answer;
                    const isSelected = answers[index];

                    return (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between mb-4">
                                <h4 className="font-semibold text-lg text-slate-800">
                                    {index + 1}. {q.question}
                                </h4>
                                <span className={`text-xs px-2 py-1 rounded uppercase font-bold h-fit ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {q.difficulty}
                                </span>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((option, optIdx) => {
                                    let btnClass = "p-3 rounded-xl border-2 text-left transition-all ";

                                    if (showResults) {
                                        if (option === q.answer) btnClass += "border-green-500 bg-green-50 text-green-700 font-medium";
                                        else if (answers[index] === option) btnClass += "border-red-400 bg-red-50 text-red-700";
                                        else btnClass += "border-slate-100 opacity-50";
                                    } else {
                                        if (answers[index] === option) btnClass += "border-indigo-600 bg-indigo-50 text-indigo-700";
                                        else btnClass += "border-slate-100 hover:border-indigo-200 hover:bg-slate-50";
                                    }

                                    return (
                                        <button
                                            key={optIdx}
                                            onClick={() => handleSelect(index, option)}
                                            className={btnClass}
                                            disabled={showResults}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{option}</span>
                                                {showResults && option === q.answer && <CheckCircle size={16} className="text-green-600" />}
                                                {showResults && answers[index] === option && option !== q.answer && <XCircle size={16} className="text-red-500" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation (Hidden until submitted) */}
                            {showResults && (
                                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border-l-4 border-indigo-400">
                                    <strong>Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 3. Actions / Related */}
            {!showResults ? (
                <button
                    onClick={() => setShowResults(true)}
                    disabled={Object.keys(answers).length < data.quiz.length}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
                >
                    Submit Quiz
                </button>
            ) : (
                <div className="bg-indigo-900 text-white p-6 rounded-2xl">
                    <h4 className="font-bold mb-3 flex items-center gap-2"><BookOpen size={20} /> Related Topics</h4>
                    <div className="flex gap-3 flex-wrap">
                        {data.related_topics.map((topic, i) => (
                            <a
                                key={i}
                                href={`https://en.wikipedia.org/wiki/${topic.replace(/ /g, '_')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-2"
                            >
                                {topic} <ChevronRight size={14} />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizView;