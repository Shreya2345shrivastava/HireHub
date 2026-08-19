import React from 'react';
import { Sparkles, Activity, ShieldCheck } from 'lucide-react';

const FeaturesSection = () => {
    const features = [
        {
            icon: <Sparkles className="w-8 h-8 text-primary" />,
            title: "AI-Powered Matching",
            description: "Our proprietary AI algorithm analyzes your resume and perfectly matches you with roles that fit your exact skill set and experience level."
        },
        {
            icon: <Activity className="w-8 h-8 text-blue-400" />,
            title: "Real-Time Tracking",
            description: "Never be left in the dark again. Track your application status with live WebSocket updates directly from recruiters."
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-purple-400" />,
            title: "Verified Premium Employers",
            description: "We strictly vet all companies on our platform to ensure you are only applying to high-quality, legitimate tech opportunities."
        }
    ];

    return (
        <div className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">HireHub?</span></h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        We've completely reimagined the hiring process to be faster, smarter, and fully transparent for both candidates and recruiters.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-card/30 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-glass hover:shadow-glow transition-all duration-300 hover:-translate-y-2 group">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-card-foreground mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesSection;
