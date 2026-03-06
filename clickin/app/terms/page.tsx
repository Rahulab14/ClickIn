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
    } else if (variant === 'warning') {
        cardClass = "bg-[#FFFbeb] border-amber-100 hover:border-amber-200 hover:shadow-xl";
        titleClass = "text-amber-700";
        iconWrapprClass = "shadow-[0_8px_30px_rgb(245,158,11,0.12)] bg-gradient-to-br from-white to-amber-50/50";
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

export default function TermsPage() {
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
                            <span className="text-3xl sm:text-4xl drop-shadow-lg">📜</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm text-center md:text-left">
                            Terms of Service
                        </h1>
                    </div>

                </header>

                <main className="space-y-6 md:space-y-8 relative z-10">
                    <SectionCard icon="🤝" title="1. INTRODUCTION">
                        <p className="font-bold text-gray-800 text-lg md:text-xl">Welcome to <span className="text-emerald-600 font-extrabold drop-shadow-sm text-xl md:text-2xl">ClickIn</span>.</p>
                        <p>These Terms of Service ("Terms") govern your access to and use of the ClickIn website, mobile application, and related services (collectively, the "Service").</p>
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm font-medium text-gray-700 text-sm md:text-base leading-relaxed">
                            By accessing or using the Service, creating an account, or placing an order, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use the Service.
                        </div>
                    </SectionCard>

                    <SectionCard icon="📖" title="2. DEFINITIONS">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-sm md:text-base">
                            <div className="bg-white p-4 rounded-xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-2xl mb-2">📱</div>
                                <strong className="text-gray-900 block mb-1">"Platform"</strong>
                                <span className="text-gray-600">Website & mobile app</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-2xl mb-2">👤</div>
                                <strong className="text-gray-900 block mb-1">"User"</strong>
                                <span className="text-gray-600">Any person using it</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-2xl mb-2">🛍️</div>
                                <strong className="text-gray-900 block mb-1">"Customer"</strong>
                                <span className="text-gray-600">User ordering food</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-2xl mb-2">🏪</div>
                                <strong className="text-gray-900 block mb-1">"Vendor"</strong>
                                <span className="text-gray-600">Shop listing menus</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-2xl mb-2">🧑‍🍳</div>
                                <strong className="text-gray-900 block mb-1">"Staff"</strong>
                                <span className="text-gray-600">Vendor employees</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-2xl mb-2">🍽️</div>
                                <strong className="text-gray-900 block mb-1">"Order"</strong>
                                <span className="text-gray-600">Food request placed</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-3 border-l-4 border-emerald-400">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl shrink-0">💸</div>
                                    <div>
                                        <strong className="text-gray-900 block">"UPI Payment"</strong>
                                        <span className="text-gray-600">Payment made directly from Customer to Vendor</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="✅" title="3. ELIGIBILITY">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mt-4 text-sm md:text-base">
                            <Bullet>Must be 13 years or older</Bullet>
                            <Bullet>Must provide accurate information</Bullet>
                            <Bullet>Vendors must have legal authority</Bullet>
                        </ul>
                        <div className="mt-4 md:mt-6 flex items-start sm:items-center gap-3 bg-amber-50/80 p-4 shrink-0 rounded-xl border border-amber-200">
                            <span className="text-2xl mt-1 sm:mt-0">⚠️</span>
                            <p className="font-bold text-amber-900 leading-snug">
                                We reserve the right to suspend or terminate accounts that violate these Terms.
                            </p>
                        </div>
                    </SectionCard>

                    <SectionCard icon="⚠️" title="4. NATURE OF THE PLATFORM" variant="danger">
                        <p className="font-bold text-lg md:text-xl text-red-900 text-center uppercase tracking-widest bg-white p-4 rounded-2xl border border-red-200 shadow-sm mb-6 md:mb-8">
                            We are a technology platform only.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-emerald-100 shadow-[0_4px_15px_rgb(16,185,129,0.05)] text-sm md:text-base border-t-4 border-t-emerald-500">
                                <h4 className="font-black text-emerald-800 mb-4 flex items-center gap-2 text-xl"><span className="text-2xl drop-shadow-sm">✅</span> We Do:</h4>
                                <ul className="space-y-3 font-medium text-gray-700">
                                    <li className="flex gap-2"><span>•</span> Enable discovery of shops/menus</li>
                                    <li className="flex gap-2"><span>•</span> Facilitate order placement</li>
                                    <li className="flex gap-2"><span>•</span> Provide digital verification (QR / ID)</li>
                                </ul>
                            </div>

                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-red-100 shadow-[0_4px_15px_rgb(239,68,68,0.05)] text-sm md:text-base border-t-4 border-t-red-500">
                                <h4 className="font-black text-red-800 mb-4 flex items-center gap-2 text-xl"><span className="text-2xl drop-shadow-sm">❌</span> We DO NOT:</h4>
                                <ul className="space-y-3 font-medium text-gray-700">
                                    <li className="flex gap-2"><span>•</span> Process payments or hold funds</li>
                                    <li className="flex gap-2"><span>•</span> Act as a wallet, bank, or escrow</li>
                                    <li className="flex gap-2"><span>•</span> Control vendor pricing/preparation</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 md:mt-8 font-black text-gray-900 bg-gradient-to-r from-gray-100 to-gray-200 p-5 rounded-xl border border-gray-300 text-center text-sm md:text-lg uppercase tracking-wide shadow-inner flex items-center justify-center gap-3">
                            <span className="text-3xl drop-shadow-md">🤝</span> <span>All payments happen directly between Customer and Vendor.</span>
                        </div>
                    </SectionCard>

                    <SectionCard icon="🔐" title="5. ACCOUNT REGISTRATION & SECURITY">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 text-sm md:text-base">
                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">1️⃣</div>
                                    Account Creation
                                </h3>
                                <div className="space-y-3 pl-2">
                                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl font-bold flex gap-3 items-center"><span className="text-xl">🛍️</span> Customer</div>
                                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl font-bold flex gap-3 items-center"><span className="text-xl">🏪</span> Vendor</div>
                                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl font-bold flex gap-3 items-center"><span className="text-xl">🧑‍🍳</span> Vendor Staff</div>
                                </div>
                            </div>
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 text-sm md:text-base">
                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">2️⃣</div>
                                    Responsibility
                                </h3>
                                <p className="font-bold text-gray-800 mb-3">You agree to:</p>
                                <ul className="space-y-3 font-medium text-gray-600 pl-1">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Keep credentials secure</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Not share accounts</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Notify us of unauthorized access</li>
                                </ul>
                                <p className="mt-4 font-bold bg-amber-50 p-2 text-xs md:text-sm text-center rounded-lg border border-amber-200 text-amber-900">
                                    You are responsible for all actions under your account.
                                </p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="🍔" title="6. ORDERS & PAYMENTS">
                        <div className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-6 md:mb-8 text-sm md:text-base">
                            <h3 className="text-lg md:text-xl font-black flex items-center gap-3 mb-6">
                                <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                                Order Flow
                            </h3>
                            <div className="flex flex-wrap gap-2 md:gap-3">
                                {[
                                    { t: 'Select shop', i: '🏪' },
                                    { t: 'Pick items', i: '🛒' },
                                    { t: 'Summary gen', i: '🧾' },
                                    { t: 'Pay via UPI', i: '💸' },
                                    { t: 'ID generated', i: '🪪' },
                                    { t: 'Food prepared', i: '🍳' }
                                ].map((step, i) => (
                                    <div key={i} className="flex-1 min-w-[140px] bg-gray-50 border border-gray-200 p-3 md:p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 text-center hover:bg-emerald-50 transition-colors">
                                        <div className="text-2xl drop-shadow-sm">{step.i}</div>
                                        <div className="font-bold text-gray-800 leading-tight">
                                            <span className="text-emerald-600 mr-1">{i + 1}.</span>
                                            {step.t}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm md:text-base">
                            <div className="bg-white p-5 md:p-6 rounded-[24px] border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-black flex items-center gap-2 mb-4">
                                    <div className="text-xl">💳</div> Payments
                                </h3>
                                <ul className="space-y-3 font-medium text-gray-600">
                                    <li className="flex gap-2"><span className="shrink-0">•</span> Made using third-party UPI apps</li>
                                    <li className="flex gap-2"><span className="shrink-0">•</span> ClickIn does not store payment credentials</li>
                                    <li className="flex gap-2 text-red-600"><span className="shrink-0">•</span> We are not responsible for failed UPI transactions</li>
                                </ul>
                            </div>

                            <div className="bg-white p-5 md:p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col">
                                <h3 className="text-lg font-black flex items-center gap-2 mb-4">
                                    <div className="text-xl">✅</div> Confirmation
                                </h3>
                                <ul className="space-y-3 font-medium text-gray-600 mb-4">
                                    <li className="flex gap-2"><span className="shrink-0">•</span> Confirm payment locally</li>
                                    <li className="flex gap-2"><span className="shrink-0">•</span> Provide UPI UTR when requested</li>
                                </ul>
                                <div className="mt-auto bg-red-50 p-3 rounded-xl border border-red-100 text-xs md:text-sm font-bold text-red-800 flex items-center justify-center gap-2 shadow-sm">
                                    <span className="text-lg">🛑</span> False claims result in suspension.
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="📱" title="7. ORDER VERIFICATION" variant="warning">
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center text-sm md:text-base">
                            <div className="flex-1 w-full bg-white p-6 md:p-8 rounded-3xl border border-amber-100 shadow-[0_8px_30px_rgb(245,158,11,0.08)]">
                                <p className="font-extrabold text-amber-900 mb-6 text-center text-lg md:text-xl">Digitally verified via:</p>
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                                    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-amber-200 px-6 py-4 rounded-xl shadow-md text-amber-900 font-black flex gap-2 w-full justify-center"><span className="text-2xl drop-shadow-sm">🔲</span> QR CODE</div>
                                    <span className="font-black text-amber-600 bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-amber-200 shadow-sm">OR</span>
                                    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-amber-200 px-6 py-4 rounded-xl shadow-md text-amber-900 font-black flex gap-2 w-full justify-center"><span className="text-2xl drop-shadow-sm">🔢</span> ID / OTP</div>
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-4">
                                <div className="bg-white p-4 md:p-5 rounded-2xl border border-amber-100 shadow-sm flex items-start sm:items-center gap-4">
                                    <div className="text-3xl shrink-0">👍</div>
                                    <p className="font-bold text-gray-800 leading-snug">Vendors must verify before preparing food.</p>
                                </div>
                                <div className="bg-red-50 p-4 md:p-5 rounded-2xl border border-red-200 shadow-sm flex items-start sm:items-center gap-4">
                                    <div className="text-3xl shrink-0">🚫</div>
                                    <p className="font-bold text-red-900 leading-snug"> Reused QR codes, or fraud attempts are lead to suspension account.</p>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="💸" title="8. CANCELLATIONS & REFUNDS">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm md:text-base">
                            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                                <div className="absolute top-[-10px] right-[-10px] text-5xl opacity-10 group-hover:scale-110 transition-transform">🛍️</div>
                                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                    Customer Side
                                </h3>
                                <ul className="space-y-3 font-medium text-gray-600 relative z-10">
                                    <li className="flex gap-2"><span>•</span> Cancellation depends on vendor policy</li>
                                    <li className="flex gap-2 bg-gray-50 p-2 rounded-lg font-bold text-gray-800 mt-4">ClickIn does not guarantee refunds</li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
                                <div className="absolute top-[-10px] right-[-10px] text-5xl opacity-10 group-hover:scale-110 transition-transform">🏪</div>
                                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                    Vendor Side
                                </h3>
                                <ul className="space-y-3 font-medium text-gray-600 relative z-10">
                                    <li className="flex gap-2"><span>•</span> Vendors are responsible for refunds</li>
                                    <li className="flex gap-2"><span>•</span> All refunds happen outside the platform</li>
                                    <li className="flex gap-2 bg-gray-50 p-2 rounded-lg font-bold text-gray-800 mt-4">ClickIn is not liable for refund disputes</li>
                                </ul>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="🏪" title="9. VENDOR OBLIGATIONS">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-5 text-sm md:text-base">
                            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm font-bold text-gray-800"><span className="text-2xl drop-shadow-sm">📋</span> Accurate menus</div>
                            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm font-bold text-gray-800"><span className="text-2xl drop-shadow-sm">🔍</span> Verify then prepare</div>
                            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm font-bold text-gray-800"><span className="text-2xl drop-shadow-sm">🧼</span> Food hygiene</div>
                            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm font-bold text-gray-800"><span className="text-2xl drop-shadow-sm">🤝</span> Honor orders</div>
                        </div>
                        <p className="text-center bg-gray-50 p-4 rounded-xl font-bold border border-gray-200 text-gray-500 text-sm md:text-base shadow-inner">
                            ℹ️ ClickIn does not guarantee vendor quality or availability.
                        </p>
                    </SectionCard>

                    <SectionCard icon="👩‍🍳" title="10. STAFF ACCOUNTS">
                        <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-sm md:text-base">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl border border-emerald-100 shrink-0 drop-shadow-sm">🧑‍💼</div>
                            <ul className="space-y-2 font-medium">
                                <li className="flex gap-2 bg-gray-50 p-2 rounded-lg"><span>•</span> Staff controlled entirely by Vendors</li>
                                <li className="flex gap-2 bg-gray-50 p-2 rounded-lg"><span>•</span> Vendors responsible for all staff actions</li>
                                <li className="flex gap-2 bg-gray-50 p-2 rounded-lg"><span>•</span> ClickIn not liable for staff misuse</li>
                            </ul>
                        </div>
                    </SectionCard>

                    <SectionCard icon="🛑" title="11. USER CONDUCT (PROHIBITED)" variant="danger">
                        <div className="bg-red-100/60 p-5 md:p-6 rounded-2xl border border-red-200 mb-6 shadow-sm">
                            <div className="absolute -right-4 -top-4 text-9xl opacity-5 drop-shadow-lg">🚫</div>
                            <p className="font-black text-grey mb-6 text-xl tracking-wide uppercase">You must NOT:</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 font-bold text-sm md:text-base mb-6 md:mb-8 relative z-10">
                                <li className="flex gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"><span className="text-lg pb-1">❌</span> Fake payment proof</li>
                                <li className="flex gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"><span className="text-lg pb-1">❌</span> Manipulate orders</li>
                                <li className="flex gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"><span className="text-lg pb-1">❌</span> Harass others</li>
                                <li className="flex gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"><span className="text-lg pb-1">❌</span> Upload malicious content</li>
                            </ul>
                            <div className="font-black text-red-100 bg-red-600/60 p-4 rounded-xl border border-red-500 text-center text-sm md:text-lg uppercase tracking-wider relative z-10 shadow-lg flex items-center justify-center gap-3">
                                <span>🚨</span> Violation may lead to permanent ban.
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="✍️" title="12. USER CONTENT">
                        <div className="flex gap-3 flex-wrap mb-4 md:mb-6 justify-center sm:justify-start">
                            <span className="bg-white flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 shadow-sm"><span className="text-lg drop-shadow-sm">📝</span> Profile details</span>
                            <span className="bg-white flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 shadow-sm"><span className="text-lg drop-shadow-sm">💭</span> Feedback</span>
                            <span className="bg-white flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 shadow-sm"><span className="text-lg drop-shadow-sm">⭐</span> Reviews</span>
                        </div>
                        <div className="bg-gray-50 flex flex-col md:flex-row gap-4 p-5 md:p-6 rounded-2xl border border-gray-200 items-center text-center sm:text-left text-sm md:text-base">
                            <div className="text-4xl shrink-0 drop-shadow-sm">⚖️</div>
                            <div>
                                You grant ClickIn a non-exclusive, royalty-free license to use content for operations.
                                <span className="block mt-2 font-black text-emerald-800 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">You retain ownership of your content.</span>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="©️" title="13. INTELLECTUAL PROPERTY">
                        <div className="flex gap-3 flex-wrap mb-4 md:mb-6 justify-center sm:justify-start">
                            <span className="bg-gradient-to-br from-emerald-50 to-white text-emerald-900 px-5 py-3 rounded-xl font-black text-sm border border-emerald-200 shadow-sm flex items-center gap-2">Logo</span>
                            <span className="bg-gradient-to-br from-emerald-50 to-white text-emerald-900 px-5 py-3 rounded-xl font-black text-sm border border-emerald-200 shadow-sm flex items-center gap-2">UI design</span>
                            <span className="bg-gradient-to-br from-emerald-50 to-white text-emerald-900 px-5 py-3 rounded-xl font-black text-sm border border-emerald-200 shadow-sm flex items-center gap-2">Code</span>
                            <span className="bg-gradient-to-br from-emerald-50 to-white text-emerald-900 px-5 py-3 rounded-xl font-black text-sm border border-emerald-200 shadow-sm flex items-center gap-2">Branding</span>
                        </div>
                        <p className="font-extrabold text-white bg-gray-900 p-4 md:p-5 text-center sm:text-left rounded-xl shadow-lg flex items-center justify-center gap-3 text-sm md:text-base">
                            <span className="text-2xl">⛔</span> Belongs to ClickIn and may not be copied without permission.
                        </p>
                    </SectionCard>

                    <SectionCard icon="🔌" title="14. THIRD-PARTY SERVICES">
                        <ul className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
                            <li className="font-bold flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-4 w-full rounded-xl shadow-sm"><span className="text-2xl drop-shadow-sm">🏦</span> UPI apps</li>
                            <li className="font-bold flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-4 w-full rounded-xl shadow-sm"><span className="text-2xl drop-shadow-sm">☁️</span> Hosting</li>
                            <li className="font-bold flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-4 w-full rounded-xl shadow-sm"><span className="text-2xl drop-shadow-sm">📊</span> Analytics</li>
                        </ul>
                        <p className="text-center font-bold text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm md:text-base">
                            We are not responsible for third-party service failures.
                        </p>
                    </SectionCard>

                    <SectionCard icon="🔨" title="15. TERMINATION" variant="danger">
                        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-red-100 mb-6 text-sm md:text-base">
                            <p className="font-black mb-4">We may terminate accounts if:</p>
                            <ul className="space-y-3 font-medium text-gray-700 ml-1">
                                <li className="flex gap-3 items-center"><span className="text-lg">❌</span> Terms are violated</li>
                                <li className="flex gap-3 items-center"><span className="text-lg">🕵️</span> Fraud is detected</li>
                                <li className="flex gap-3 items-center"><span className="text-lg">🏛️</span> Legal compliance requires it</li>
                            </ul>
                        </div>
                        <div className="font-black text-center text-red-900 bg-red-100 p-4 md:p-5 rounded-xl border border-red-200 shadow-sm uppercase tracking-wider text-sm md:text-base flex items-center justify-center gap-3">
                            <span className="text-2xl drop-shadow-sm">⚡</span> Termination may occur without notice.
                        </div>
                    </SectionCard>

                    <SectionCard icon="🤷" title="16. DISCLAIMER OF WARRANTIES">
                        <div className="font-black text-center uppercase tracking-widest text-xs md:text-sm text-gray-500 mb-6 md:mb-8 bg-gray-100 p-4 rounded-xl border border-gray-200 shadow-inner">
                            Service provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;.
                        </div>

                        <p className="font-extrabold mb-4 text-center text-sm md:text-base">We do not guarantee:</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 text-sm md:text-base">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-center shadow-[0_4px_10px_rgb(0,0,0,0.03)] flex flex-col items-center gap-2"><span className="text-2xl drop-shadow-sm">⏱️</span> Uptime</div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-center shadow-[0_4px_10px_rgb(0,0,0,0.03)] flex flex-col items-center gap-2"><span className="text-2xl drop-shadow-sm">🐛</span> No Bugs</div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-center shadow-[0_4px_10px_rgb(0,0,0,0.03)] flex flex-col items-center gap-2"><span className="text-2xl drop-shadow-sm">👨‍🍳</span> Vendors</div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-center shadow-[0_4px_10px_rgb(0,0,0,0.03)] flex flex-col items-center gap-2"><span className="text-2xl drop-shadow-sm">💯</span> Payments</div>
                        </div>

                        <div className="font-black text-white bg-gray-900 p-5 rounded-xl border border-gray-800 text-center uppercase tracking-wider shadow-lg flex items-center justify-center gap-3 text-sm md:text-base">
                            <span className="text-2xl drop-shadow">⚠️</span> Use the Service save and secure.
                        </div>
                    </SectionCard>

                    <SectionCard icon="🛡️" title="17. LIMITATION OF LIABILITY">
                        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-sm md:text-base">
                            <p className="font-black text-center text-gray-900 bg-gray-50 p-4 rounded-xl mb-6 md:mb-8 border border-gray-200 text-sm md:text-base uppercase tracking-wide">
                                To maximum extent permitted by law:
                            </p>

                            <p className="font-bold text-center mb-4 text-lg">We are not liable for:</p>

                            <ul className="flex flex-wrap gap-2 md:gap-3 justify-center mb-6 md:mb-8">
                                <li className="bg-gray-50 px-4 md:px-5 py-2 md:py-3 border border-gray-200 rounded-xl font-bold flex items-center gap-2 shadow-sm"><span className="text-lg drop-shadow-sm">💸</span> Payment disputes</li>
                                <li className="bg-gray-50 px-4 md:px-5 py-2 md:py-3 border border-gray-200 rounded-xl font-bold flex items-center gap-2 shadow-sm"><span className="text-lg drop-shadow-sm">🤢</span> Food quality</li>
                                <li className="bg-gray-50 px-4 md:px-5 py-2 md:py-3 border border-gray-200 rounded-xl font-bold flex items-center gap-2 shadow-sm"><span className="text-lg drop-shadow-sm">🐢</span> Order delays</li>
                                <li className="bg-gray-50 px-4 md:px-5 py-2 md:py-3 border border-gray-200 rounded-xl font-bold flex items-center gap-2 shadow-sm"><span className="text-lg drop-shadow-sm">😠</span> Misconduct</li>
                                <li className="bg-gray-50 px-4 md:px-5 py-2 md:py-3 border border-gray-200 rounded-xl font-bold flex items-center gap-2 shadow-sm"><span className="text-lg drop-shadow-sm">💰</span> Losses</li>
                            </ul>

                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 md:p-6 rounded-2xl font-black text-white text-center shadow-xl border border-gray-700 relative overflow-hidden">
                                <div className="absolute left-[-10px] bottom-[-20px] text-7xl opacity-10">⚖️</div>
                                <div className="relative z-10 text-sm md:text-lg leading-snug">
                                    Total liability strictly led pay to fine or the amount paid to us, whichever is lower.
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon="🏛️" title="18. GOVERNING LAW & MORE">
                        <div className="space-y-4 md:space-y-6 text-sm md:text-base">
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
                                <div className="text-5xl shrink-0 drop-shadow-md">🇮🇳</div>
                                <div>
                                    <h4 className="font-black text-lg text-gray-900 mb-1">Governing Law</h4>
                                    <p className="font-medium text-gray-700 leading-snug">Regulated by laws of India. Exclusive jurisdiction to Indian courts.</p>
                                </div>
                            </div>

                            <div className="bg-emerald-50/50 p-5 md:p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
                                <div className="text-5xl shrink-0 drop-shadow-md">🔄</div>
                                <div>
                                    <h4 className="font-black text-lg text-emerald-900 mb-1">Privacy & Updates</h4>
                                    <p className="font-medium text-emerald-800 leading-snug">Use governed by <Link href="/privacy-policy" className="font-black underline decoration-2 underline-offset-2">Privacy Policy</Link>. Continued use means accepting updates.</p>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 p-5 md:p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
                                <div className="text-5xl shrink-0 drop-shadow-md">💌</div>
                                <div className="w-full">
                                    <h4 className="font-black text-lg text-blue-900 mb-3">Reach Out</h4>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <a href="mailto:support@clickin.app" className="bg-white w-full border border-blue-200 py-3 rounded-xl font-bold text-blue-800 hover:bg-blue-100 transition-colors shadow-[0_2px_10px_rgb(59,130,246,0.1)]">clickinsupport@gmail.com</a>
                                    </div>
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
