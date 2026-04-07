import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CreateExam from './components/CreateExam';
import CreateQuestion from './components/CreateQuestion';
import ExamWorkspace from './components/ExamWorkspace';
import GradingCockpit from './components/GradingCockpit';
import ResultLookup from './components/ResultLookup';
import StudentRegistry from './components/StudentRegistry';
import LandingPage from './components/LandingPage';
import { AuthProvider } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => setLoading(false), 2000);
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617] noise-bg overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-transparent to-fuchsia-900/20" />
                    <motion.div 
                        animate={{ scale: [0.8, 1.2, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="w-48 h-48 border-y-4 border-indigo-500 rounded-full flex flex-col items-center justify-center shadow-[0_0_150px_rgba(99,102,241,1)] relative"
                    >
                        <div className="absolute inset-0 rounded-full border-x-4 border-fuchsia-500 animate-spin-slow" />
                        <Bot className="w-12 h-12 text-white mb-2 animate-pulse" />
                        <div className="text-white font-black tracking-[0.4em] text-[10px] uppercase animate-pulse">Grading AI</div>
                        <div className="text-indigo-400 font-bold tracking-[0.8em] text-[6px] uppercase mt-1">Booting</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const AmbientGlow = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = ev => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);

    return (
        <div 
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
            style={{
                background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.35), transparent 40%)`
            }}
        />
    );
};

const NavigationWrapper = ({ children }) => {
    const location = useLocation();
    const noNavbarRoutes = ['/', '/results'];
    const isStudentPortal = noNavbarRoutes.includes(location.pathname);

    return (
        <div className="min-h-screen bg-[#020617] relative">
            <Preloader />
            <AmbientGlow />
            <div className="animated-grid"></div>
            <div className="relative z-10">
                {!isStudentPortal && <Navbar />}
                {children}
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <NavigationWrapper>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/create" element={<CreateExam />} />
                        <Route path="/create_question/:examId" element={<CreateQuestion />} />
                        <Route path="/workspace/:examId" element={<ExamWorkspace />} />
                        <Route path="/cockpit" element={<GradingCockpit />} />
                        <Route path="/results" element={<ResultLookup />} />
                        <Route path="/students" element={<StudentRegistry />} />

                    </Routes>
                </NavigationWrapper>
            </Router>
        </AuthProvider>
    );
}

export default App;
