import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CallToAction = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);

    return (
        <div className="py-24 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div className="bg-gradient-to-r from-primary/20 via-cyan-400/10 to-primary/20 backdrop-blur-xl border border-primary/20 p-12 md:p-16 rounded-3xl text-center shadow-glow">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                        Ready to accelerate your career?
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        Join thousands of professionals and top-tier companies on HireHub. The next big step in your career starts here.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {!user ? (
                            <>
                                <Button onClick={() => navigate("/signup")} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-lg transition-all hover:scale-105">
                                    Create Free Account
                                </Button>
                                <Button onClick={() => navigate("/login")} variant="outline" className="px-8 py-6 text-lg rounded-full border-border hover:bg-secondary transition-all">
                                    Log In
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => navigate("/browse")} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105">
                                Explore Jobs Now <ArrowRight className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            {/* Ambient background glow */}
            <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-1/2 bg-primary/20 rounded-[100%] filter blur-[100px] opacity-30'></div>
        </div>
    );
};

export default CallToAction;
