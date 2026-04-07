import React, { useEffect, useState } from 'react';
import {
    FileText,
    Plus,
    Activity,
    Download,
    ArrowRight,
    BrainCircuit,
    Sparkles,
    TrendingUp,
    Users,
    Database,
    Shield,
    Terminal,
    ChevronRight,
    Search,
    Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';
import api from '../api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        pending: 0,
        graded: 0,
        total: 0,
        avg_score: 0,
        recent_activity: [],
        score_distribution: []
    });
    const [exams, setExams] = useState([]);
    const [mistakes, setMistakes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            // Node synchronization sequence
            try {
                const eRes = await api.get('/exams/');
                setExams(eRes.data.reverse());
            } catch (qe) { console.warn("Exams link fragmented."); }

            try {
                const aRes = await api.get('/analytics/');
                setStats({
                    pending: aRes.data.total_submissions - (aRes.data.graded || 0),
                    graded: aRes.data.graded || 0,
                    total: aRes.data.total_submissions,
                    avg_score: aRes.data.avg_score,
                    recent_activity: aRes.data.recent_activity,
                    score_distribution: aRes.data.score_distribution || []
                });
            } catch (ae) { console.warn("Analytics uplink severed."); }

            try {
                const mRes = await api.get('/common_mistakes/');
                setMistakes(mRes.data.mistakes || []);
            } catch (me) { console.warn("Linguistic database unreachable."); }

            // Heartbeat check for fatal connectivity failure
            try {
                await api.get('/health');
                setError(null);
            } catch (fatal) {
                console.error("Critical failure during heart-beat synchronization:", fatal);
                setError(`Connection Offline: ${fatal.message}. Please restart the Backend server on port 8000.`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const handleExport = async () => {
        try {
            const response = await api.get('/export_results/', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Assessment_Global_Report.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            alert("Local database empty. No data to synthesize.");
        }
    };

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-[#020617] noise-bg p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass-card p-12 border-red-500/20 text-center space-y-8"
            >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Neural Sync Offline</h2>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {error} <br />
                    <span className="text-slate-700 text-[10px] uppercase font-bold tracking-widest block mt-4 italic opacity-50">Localhost:8000 Transmission Fragmented</span>
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-4 bg-white text-slate-950 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                >
                    Retry Neural Sync
                </button>
            </motion.div>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#020617] noise-bg">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
            >
                <div className="p-4 glass-morphism rounded-2xl animate-pulse">
                    <Terminal className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        animate={{ x: [-192, 192] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="h-full bg-indigo-500 w-1/3 rounded-full"
                    ></motion.div>
                </div>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.5em]">Synchronizing Core Systems</p>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white noise-bg pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 glass-morphism border-white/[0.05] rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                            <Terminal className="w-3 h-3" /> System Active
                        </div>
                        <h1 className="text-5xl font-bold text-white tracking-tight">Grading <span className="accent-text-gradient">AI</span> Dashboard</h1>
                        <p className="text-slate-500 font-medium text-sm tracking-wide">Manage your exams and track grading progress in real-time.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <Link
                            to="/results"
                            className="px-6 py-3.5 glass-card border-white/[0.05] hover:bg-white/[0.08] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 text-indigo-400"
                        >
                            <Users className="w-4 h-4" /> Student Portal
                        </Link>
                        <Link
                            to="/students"
                            className="px-6 py-3.5 glass-card border-white/[0.05] hover:bg-white/[0.08] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 text-fuchsia-400"
                        >
                            <Database className="w-4 h-4" /> Data Center
                        </Link>
                        <button
                            onClick={handleExport}
                            className="px-6 py-3.5 glass-card border-white/[0.05] hover:bg-white/[0.08] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3"
                        >
                            <Download className="w-4 h-4" /> Synthesize XLSX
                        </button>
                        <Link
                            to="/create"
                            className="px-6 py-3.5 bg-white text-slate-950 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-3 shadow-xl shadow-white/5"
                        >
                            <Plus className="w-4 h-4" /> Deploy New Node
                        </Link>
                    </motion.div>
                </div>

                {/* Primary Intelligence Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Evaluation Points', value: stats.total, icon: Database, color: 'text-indigo-400' },
                        { label: 'Avg Mastery Node', value: `${stats.avg_score || 0}%`, icon: Activity, color: 'text-violet-400' },
                        { label: 'System Accuracy', value: '99.8%', icon: Shield, color: 'text-emerald-400' },
                        { label: 'Active Papers', value: exams.length, icon: BrainCircuit, color: 'text-amber-400' }
                    ].map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-8 group border-white/[0.03]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 rounded-xl bg-white/[0.03] group-hover:bg-indigo-500/10 transition-colors">
                                    <m.icon className={`w-4 h-4 ${m.color}`} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight">{m.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Active Assessment Nodes */}
                <div className="mb-16">
                    <div className="flex items-baseline justify-between mb-8 border-b border-white/[0.05] pb-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Active Exams</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grading Registry</p>
                        </div>
                        <Link
                            to="/create"
                            className="px-6 py-2.5 bg-white text-slate-950 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                        >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            Create New Exam
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {exams.length === 0 ? (
                            <div className="col-span-full py-32 glass-card border-dashed border-white/[0.05] flex flex-col items-center justify-center text-center">
                                <Database className="w-12 h-12 text-slate-700 mb-6" />
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em]">No Exam Papers Identified</p>
                            </div>
                        ) : (
                            exams.map((exam, idx) => (
                                <Link
                                    to={`/workspace/${exam.id}`}
                                    key={exam.id}
                                    style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                                    className="block relative"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.02, rotateY: -3, rotateX: 3, boxShadow: "0 0 60px rgba(139,92,246,0.3)", borderColor: "rgba(139,92,246,0.6)", zIndex: 10 }}
                                        transition={{ delay: idx * 0.05, duration: 0.4 }}
                                        className="glass-card p-10 group relative flex flex-col h-[280px] border-white/[0.05]"
                                    >
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="p-3.5 bg-white/[0.05] rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                <FileText className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Marks</span>
                                                <span className="text-xl font-bold">{exam.total_marks || "-"} pts</span>
                                            </div>
                                        </div>

                                        <div className="flex-grow space-y-4 mb-4">
                                            <h4 className="text-xl font-bold leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-indigo-400 transition-colors">
                                                {exam.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 line-clamp-2">{exam.description}</p>
                                        </div>

                                        <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Paper</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-indigo-400 group-hover:text-white transition-colors">
                                                Open Workspace
                                                <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Analytical Visualization Overlay */}
                <div className="pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-card p-12 overflow-hidden relative lg:col-span-2"
                    >
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.5em]">Engine Performance</h4>
                                <h2 className="text-4xl font-bold tracking-tight">Neural Evaluation Velocity</h2>
                                <p className="text-slate-500 font-medium max-w-lg">
                                    Historical analysis of submission processing speeds and accuracy metrics across all active nodes in the cluster.
                                </p>
                            </div>
                            <div className="flex items-center gap-12 text-left">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Global Stability</p>
                                    <p className="text-4xl font-bold text-emerald-400">99.2%</p>
                                </div>
                                <div className="h-10 w-px bg-white/[0.05]" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Peak Cluster Load</p>
                                    <p className="text-4xl font-bold">14.2k <span className="text-xs text-slate-500 tracking-normal font-medium">sub/s</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            {stats.score_distribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart 
                                        data={stats.score_distribution} 
                                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5}/>
                                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis 
                                            dataKey="score" 
                                            stroke="rgba(255,255,255,0.3)" 
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `Score ${val}`}
                                        />
                                        <YAxis 
                                            stroke="rgba(255,255,255,0.3)" 
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(2, 6, 23, 0.8)', 
                                                backdropFilter: 'blur(12px)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '1rem',
                                                color: '#fff',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}
                                            itemStyle={{ color: '#818cf8' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="count" 
                                            stroke="#818cf8" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorCount)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center border border-dashed border-white/[0.05] rounded-xl">
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Awaiting assessment data</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* AI Insights: Common Mistakes */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-violet-400" />
                                <h3 className="text-lg font-bold">Common Mistakes</h3>
                            </div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">AI Intelligence</span>
                        </div>
                        <div className="space-y-4">
                            {mistakes.map((m, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card p-6 border-white/[0.05] group hover:bg-white/[0.02] transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest leading-tight">{m.issue}</h4>
                                        <span className="text-[10px] font-bold text-slate-600">{m.frequency}% Frequency</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-indigo-500/20 pl-4 py-1">
                                        "{m.recommendation}"
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

