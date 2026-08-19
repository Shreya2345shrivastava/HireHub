import React from 'react';
import { UserPlus, Search, Briefcase } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            icon: <UserPlus className="w-6 h-6 text-primary" />,
            title: "Create an Account",
            description: "Sign up and build your profile in minutes. Upload your resume and let our system parse your skills automatically."
        },
        {
            number: "02",
            icon: <Search className="w-6 h-6 text-primary" />,
            title: "Discover Opportunities",
            description: "Browse through thousands of curated job listings or let our AI recommend the best matches for your career goals."
        },
        {
            number: "03",
            icon: <Briefcase className="w-6 h-6 text-primary" />,
            title: "Apply & Get Hired",
            description: "Apply with a single click. Track your application through the recruiter's pipeline in real-time."
        }
    ];

    return (
        <div className="py-24 border-y border-border/50 relative overflow-hidden bg-background/50 backdrop-blur-xl">
            {/* Background elements */}
            <div className='absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full mix-blend-screen filter blur-3xl'></div>
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It <span className="text-primary">Works</span></h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Your dream job is just three simple steps away.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-6 lg:gap-12 relative">
                    {/* Connecting line for desktop */}
                    <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-border -translate-y-1/2 z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="flex-1 relative z-10">
                            <div className="bg-card/80 backdrop-blur-md border border-border p-8 rounded-2xl shadow-glass text-center hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-card-foreground mb-3">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {step.description}
                                </p>
                                <div className="absolute -top-4 -right-4 text-5xl font-extrabold text-secondary-foreground/10 select-none">
                                    {step.number}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
