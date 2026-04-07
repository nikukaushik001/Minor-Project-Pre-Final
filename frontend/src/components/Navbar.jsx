import React from 'react';
import { BookOpen, BarChart2, CheckCircle, Plus, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-6xl px-6">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-morphism rounded-3xl px-8 py-4 backdrop-blur-2xl border-white/[0.05] flex justify-between items-center shadow-2xl"
            >
                <div className="flex items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-white text-slate-950 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 duration-500 shadow-xl shadow-white/10">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tighter group-hover:text-indigo-400 transition-colors">
                            Grading<span className="text-slate-500 italic font-medium group-hover:text-indigo-300">AI</span>
                        </span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    {[
                        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                        { name: 'Grading', path: '/cockpit', icon: BarChart2 },
                        { name: 'Results', path: '/results', icon: CheckCircle },
                        { name: 'Students', path: '/students', icon: BookOpen },
                    ].map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`relative px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 ${isActive(item.path)
                                ? 'text-white bg-white/[0.05]'
                                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                                }`}
                        >
                            <item.icon className={`w-3.5 h-3.5 ${isActive(item.path) ? 'text-indigo-400' : 'opacity-60'}`} />
                            {item.name}
                            {isActive(item.path) && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white/[0.05] border border-white/[0.05] rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/create" className="px-5 py-2.5 bg-white text-slate-950 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center transform active:scale-95 shadow-xl shadow-white/5">
                        <Plus className="w-3.5 h-3.5 mr-2" /> New Exam
                    </Link>
                </div>
            </motion.div>
        </nav>
    );
};

export default Navbar;
