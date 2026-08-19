import React from 'react';

const TrustedBySection = () => {
    const companies = [
        "Microsoft", "Google", "Amazon", "Meta", "Netflix", "Spotify", "Stripe", "Vercel"
    ];

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-sm font-semibold text-muted-foreground tracking-widest uppercase mb-6">
                    Trusted by top tier companies
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                    {companies.map((company, index) => (
                        <div key={index} className="text-xl md:text-2xl font-bold text-foreground font-sans tracking-tight cursor-default hover:text-primary transition-colors duration-300">
                            {company}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustedBySection;
