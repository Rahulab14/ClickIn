import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SectionCard = ({ icon, title, children, className = "", variant = 'default' }: any) => {
    let cardClass = "bg-white border-gray-100 hover:border-emerald-100 hover:shadow-xl";
    let titleClass = "text-gray-900";
    let iconWrapprClass = "shadow-[0_8px_30px_rgb(16,185,129,0.12)] bg-gradient-to-br from-white to-emerald-50/50";

    if (variant === 'danger') {
        cardClass = "bg-[#FFF5F5] border-red-100 hover:border-red-200 hover:shadow-xl";
        titleClass = "text-red-700";
        iconWrapprClass = "shadow-[0_8px_30px_rgb(239,68,68,0.12)] bg-gradient-to-br from-white to-red-50/50";
    }

    return (
        <section className={`p-5 sm:p-8 md:p-10 rounded-[28px] md:rounded-[32px] shadow-sm border transition-all duration-500 hover:-translate-y-1 ${cardClass} ${className}`}>
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-extrabold mb-6 md:mb-8 flex items-center gap-4 md:gap-5 ${titleClass}`}>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-[16px] md:rounded-[20px] flex items-center justify-center border border-white/60 transform transition-transform hover:scale-110 duration-300 ${iconWrapprClass}`}>
                    <span className="text-2xl sm:text-3xl drop-shadow-md">{icon}</span>
                </div>
                {title}
            </h2>
            <div className="text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed space-y-5 md:space-y-6 text-gray-700">
                {children}
            </div>
        </section>
    );
};

