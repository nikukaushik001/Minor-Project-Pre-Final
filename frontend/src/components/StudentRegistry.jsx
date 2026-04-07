import React, { useEffect, useState } from 'react';
import api from '../api';
import {
    Search,
    Users,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    Database,
    Zap,
    X,
    FileText,
    Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentRegistry = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        const fetchRegistry = async () => {
            try {
                const res = await api.get('/students_global/');
                setStudents(res.data.registry || []);
            } catch (err) {
                console.error("Failed to load student registry", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistry();
    }, []);

    const filteredStudents = students.filter(s => 
        s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStudentClick = async (studentId) => {
        setSelectedStudent(studentId);
        setDetailsLoading(true);
        try {
            const res = await api.get(`/student_result/${studentId}`);
            setStudentDetails(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetails = () => {
        setSelectedStudent(null);
        setStudentDetails(null);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen pt-20">
            <div className="w-16 h-16 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen text-white pt-24 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 glass-morphism border-white/[0.05] rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <Database className="w-3 h-3" /> Data Center Active
                </div>
                <h1 className="text-5xl font-bold tracking-tight">Student <span className="accent-text-gradient">Registry</span></h1>
                <p className="text-slate-400 font-medium max-w-2xl">
                    Manage and inspect every student profile. Click on any record to view a deep analytical breakdown of their answers and AI feedback.
                </p>
            </motion.div>

            {/* Main Search Interface */}
            <div className="glass-card border-white/[0.05] overflow-hidden">
                <div className="p-6 border-b border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="SEARCH ROLL NUMBER..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm font-bold tracking-widest outline-none focus:border-indigo-500/50 transition-all uppercase"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <Users className="w-4 h-4" />
                        <span>{filteredStudents.length} Records Found</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Roll Number</th>
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Avg Score</th>
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Submissions</th>
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((s, idx) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={s.student_id} 
                                    className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors group cursor-pointer"
                                    onClick={() => handleStudentClick(s.student_id)}
                                >
                                    <td className="p-6 font-bold text-lg">{s.student_id}</td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xl font-bold ${s.avg_score >= 8 ? 'text-emerald-400' : s.avg_score < 5 ? 'text-red-400' : 'text-indigo-400'}`}>
                                                {s.avg_score}
                                            </span>
                                            <span className="text-slate-600 text-sm font-bold">/ 10</span>
                                        </div>
                                    </td>
                                    <td className="p-6 font-bold text-slate-300">{s.total_exams} Exams</td>
                                    <td className="p-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                            <ShieldCheck className="w-3 h-3" />
                                            {s.verification_status}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="p-2 bg-white/[0.05] rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                            <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredStudents.length === 0 && (
                        <div className="p-24 flex flex-col items-center justify-center text-center opacity-50">
                            <Database className="w-12 h-12 mb-4 text-slate-600" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No matching records found in database.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Student Profile Detail Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-xl p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-white/[0.1] rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Intelligence Profile</p>
                                    <h2 className="text-4xl font-bold tracking-tight">{selectedStudent}</h2>
                                </div>
                                <button onClick={closeDetails} className="p-3 bg-white/[0.05] hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                                {detailsLoading ? (
                                    <div className="flex justify-center p-12">
                                        <Zap className="w-8 h-8 text-indigo-500 animate-pulse" />
                                    </div>
                                ) : (
                                    studentDetails?.map((res, i) => (
                                        <div key={i} className="glass-morphism border border-white/[0.05] rounded-3xl p-8 space-y-6 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-violet-400" />
                                                        <h4 className="text-xl font-bold">{res.exam_title}</h4>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        Exam Protocol #{res.exam_id} • {res.date}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-white leading-none">{res.score}</p>
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">/ {res.max_marks}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-[#0a0f1e] rounded-2xl border border-indigo-500/20">
                                                <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-indigo-500 pl-4">
                                                    "{res.feedback}"
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentRegistry;
