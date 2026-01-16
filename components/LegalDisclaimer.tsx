import React from 'react';

const LegalDisclaimer: React.FC = () => {
    return (
        <footer className="mt-16 pb-8 px-6 text-center border-t border-white/5 pt-8">
            <div className="flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">

                {/* 18+ Badge */}
                <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-slate-500 text-slate-500 font-bold text-sm bg-black/30 backdrop-blur-sm">
                        18+
                    </div>
                    <span className="text-slate-500 text-xs tracking-widest uppercase">Responsible Gaming</span>
                </div>

                {/* Disclaimer Text */}
                <p className="text-[10px] leading-relaxed text-slate-600 font-medium">
                    BlackjackBible.ai is strictly for entertainment and educational purposes only. This application does not offer real money gambling or an opportunity to win real money or prizes.
                    The developers and owners of this application assume no responsibility or liability for any financial losses or damages incurred by users.
                    Gambling involves risk and can be addictive. Please gamble responsibly. By using this site, you confirm that you are at least 18 years of age or the legal age of majority in your jurisdiction.
                </p>

                <p className="text-[10px] text-slate-700">
                    © {new Date().getFullYear()} BlackjackBible.ai. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default LegalDisclaimer;
