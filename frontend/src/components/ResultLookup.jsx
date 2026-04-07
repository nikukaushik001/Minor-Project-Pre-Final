import React, { useState } from 'react';
import api from '../api';
import {
    Search,
    GraduationCap,
    ChevronRight,
    Activity,
    Award,
    FileText,
    AlertCircle,
    Sparkles,
    TrendingUp,
    History,
    Database,
    ShieldCheck,
    Cpu,
    Fingerprint,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResultLookup = () => {
    const [rollNo, setRollNo] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [actionPlans, setActionPlans] = useState({});
    const [loadingPlans, setLoadingPlans] = useState({});

    const handleFetchPlan = async (submissionId) => {
        setLoadingPlans(prev => ({ ...prev, [submissionId]: true }));
        try {
            const res = await api.get(`/action_plan/${submissionId}`);
            setActionPlans(prev => ({ ...prev, [submissionId]: res.data.action_plan }));
        } catch (err) {
            console.error("Failed to fetch action plan");
        } finally {
            setLoadingPlans(prev => ({ ...prev, [submissionId]: false }));
        }
    };

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!rollNo.trim()) return;

        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/student_result/${rollNo}`);
            setResults(res.data);
        } catch (err) {
            const msg = err.response?.status === 404 
                ? "Identity token not found. Please verify your roll number." 
                : "Uplink offline. The assessment database is currently unreachable.";
            setError(msg);
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-40 pb-24 px-6 md:px-10 relative overflow-hidden noise-bg">
            {/* Neural Background Patterns */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[160px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-violet-600/10 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="max-w-5xl mx-auto space-y-16 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                >
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 glass-morphism border-white/[0.05] rounded-full text-indigo-400 text-[9px] font-bold uppercase tracking-[0.4em] mb-4">
                        <Fingerprint className="w-3.5 h-3.5" /> Secure Access
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight leading-[0.9]">Grading <span className="accent-text-gradient">AI.</span></h1>
                    <p className="text-lg font-medium text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Access your performance metrics and AI feedback through the secure lookup portal.
                    </p>
                </motion.div>

                {/* Search Interface */}
                <div className="max-w-2xl mx-auto">
                    <motion.form
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleLookup}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] ml-6">Digital Identity Fragment</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                        <GraduationCap className="h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-16 pr-6 py-5 bg-white/[0.02] border border-white/[0.08] rounded-2xl text-xl font-bold transition-all outline-none focus:border-indigo-500/30 focus:bg-white/[0.04] placeholder:text-slate-700 tracking-wider shadow-inner"
                                        placeholder="ROLL NUMBER (e.g. 2024CS01)"
                                        value={rollNo}
                                        onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-10 py-5 bg-white text-slate-950 font-bold rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-white/5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Search className="w-4 h-4" />
                                    )}
                                    {loading ? 'Synthesizing...' : 'Lookup Results'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-6 glass-morphism border-red-500/20 text-red-400 rounded-2xl flex items-center gap-4"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="font-bold text-xs tracking-wide">Identity not found in the records. Please verify your roll number.</span>
                            </motion.div>
                        )}
                    </motion.form>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-12 pt-8"
                        >
                            <div className="flex items-center justify-between border-b border-white/[0.05] pb-8">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-bold text-white tracking-tight">Records Found</h3>
                                    <p className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.6em]">Verified System Registry</p>
                                </div>
                                <div className="px-5 py-2 glass-morphism border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                                    {results.length} Submissions
                                </div>
                            </div>

                            <div className="space-y-8">
                                {results.map((res, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 group hover:bg-white/[0.03] transition-all"
                                    >
                                        <div className="space-y-8 flex-1">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 glass-morphism rounded-xl flex items-center justify-center border-white/[0.05]">
                                                        <FileText className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exam ID: #{res.exam_id}</span>
                                                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                                        <div className="flex items-center gap-2 text-indigo-400/70">
                                                            <History className="w-3.5 h-3.5" />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest">{res.date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <h4 className="text-3xl font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">Submission Result</h4>
                                            </div>
                                            <div className="p-8 glass-morphism border-white/[0.05] bg-white/[0.01] rounded-3xl relative overflow-hidden">
                                                <div className="absolute bottom-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                                                    <Sparkles className="w-20 h-20" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-400 leading-relaxed italic pr-6">
                                                    "{res.feedback}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-left md:text-right space-y-8 min-w-[200px] w-full md:w-auto">
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Synthesis Score</p>
                                                <div className="flex items-baseline justify-start md:justify-end gap-2">
                                                    <p className="text-7xl font-bold text-white tracking-tighter tabular-nums leading-none">{res.score}</p>
                                                    <span className="text-slate-600 text-xl font-bold tracking-tighter">/ 10</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-start md:justify-end gap-3">
                                                <div className={`p-2 rounded-lg ${res.verified ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                                                    <ShieldCheck className={`w-4 h-4 ${res.verified ? 'text-emerald-400' : 'text-amber-400'}`} />
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${res.verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    {res.verified ? 'Protocol Verified' : 'Awaiting Audit'}
                                                </span>
                                            </div>

                                            <button 
                                                onClick={() => !actionPlans[res.submission_id] && handleFetchPlan(res.submission_id)}
                                                className={`w-full py-4 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 ${actionPlans[res.submission_id] ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'glass-card border-white/[0.05] hover:bg-white/[0.08] text-indigo-400'}`}
                                            >
                                                {loadingPlans[res.submission_id] ? (
                                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Synthesizing...</>
                                                ) : actionPlans[res.submission_id] ? (
                                                    <><TrendingUp className="w-3.5 h-3.5" /> Study Roadmap Active</>
                                                ) : (
                                                    <><Activity className="w-3.5 h-3.5" /> Generate Action Plan</>
                                                )}
                                            </button>
                                        </div>

                                        {/* Action Plan Overlay/Expansion */}
                                        {actionPlans[res.submission_id] && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="w-full mt-8 md:col-span-2 basis-full border-t border-white/[0.05] pt-8"
                                            >
                                                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                                    <Cpu className="w-3.5 h-3.5" /> AI Generated Study Roadmap
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                    {actionPlans[res.submission_id].map((step, idx) => (
                                                        <div key={idx} className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl relative overflow-hidden group/step hover:border-indigo-500/30 transition-all">
                                                            <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl italic group-hover/step:text-indigo-500 group-hover/step:opacity-20 transition-all">
                                                                {step.step}
                                                            </div>
                                                            <h5 className="text-white font-bold tracking-wide mb-3">{step.action}</h5>
                                                            <p className="text-xs text-slate-400 font-medium leading-relaxed relative z-10">{step.detail}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Technical Decorative Footer */}
            <div className="fixed bottom-6 left-10 opacity-20 hidden lg:block">
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.5em]">
                    Terminal Access • Encryption RSA-4096 • SEC Registry
                </p>
            </div>
        </div>
    );
};

export default ResultLookup;