const Bullet = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3 md:gap-4 mb-3">
        <span className="text-[18px] md:text-[20px] shrink-0 mt-0.5">✅</span>
        <span className="text-gray-700 font-medium">{children}</span>
    </li>
);

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans selection:bg-emerald-100 relative overflow-hidden z-0">
            {/* Abstract Background Elements */}
            <div className="absolute top-[-5%] left-[-10%] w-[80%] h-[50%] md:w-[60%] md:h-[60%] rounded-full bg-emerald-200/20 blur-[100px] md:blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-[-5%] right-[-10%] w-[80%] h-[50%] md:w-[60%] md:h-[60%] rounded-full bg-blue-200/20 blur-[100px] md:blur-[120px] -z-10 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 text-base sm:text-lg">
                <header className="mb-12 md:mb-16 text-center md:text-left flex flex-col items-center md:items-start relative z-10">
                    <div className="w-full flex items-center justify-start mb-6 ">
                        <Link href="/" className="p-2 -ml-2 rounded-full transition-all bg-white/30 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-95">
                            <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-4 md:mb-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white to-emerald-50 rounded-[20px] md:rounded-[24px] flex items-center justify-center shadow-[0_15px_40px_rgb(16,185,129,0.15)] border border-white/60 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                            <span className="text-3xl sm:text-4xl drop-shadow-lg">🛡️</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm text-center md:text-left">
                            Privacy Policy
                        </h1>
                    </div>

                </header>

                <main className="space-y-6 md:space-y-8 relative z-10">
                    <SectionCard icon="👋" title="1. INTRODUCTION">
                        <p className="font-bold text-gray-800 text-lg md:text-xl">Welcome to <span className="text-emerald-600 font-extrabold text-xl md:text-2xl drop-shadow-sm">ClickIn</span>.</p>
                        <p>This Privacy Policy explains how ClickIn (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects, uses, stores, and protects your information when you use our web and mobile services (the &quot;Service&quot;).</p>
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm font-medium text-gray-700 text-sm md:text-base leading-relaxed">
                            By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy.
                        </div>
                    </SectionCard>

                    <SectionCard icon="🏢" title="2. WHO WE ARE">
                        <p>ClickIn is a digital self billing platform and users to:</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mt-4">
                            <Bullet>Browse menus</Bullet>
                            <Bullet>Place orders</Bullet>
                            <Bullet>Pay vendors directly via UPI</Bullet>
                            <Bullet>Collect food seamlessly</Bullet>
                        </ul>
                        <p className="mt-6 md:mt-8 font-bold text-emerald-900 bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-3 text-sm md:text-base">
                            <span className="text-xl">🤝</span> We act as a technology facilitator, not a payment processor or wallet.
                        </p>
                    </SectionCard>

                    <SectionCard icon="🗄️" title="3. INFORMATION WE COLLECT">
                        <p className="font-bold text-gray-900 bg-gray-100/80 p-4 rounded-xl inline-flex items-center gap-2 mb-4 md:mb-6 shadow-sm text-sm md:text-base">
                            <span className="text-lg">🎯</span> We collect only what is necessary to operate the Service.
                        </p>

                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-6 md:mt-8 mb-4 md:mb-6 flex items-center gap-3">
                            <div className="w-1.5 md:w-2 h-6 md:h-8 bg-emerald-500 rounded-full shadow-[0_0_10px_rgb(16,185,129,0.5)]" />
                            A. Information You Provide
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                            {[
                                { t: "Account Info", e: "👤", d: ["Name (optional)", "Phone number", "Email address", "User role"] },
                                { t: "Order Info", e: "🛍️", d: ["Items ordered", "Quantity and price", "Shop selected", "Order status"] },
                                { t: "Vendor Info", e: "🏬", d: ["Shop name", "Shop location", "UPI ID", "Menu details"] },
                                { t: "Communication", e: "💬", d: ["Support messages", "Feedback", "Issue reports"] }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                                    <h4 className="font-bold text-gray-900 text-base md:text-lg mb-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg shadow-sm border border-gray-100">{item.e}</div>
                                        {item.t}
                                    </h4>
                                    <ul className="space-y-2.5 text-gray-600 font-medium text-sm md:text-[15px] ml-1">
                                        {item.d.map((d, j) => <li key={j} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> {d}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-8 md:mt-10 mb-4 md:mb-6 flex items-center gap-3">
                            <div className="w-1.5 md:w-2 h-6 md:h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgb(59,130,246,0.5)]" />
                            B. Collected Automatically
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                                <h4 className="font-bold text-gray-900 text-base md:text-lg mb-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg shadow-sm border border-gray-100">📱</div>
                                    Device & Usage
                                </h4>
                                <ul className="space-y-2 text-gray-600 font-medium text-sm md:text-[15px] ml-1">
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Device type</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Browser type</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> IP address</li>
                                </ul>
                            </div>
                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base md:text-lg mb-3 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg shadow-sm border border-gray-100">🍪</div>
                                        Cookies Data
                                    </h4>
                                    <p className="text-sm md:text-[15px] text-gray-600 font-medium mb-3">Used for Authentication & Session management.</p>
                                </div>
                                <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-start gap-2">
                                    <span className="text-sm">ℹ️</span> You can disable cookies, but features may break.
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="💳" title="4. PAYMENT INFO (IMPORTANT)" variant="danger">
                        <div className="bg-red-100/60 p-5 md:p-6 rounded-2xl border border-red-200 mb-6 shadow-sm">
                            <p className="font-bold text-red-900 text-lg md:text-xl mb-4 md:mb-5 flex flex-wrap items-center gap-2">
                                <span className="text-2xl drop-shadow-sm">🚫</span> We DO NOT collect:
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-red-800 font-bold ml-1 text-sm md:text-base">
                                <li className="flex items-center gap-3 bg-white/50 p-3 rounded-xl"><span className="text-lg">🔢</span> UPI PIN</li>
                                <li className="flex items-center gap-3 bg-white/50 p-3 rounded-xl"><span className="text-lg">🏦</span> Bank accounts</li>
                                <li className="flex items-center gap-3 bg-white/50 p-3 rounded-xl"><span className="text-lg">💳</span> Cards</li>
                                <li className="flex items-center gap-3 bg-white/50 p-3 rounded-xl"><span className="text-lg">💰</span> Wallet balance</li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-red-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                                <p className="font-extrabold text-gray-900 mb-4 text-base md:text-lg flex items-center gap-2"><span className="text-xl">🔄</span> How payments work:</p>
                                <ul className="space-y-3.5 text-gray-700 font-medium text-sm md:text-[15px]">
                                    <li className="flex items-start gap-3"><span className="text-lg mt-px">📱</span> Made directly from user&apos;s UPI app</li>
                                    <li className="flex items-start gap-3"><span className="text-lg mt-px">💸</span> Money goes directly to vendor</li>
                                    <li className="flex items-start gap-3"><span className="text-lg mt-px">🛑</span> We do not hold or route funds</li>
                                </ul>
                            </div>
                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-red-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                                <p className="font-extrabold text-gray-900 mb-4 text-base md:text-lg flex items-center gap-2"><span className="text-xl">🧾</span> For confirmation, we collect:</p>
                                <ul className="space-y-4 text-gray-700 font-medium text-sm md:text-[15px]">
                                    <li className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"><span className="text-lg mt-0.5">#️⃣</span> UPI UTR (reference number)</li>
                                    <li className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"><span className="text-lg mt-0.5">✅</span> Payment status</li>
                                </ul>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="⚙️" title="5. HOW WE USE YOUR INFO">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8 text-sm md:text-base">
                            <Bullet>Create & manage accounts</Bullet>
                            <Bullet>Process & manage orders</Bullet>
                            <Bullet>Display order status</Bullet>
                            <Bullet>Enable vendor fulfillment</Bullet>
                            <Bullet>Prevent fraud & misuse</Bullet>
                            <Bullet>Improve app performance</Bullet>
                            <Bullet>Provide customer support</Bullet>
                            <Bullet>Send notifications</Bullet>
                        </div>
                        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-[0_10px_30px_rgb(16,185,129,0.3)] transform transition hover:scale-[1.02]">
                            <div className="absolute top-[-20%] right-[-10%] text-9xl opacity-10">🛡️</div>
                            <p className="font-black text-xl md:text-2xl relative z-10 flex items-center justify-center gap-3 uppercase tracking-wide">
                                <span className="text-3xl">🚫</span> We NEVER sell your data.
                            </p>
                        </div>
                    </SectionCard>

                    <SectionCard icon="⚖️" title="6. LEGAL BASIS FOR PROCESSING">
                        <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                            {[
                                { t: "Contractual", d: "To provide the Service", e: "📝" },
                                { t: "Consent", d: "Where explicitly given", e: "👍" },
                                { t: "Legitimate", d: "Improving security", e: "🎯" },
                                { t: "Legal", d: "If required by law", e: "🏛️" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 md:gap-5 p-3 md:p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-2xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-lg border border-gray-200">{item.e}</div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 flex-1">
                                        <div className="font-bold text-gray-900 md:w-1/3 text-sm md:text-base">{item.t}</div>
                                        <div className="text-gray-600 font-medium text-sm md:text-[15px]">{item.d}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard icon="🔗" title="7. DATA SHARING & THIRD PARTIES">
                        <p className="font-bold text-gray-900 mb-4 md:mb-6 text-sm md:text-base">We safely share limited data for operational purposes:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8 text-sm md:text-base">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                                <div className="text-3xl mb-2">🔐</div>
                                <div className="font-bold">Authentication</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                                <div className="text-3xl mb-2">☁️</div>
                                <div className="font-bold">Database Hosting</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                                <div className="text-3xl mb-2">📊</div>
                                <div className="font-bold">Basic Analytics</div>
                            </div>
                        </div>
                        <div className="bg-emerald-50/80 p-5 md:p-6 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
                            <div className="text-4xl">🤝</div>
                            <div>
                                <p className="font-extrabold text-emerald-900 text-base md:text-lg mb-1">We do not share your data with advertisers.</p>
                                <p className="text-emerald-700 font-medium text-xs md:text-sm">All third parties follow strict data protection standards.</p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="🔒" title="8. DATA SECURITY">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 text-center text-sm md:text-base font-bold text-gray-700">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] flex items-center justify-center gap-2"><span className="text-xl">🌐</span> HTTPS Encryption</div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] flex items-center justify-center gap-2"><span className="text-xl">🔑</span> Secure Auth</div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] flex items-center justify-center gap-2"><span className="text-xl">🛡️</span> Access Control</div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] flex items-center justify-center gap-2"><span className="text-xl">💾</span> Restricted DB</div>
                        </div>
                        <div className="flex gap-4 items-start bg-amber-50 p-4 rounded-xl border border-amber-200">
                            <span className="text-2xl mt-1">⚠️</span>
                            <p className="text-xs md:text-sm text-amber-900 font-bold leading-relaxed">
                                No system is 100% secure. You are responsible for safeguarding access to your device and account.
                            </p>
                        </div>
                    </SectionCard>

                    <SectionCard icon="⏳" title="9. DATA RETENTION">
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">
                            <div className="flex-1 w-full text-sm md:text-base">
                                <ul className="space-y-3 bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <li className="flex items-center gap-3 font-medium text-gray-700"><span className="text-lg">✔️</span> Provide the Service</li>
                                    <li className="flex items-center gap-3 font-medium text-gray-700"><span className="text-lg">✔️</span> Comply with obligations</li>
                                    <li className="flex items-center gap-3 font-medium text-gray-700"><span className="text-lg">✔️</span> Resolve disputes</li>
                                </ul>
                            </div>
                            <div className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center text-center">
                                <span className="text-4xl mb-3 drop-shadow-sm">🗑️</span>
                                <p className="font-bold text-gray-900 text-sm md:text-base leading-snug">When data is no longer required, it is securely deleted.</p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="👤" title="10. YOUR RIGHTS">
                        <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8 justify-center sm:justify-start">
                            {['Access data 📄', 'Correct info ✏️', 'Delete account 🗑️', 'Withdraw consent ✋'].map(t => (
                                <span key={t} className="bg-white text-gray-800 px-4 md:px-5 py-2 md:py-2.5 border border-gray-200 rounded-xl font-bold text-xs md:text-sm shadow-sm hover:shadow-md transition-shadow hover:border-emerald-200">{t}</span>
                            ))}
                        </div>
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-[-20px] right-[-20px] text-8xl opacity-10">📧</div>
                            <p className="font-extrabold text-base md:text-xl relative z-10 text-center md:text-left">Contact us to exercise rights:</p>
                            <a href="mailto:support@clickin.app" className="relative z-10 bg-white text-gray-900 font-extrabold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-[0_0_20px_rgb(255,255,255,0.3)] hover:scale-105 transition-transform text-sm md:text-base whitespace-nowrap">
                                clickinsupport@gmail.com
                            </a>
                        </div>
                    </SectionCard>

                    <SectionCard icon="👶" title="11. CHILDREN'S PRIVACY">
                        <div className="flex items-center gap-4 md:gap-6 bg-gradient-to-r from-purple-50 to-pink-50 p-5 md:p-8 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 text-9xl opacity-[0.03] rotate-12">🚸</div>
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-500 text-2xl md:text-3xl shadow-md border border-purple-100 shrink-0 transform -rotate-3">13+</div>
                            <div className="relative z-10">
                                <p className="font-black text-purple-900 text-base md:text-xl mb-1 md:mb-2">Service intended for ages 13+</p>
                                <p className="text-xs md:text-base font-medium text-purple-800/80">We do not knowingly collect data from children under 13.</p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="🔄" title="12. CHANGES TO POLICY">
                        <p className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 font-medium mb-4 md:mb-6 shadow-sm text-sm md:text-base text-gray-600">
                            We may update this Privacy Policy from time to time. Any significant changes will be communicated via the app or website.
                        </p>
                        <p className="font-bold text-center border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-900 p-4 md:p-6 rounded-2xl text-sm md:text-lg">
                            Continued use of the Service means acceptance of the updated policy.
                        </p>
                    </SectionCard>

                    <SectionCard icon="📫" title="13. CONTACT US">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <a href="mailto:support@clickin.app" className="group flex items-center gap-4 bg-white p-5 md:p-6 rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="text-3xl md:text-4xl bg-gray-50 p-3 rounded-xl shadow-inner group-hover:bg-emerald-50 transition-colors">✉️</div>
                                <div>
                                    <div className="text-s md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Email directly</div>
                                    <div className="font-black text-gray-900 text-xs md:text-lg group-hover:text-emerald-700 transition-colors">clickinsupport@gmail.com</div>
                                </div>
                            </a>
                            <div className="flex items-center gap-4 bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="text-3xl md:text-4xl bg-gray-50 p-3 rounded-xl shadow-inner">📍</div>
                                <div>
                                    <div className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Located In</div>
                                    <div className="font-black text-gray-900 text-sm md:text-lg">India</div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                    <div className="md:ml-[104px] inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold border border-emerald-100 shadow-sm mt-2 text-xs sm:text-sm">
                        <span className="text-sm sm:text-base">🕒</span>
                        <span>Last updated: February 14, 2026</span>
                    </div>
                </main>
            </div>
        </div>
    );
}

