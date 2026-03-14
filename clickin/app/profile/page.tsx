"use client";

import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Package,
  Clock,
  CreditCard,
  FileText,
  LogOut,
  HelpCircle,
  MessageCircle,
  AlertTriangle,
  ChevronRight,
  Settings,
  Bell,
  Globe,
  ShieldCheck,
  Edit2,
  Sparkles,
  Zap,
  ArrowLeft,
  Star,
  Gift,
  TrendingUp,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  loginMethod: string;
  memberSince: string;
  totalOrders: number;
  loyaltyPoints: number;
  photoURL: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Guest',
    email: '',
    phone: '',
    loginMethod: 'Guest',
    memberSince: '',
    totalOrders: 0,
    loyaltyPoints: 0,
    photoURL: '',
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch real user data from Firebase Auth + Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile({
          name: 'Guest',
          email: '',
          phone: '',
          loginMethod: 'Guest',
          memberSince: '',
          totalOrders: 0,
          loyaltyPoints: 0,
          photoURL: '',
        });
        return;
      }

      // Determine login method from providerData
      const provider = user.providerData?.[0]?.providerId || 'password';
      let loginMethod = 'Email';
      if (provider === 'google.com') loginMethod = 'Google';
      else if (provider === 'facebook.com') loginMethod = 'Facebook';
      else if (provider === 'apple.com') loginMethod = 'Apple';
      else if (provider === 'phone') loginMethod = 'Phone Number';

      // Start with Firebase Auth data
      let name = user.displayName || user.email?.split('@')[0] || 'User';
      let email = user.email || '';
      let phone = user.phoneNumber || '';
      let photoURL = user.photoURL || '';
      let memberSince = '';
      let totalOrders = 0;
      let loyaltyPoints = 0;

      // Try Firestore for richer profile data
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          name = data.fullName || name;
          phone = data.phone || phone;
          photoURL = data.photoURL || photoURL;
          totalOrders = data.totalOrders || 0;
          loyaltyPoints = data.loyaltyPoints || 0;
          if (data.createdAt) {
            const date = new Date(data.createdAt);
            memberSince = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          }
        }
      } catch (err) {
        console.warn('Could not fetch Firestore profile:', err);
      }

      // Fallback memberSince from Firebase Auth metadata
      if (!memberSince && user.metadata?.creationTime) {
        const date = new Date(user.metadata.creationTime);
        memberSince = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      // Fallback avatar
      if (!photoURL) {
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        photoURL = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=6366f1`;
      }

      setProfile({ name, email, phone, loginMethod, memberSince, totalOrders, loyaltyPoints, photoURL });
      setEditEmail(email);
    };

    fetchProfile();
  }, [user]);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfile(prev => ({ ...prev, photoURL: reader.result as string }));
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1500);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const MenuRow = ({
    icon,
    iconBg,
    iconColor,
    label,
    sub,
    badge,
    href,
    onClick,
    danger,
  }: {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    label: string;
    sub?: string;
    badge?: string;
    href?: string;
    onClick?: () => void;
    danger?: boolean;
  }) => {
    const inner = (
      <div className={`group flex items-center gap-4 px-5 py-4 transition-all cursor-pointer ${danger ? 'hover:bg-red-50/80 active:bg-red-100/80' : 'hover:bg-gray-50/80 active:bg-gray-100/80'} relative overflow-hidden`}>
        <div className={`w-11 h-11 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-black/[0.03]`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-[15px] tracking-tight ${danger ? 'text-red-[550]' : 'text-gray-800 group-hover:text-black'} transition-colors`}>{label}</p>
          {sub && <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{sub}</p>}
        </div>
        {badge && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{badge}</span>
        )}
        <ChevronRight size={18} className={`flex-shrink-0 transition-all duration-300 group-hover:translate-x-1 ${danger ? 'text-red-300' : 'text-gray-300 group-hover:text-gray-500'}`} />
      </div>
    );
    return href ? <Link href={href} className="block w-full">{inner}</Link> : <div onClick={onClick} className="w-full">{inner}</div>;
  };

  const isGuest = !user;

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 bg-[#f8fafc] pb-24">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* ── Premium Hero Header ── */}
      <section className="relative overflow-visible pb-20 pt-0 bg-gray-900 rounded-b-[40px] shadow-sm z-10 transition-all duration-500">
        {/* Dynamic Gradient background */}
        <div className="absolute inset-x-0 top-0 h-[150%] rounded-b-[40px] opacity-80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-gray-900 to-black" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        {/* Top Navbar */}
        <div className="relative z-20 flex items-center justify-between px-6 pt-12 pb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-base font-bold text-white tracking-wide"
          >
            Profile
          </motion.h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-transparent pointer-events-none"
          >
            <Settings size={18} />
          </motion.button>
        </div>

        {/* Avatar + Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
          className="relative z-20 flex flex-col items-center px-6 mt-2"
        >
          {/* Avatar with Animated Glow */}
          <div className="relative group cursor-pointer mb-4" onClick={!isGuest ? handlePhotoClick : undefined}>
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-pink-500 via-indigo-500 to-cyan-500 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-28 h-28 rounded-full border-4 border-gray-900 shadow-2xl overflow-hidden bg-indigo-200 relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
              {isUploading && (
                <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                </div>
              )}
              {(isGuest || !profile.photoURL) ? (
                <div className="w-full h-full flex items-center justify-center bg-indigo-300">
                  <UserIcon size={46} className="text-white/80" />
                </div>
              ) : (
                <Image src={profile.photoURL} alt="Profile" fill className={`object-cover transition-all duration-700 group-hover:scale-110 ${isUploading ? 'blur-sm' : ''}`} />
              )}
            </div>
            {!isGuest && (
              <div className="absolute bottom-1 right-1 z-20 bg-gray-900 p-2 rounded-full shadow-lg border-2 border-gray-800 text-white hover:bg-gray-800 transition-colors">
                <Edit2 size={12} />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-1.5 tracking-tight">
            {profile.name}
            {!isGuest && <Sparkles size={18} className="text-amber-400 fill-amber-400" />}
          </h2>

          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {profile.phone && (
              <div className="flex items-center gap-1.5 text-white/90 text-[13px] font-medium bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                <Phone size={13} className="text-white/80" />
                <span>{profile.phone}</span>
              </div>
            )}

            {profile.email ? (
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all border ${isEditingEmail ? 'bg-white/20 backdrop-blur-md border-white/40' : 'bg-white/10 backdrop-blur-md border-white/10 hover:bg-white/15'}`}>
                <Mail size={13} className="text-white/80" />
                {isEditingEmail ? (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    onBlur={() => setIsEditingEmail(false)}
                    autoFocus
                    className="text-[13px] text-white bg-transparent outline-none w-[180px] placeholder-white/50"
                  />
                ) : (
                  <span className="text-[13px] text-white/90 cursor-pointer font-medium flex items-center gap-1.5" onClick={() => setIsEditingEmail(true)}>
                    {editEmail}
                    <Edit2 size={10} className="opacity-60 hover:opacity-100 transition-opacity ml-0.5" />
                  </span>
                )}
              </div>
            ) : (
              <div className="text-[13px] text-white/60 font-medium px-3.5 py-1.5 bg-white/5 rounded-full border border-white/5">Not signed in</div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Stats Floating Card ── */}
      <div className="relative z-30 px-5 -mt-10 mb-8 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-xl shadow-gray-200/50 border border-white p-2.5 flex justify-between"
        >
          {[
            { icon: <Package size={20} className="text-indigo-600" />, value: profile.totalOrders, label: 'Orders', bg: 'bg-indigo-50 border border-indigo-100' },
            { icon: <Star size={20} className="text-amber-500 fill-amber-400" />, value: profile.loyaltyPoints, label: 'Points', bg: 'bg-amber-50 border border-amber-100' },
            { icon: <Gift size={20} className="text-rose-500" />, value: profile.memberSince || '—', label: 'Member', bg: 'bg-rose-50 border border-rose-100' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-4 px-2 w-full rounded-[20px] transition-all hover:bg-white hover:shadow-sm cursor-default group">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>{stat.icon}</div>
              <span className="font-extrabold text-gray-900 text-lg leading-tight">{stat.value}</span>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Content Sections ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xl mx-auto px-5 space-y-6"
      >
        {/* Guest CTA */}
        {isGuest && (
          <motion.section variants={sectionVariants} className="bg-gradient-to-br from-indigo-50 to-white rounded-[28px] shadow-sm overflow-hidden border border-indigo-100/60 p-7 text-center relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm pointer-events-none">
              <Sparkles size={100} className="text-indigo-500" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Personalize Your Experience</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed font-medium">Sign in to save your liked items, track orders, and access personalized recommendations.</p>
              <Link href="/signin" className="inline-flex items-center justify-center w-full mt-4 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold text-[15px] hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-[0.98]">
                Continue / Sign In
              </Link>
            </div>
          </motion.section>
        )}

        {/* Account Settings */}
        <motion.section variants={sectionVariants} className="bg-white rounded-[28px] shadow-sm shadow-gray-200/40 overflow-hidden border border-gray-100">
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-gray-300" />
              General
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            <MenuRow href="/orders" icon={<Package size={20} />} iconBg="bg-[#f0f9ff]" iconColor="text-[#0284c7]" label="My Orders" sub="Track & view your order history" badge={profile.totalOrders > 0 ? String(profile.totalOrders) : undefined} />
            <MenuRow icon={<Clock size={20} />} iconBg="bg-[#fffbeb]" iconColor="text-[#d97706]" label="Active Order" sub="No active orders right now" />
            <MenuRow icon={<TrendingUp size={20} />} iconBg="bg-[#ecfdf5]" iconColor="text-[#059669]" label="Loyalty Rewards" sub={`${profile.loyaltyPoints} pts · Redeem now`} badge="NEW" />
          </div>
        </motion.section>

        {/* Payments */}
        <motion.section variants={sectionVariants} className="bg-white rounded-[28px] shadow-sm shadow-gray-200/40 overflow-hidden border border-gray-100">
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={14} className="text-gray-300" />
              Finance
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            <MenuRow icon={<CreditCard size={20} />} iconBg="bg-[#faf5ff]" iconColor="text-[#9333ea]" label="Payment Methods" sub="Cards, UPI & Wallets" />
            <MenuRow icon={<FileText size={20} />} iconBg="bg-[#f8fafc]" iconColor="text-[#475569]" label="Billing History" sub="View past receipts" />
          </div>
        </motion.section>

        {/* Settings */}
        <motion.section variants={sectionVariants} className="bg-white rounded-[28px] shadow-sm shadow-gray-200/40 overflow-hidden border border-gray-100">
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Settings size={14} className="text-gray-300" />
              Preferences
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {/* Notifications toggle */}
            <div className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-[#fdf2f8] text-[#db2777] flex items-center justify-center flex-shrink-0 shadow-sm border border-black/[0.03]">
                <Bell size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] tracking-tight text-gray-800">Push Notifications</p>
                <p className="text-xs text-gray-400 font-medium">Updates & promotions</p>
              </div>
              <button
                onClick={() => setNotificationsOn(v => !v)}
                className={`w-[46px] h-7 rounded-full relative transition-colors duration-300 ${notificationsOn ? 'bg-[#10b981]' : 'bg-gray-200'}`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                  style={{ left: notificationsOn ? 'calc(100% - 24px)' : '4px' }}
                />
              </button>
            </div>
            <div className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center flex-shrink-0 shadow-sm border border-black/[0.03]">
                <Globe size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] tracking-tight text-gray-800">Language</p>
              </div>
              <span className="text-[12px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl mr-1">English</span>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-all" />
            </div>
          </div>
        </motion.section>

        {/* Support */}
        <motion.section variants={sectionVariants} className="bg-white rounded-[28px] shadow-sm shadow-gray-200/40 overflow-hidden border border-gray-100">
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <HelpCircle size={14} className="text-gray-300" />
              Support
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            <MenuRow icon={<HelpCircle size={20} />} iconBg="bg-[#f3f4f6]" iconColor="text-[#4b5563]" label="Help & FAQ" sub="Find answers to your questions" />
            <MenuRow icon={<MessageCircle size={20} />} iconBg="bg-[#eef2ff]" iconColor="text-[#4f46e5]" label="Contact Support" sub="We are here to help" />
            <MenuRow icon={<AlertTriangle size={20} />} iconBg="bg-[#fff7ed]" iconColor="text-[#ea580c]" label="Report a Problem" sub="Something isn't working?" />
          </div>
        </motion.section>

        {/* Danger Zone */}
        {!isGuest && (
          <motion.section variants={sectionVariants} className="pt-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-white border border-red-100 text-red-500 rounded-[20px] hover:bg-[#fff9fa] hover:border-red-200 hover:text-red-600 transition-all font-bold text-[15px] shadow-sm shadow-red-500/5 active:scale-[0.98]"
            >
              <LogOut size={18} />
              Sign Out
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-4 font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              <p>Logged in securely via <span className="font-bold text-gray-500">{profile.loginMethod}</span></p>
            </div>
          </motion.section>
        )}

        
      </motion.div>
    </div>
  );
}

