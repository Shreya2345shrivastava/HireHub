import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='text-center pt-24 pb-12 relative overflow-visible'>
            <div className='flex flex-col gap-6 my-4 relative z-10'>
                <motion.span 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='mx-auto px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-md shadow-glow border border-primary/20 text-primary font-medium tracking-wide'
                >
                    No. 1 Job Hunt Website
                </motion.span>
                
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className='text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight'
                >
                    Search, Apply & <br /> Get Your <span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400'>Dream Jobs</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className='text-muted-foreground max-w-2xl mx-auto text-lg'
                >
                    Discover thousands of job opportunities tailored for you. Fast-track your career with our intelligent matching system.
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className='flex w-full md:w-[50%] lg:w-[40%] bg-secondary/60 backdrop-blur-xl shadow-glass hover:shadow-glow transition-shadow duration-300 border border-border pl-4 rounded-full items-center gap-4 mx-auto'
                >
                    <input
                        type="text"
                        placeholder='Find your dream jobs...'
                        onChange={(e) => setQuery(e.target.value)}
                        className='outline-none border-none w-full bg-transparent text-foreground placeholder:text-muted-foreground py-4'
                    />
                    <Button onClick={searchJobHandler} className="rounded-r-full bg-primary hover:bg-primary/90 h-full py-6 px-6 transition-colors">
                        <Search className='h-5 w-5 text-primary-foreground' />
                    </Button>
                </motion.div>
            </div>
            {/* Background animated elements */}
            <div className='absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-float'></div>
            <div className='absolute bottom-10 right-10 w-40 h-40 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-float' style={{animationDelay: '1s'}}></div>
        </div>
    )
}

export default HeroSection