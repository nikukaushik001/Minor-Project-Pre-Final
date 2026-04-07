import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BrainCircuit,
    Sparkles,
    Zap,
    ShieldCheck,
    Globe,
    Cpu,
    ArrowRight,
    Bot,
    BarChart3,
    Layers,
    FileText,
    CheckCircle2,
    Search
} from 'lucide-react';

const LandingPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-hidden noise-bg">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-15%] w-[50%] h-[50%] bg-indigo-600/10 blur-[160px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-violet-600/10 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center space-y-12"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-10 relative z-10"
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2 glass-morphism border-white/[0.05] rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                            <Sparkles className="w-4 h-4 animate-pulse" /> The Future of Evaluation
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-7xl md:text-[10rem] font-bold text-white tracking-tight leading-[0.8] mix-blend-plus-lighter">
                                Grading <br />
                                <span className="accent-text-gradient italic">AI.</span>
                            </h1>
                            <p className="text-xl md:text-2xl font-medium text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                Automated exam grading powered by OCR and AI. Upload handwritten answer sheets — get instant, intelligent scores.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row items-center gap-6 pt-4"
                    >
                        <Link
                            to="/dashboard"
                            className="px-8 py-4 bg-white text-slate-950 font-bold text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-white/5"
                        >
                            Teacher Portal
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="#features"
                            className="px-8 py-4 glass-morphism border-white/[0.05] text-slate-300 font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-white/[0.08] transition-all"
                        >
                            Explore Stack
                        </a>
                    </motion.div>
                </motion.div>

                {/* Decorative Visuals */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 -z-10 flex justify-between px-10 opacity-20 pointer-events-none select-none">
                    <motion.div
                        animate={{ y: [0, -40, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="p-10 glass-card-dark rounded-[3rem]"
                    >
                        <Layers className="w-16 h-16 text-indigo-500" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 40, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="p-10 glass-card-dark rounded-[3rem] hidden lg:block"
                    >
                        <BarChart3 className="w-16 h-16 text-violet-500" />
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section id="features" className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: "OCR Engine", value: "EasyOCR" },
                        { label: "NLP Model", value: "MiniLM-L6" },
                        { label: "Backend", value: "FastAPI" },
                        { label: "Grading Mode", value: "Hybrid AI" }
                    ].map((spec, i) => (
                        <div key={i} className="p-6 glass-morphism border-white/[0.03] rounded-3xl space-y-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{spec.label}</p>
                            <p className="text-2xl font-bold text-white tracking-tight">{spec.value}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {[
                        {
                            icon: FileText,
                            title: "1. Scan & Upload Sheets",
                            desc: "Teachers collect physical answer sheets after the exam. Use the Bulk Upload tool to scan and ingest student responses directly into the AI engine.",
                            color: "text-indigo-400"
                        },
                        {
                            icon: BrainCircuit,
                            title: "2. AI Evaluates Instantly",
                            desc: "EasyOCR extracts text. A Hybrid NLP engine scores semantic similarity + keyword coverage to calculate an AI score.",
                            color: "text-amber-400"
                        },
                        {
                            icon: ShieldCheck,
                            title: "3. Teacher Reviews & Approves",
                            desc: "Teachers review AI feedback in the Grading Cockpit, adjust scores if needed, and approve. Results export to Excel with one click.",
                            color: "text-emerald-400"
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                            className="glass-card p-10 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-8 group-hover:bg-indigo-500/10 transition-colors">
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Technical Spec Section (The "Real" feel) */}
            <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto border-t border-white/[0.05]">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="lg:w-1/2 space-y-8 text-left">
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            Engineered for <br />
                            <span className="accent-text-gradient">Scale and Precision.</span>
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                <p className="text-slate-400 font-medium">Auto-scaling infrastructure handles peak exam seasons without performance degradation.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                                <p className="text-slate-400 font-medium">Bespoke OCR engine tuned for handwritten student scripts and technical diagrams.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500 flex-shrink-0" />
                                <p className="text-slate-400 font-medium">Export-ready analytics for institutional reporting and performance tracking.</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 w-full">
                        <div className="glass-card-dark rounded-[3rem] p-4 shimmer">
                            <div className="bg-[#0a0f1e] rounded-[2.2rem] h-80 flex items-center justify-center overflow-hidden border border-white/[0.03]">
                                <div className="relative w-full h-full flex items-center justify-center bg-slate-950/50">
                                    {/* Background Grid */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0,transparent_100%)]" />
                                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                                    {/* Mock Document */}
                                    <motion.div 
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        className="w-48 h-64 bg-white/[0.03] border border-white/[0.1] rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden backdrop-blur-sm transform rotate-[-2deg] shadow-2xl"
                                    >
                                        {/* Document Header */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
                                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                            </div>
                                            <div className="space-y-1.5 flex-1">
                                                <div className="h-1.5 w-16 bg-white/20 rounded-full" />
                                                <div className="h-1 w-10 bg-white/10 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Document Content Lines */}
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                                <div key={i} className="flex gap-2 items-center">
                                                    <div className={`h-1.5 rounded-full ${i % 2 === 0 ? 'bg-indigo-500/20 w-3/4' : 'bg-white/10 w-full'}`} />
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Scanning line moving up and down */}
                                        <motion.div 
                                            animate={{ top: ['-10%', '110%', '-10%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-0 right-0 h-[2px] bg-violet-400 shadow-[0_0_15px_3px_rgba(139,92,246,0.6)] z-10"
                                        />

                                        {/* Scan highlighting trail */}
                                        <motion.div 
                                            animate={{ top: ['-10%', '110%', '-10%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-violet-500/20 to-transparent -translate-y-1/2 blur-sm pointer-events-none"
                                        />
                                    </motion.div>

                                    {/* Floating Elements / Insights */}
                                    <motion.div
                                        animate={{ y: [-5, 5, -5] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute top-10 right-8 px-3 py-1.5 glass-morphism border border-indigo-500/30 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-500/10 z-20"
                                    >
                                        <Search className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Analyzing</span>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [5, -5, 5] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        className="absolute bottom-12 left-6 px-3 py-1.5 glass-morphism border border-emerald-500/30 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/10 z-20"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">High Confidence</span>
                                    </motion.div>
                                    
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute -right-4 -bottom-4 w-24 h-24 border border-white/5 rounded-full border-dashed"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute -left-8 -top-8 w-32 h-32 border border-indigo-500/10 rounded-full border-dashed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
