"use client";

import {
  Search,
  MapPin,
  ChevronDown,
  Bell,
  ShoppingBag,
  Menu,
  User,
  MoreHorizontal,
  Calendar,
  BadgePercent,
  Wallet,
  ShieldCheck,
  Globe,
  Eye,
  Info,
  Users,
  MessageSquare,
  LogOut,
  Edit2,
  Heart,
  ChevronRight,
  ShoppingBasket,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth/AuthContext";
import { useTheme } from "next-themes";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { subscribeToCustomerNotifications } from "@/lib/customer-service";
import { subscribeToGlobalMenuItems, subscribeToAllShops } from "@/lib/vendor-service";
import { VendorMenuItem, VendorShop } from "@/lib/types/vendor";
import { AnimatePresence, motion } from "framer-motion";

export function Home2Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [userName, setUserName] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState<(VendorMenuItem & { shopName?: string })[]>([]);
  const [shops, setShops] = useState<Record<string, string>>({});
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const unsubscribe = subscribeToCustomerNotifications(user.uid, (data) => {
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUserName("");
      setFullName("");
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().fullName) {
          const data = docSnap.data();
          const name = data.fullName;
          setUserName(name.split(" ")[0]);
          setFullName(name);
        } else if (user.displayName) {
          setUserName(user.displayName.split(" ")[0]);
          setFullName(user.displayName);
        } else {
          const name = user.email?.split("@")[0] || "User";
          setUserName(name.split(" ")[0]);
          setFullName(name);
        }
      },
      (error) => {
        console.error("Error syncing user profile:", error);
        if (user.displayName) {
          setUserName(user.displayName.split(" ")[0]);
          setFullName(user.displayName);
        } else {
          const name = user.email?.split("@")[0] || "User";
          setUserName(name.split(" ")[0]);
          setFullName(name);
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const profileInitial = userName ? userName.charAt(0).toUpperCase() : (user ? (user.email ? user.email.charAt(0).toUpperCase() : "U") : "G");

  // Global Menu Sync
  useEffect(() => {
    const unsubShops = subscribeToAllShops((allShops) => {
      const shopMap: Record<string, string> = {};
      allShops.forEach(s => shopMap[s.id] = s.name);
      setShops(shopMap);
    });

    const unsubMenu = subscribeToGlobalMenuItems((items) => {
      setAllItems(items);
    });

    return () => {
      unsubShops();
      unsubMenu();
    };
  }, []);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allItems
      .filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category?.toLowerCase().includes(query)
      )
      .map(item => ({
        ...item,
        shopName: shops[item.shopId] || "Loading Shop..."
      }))
      .slice(0, 8); // Limit to top 8 results
  }, [searchQuery, allItems, shops]);

  const handleInvite = async () => {
    const inviteLink = user ? `https://clickin.co.in/?ref=${user.uid}` : "https://clickin.co.in/";
    const shareData = {
      title: "Join Clickin - Smart Canteen Ordering",
      text: "Hey! Check out Clickin to order food from the canteen without standing in line. Use my link:",
      url: inviteLink,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        window.alert("Invite link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto max-w-7xl flex flex-col gap-2 pt-3 pb-4">
        {/* Top Row: Profile/Location & Actions */}
        <div className="flex items-center justify-between px-4">
          {/* Left: Profile Menu Trigger & Location */}
          <div className="flex items-center gap-3">
            {/* Profile Image (Triggers Sidebar) */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-lg ring-1 ring-gray-100/50 hover:ring-primary/40 transition-all group shrink-0">
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/5 transition-colors" />
                  {mounted ? (
                    user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="object-cover w-full h-full relative z-10 transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full relative z-10 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-lg shadow-inner transition-transform duration-500 group-hover:scale-110">
                        {profileInitial}
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full relative z-10 bg-gray-100 animate-pulse" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[82vw] sm:w-[360px] border-r-0 rounded-r-3xl md:rounded-r-[2.5rem] bg-white p-0 overflow-y-auto custom-scrollbar shadow-2xl z-[100]"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Profile Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col min-h-full pb-8">
                  {/* Top Header */}
                  <div className="flex items-center justify-between px-6 pt-8 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden transform scale-[1.3] origin-left">
                        <Logo width={40} height={40} />
                      </div>
                      <span className="text-[22px] font-black text-gray-900 tracking-tight gap-3">
                        Profile
                      </span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 shadow-sm relative shrink-0">
                        {mounted && user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="User"
                            className="object-cover w-full h-full"
                          />
                        ) : mounted ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-2xl shadow-inner">
                            {profileInitial}
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-100 animate-pulse" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[17px] font-bold text-gray-900 leading-tight mb-1">
                          {fullName || "Guest"}
                        </h3>
                        <p className="text-[13px] font-bold text-gray-500">
                          {user?.phoneNumber || user?.email || "Not signed in"}
                        </p>
                      </div>
                    </div>
                    {user && (
                      <Link href="/profile">
                        <button className="text-emerald-500 hover:text-emerald-600 p-2">
                          <Edit2 size={18} strokeWidth={2.5} />
                        </button>
                      </Link>
                    )}
                  </div>

                  {/* Guest Sign In CTA */}
                  {!user && (
                    <div className="px-5 mt-2 mb-2">
                      <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100/60 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors" />
                        <div className="relative z-10">
                          <h4 className="text-[15px] font-black text-gray-900 mb-1 tracking-tight">
                            Personalize your experience
                          </h4>
                          <p className="text-[12px] font-semibold text-gray-500 mb-3">
                            Sign in to track orders & save favorites
                          </p>
                          <Link href="/signin">
                            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[14px] py-2.5 rounded-xl shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                              <User className="w-4 h-4" />
                              Sign In / Register
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-[1px] bg-gray-100 mx-6 my-2" />

                  {/* Menu Items */}
                  <div className="flex flex-col px-4 gap-1">
                    {/* Section 1 */}
                    <MenuItem
                      icon={<User className="w-[22px] h-[22px]" />}
                      label="Profile"
                      href="/profile"
                    />
                    <MenuItem
                      icon={<Bell className="w-[22px] h-[22px]" />}
                      label="Notification"
                      href="/notifications"
                    />
                   
                    {/* <MenuItem icon={<Wallet className="w-[22px] h-[22px]" />} label="Payment Methods" href="/payments" /> */}

                    <div className="h-[1px] bg-gray-100 mx-2 my-2" />

                    {/* Section 2 */}
                    {/* <MenuItem icon={<MapPin className="w-[22px] h-[22px]" />} label="Address" href="/address" /> */}
                     <MenuItem
                      icon={<Store className="w-[22px] h-[22px]" />}
                      label="Vendor Dashboard"
                      href="/vendor"
                    />
                    <MenuItem
                      icon={<User className="w-[22px] h-[22px]" />}
                      label="Staff Dashboard"
                      href="/favorites"
                    />
                    {/* <MenuItem
                      icon={<ShieldCheck className="w-[22px] h-[22px]" />}
                      label="Security"
                      href="/security"
                    /> */}
                    <MenuItem
                      icon={<Globe className="w-[22px] h-[22px]" />}
                      label="Language"
                      rightText="English (US)"
                      href="/language"
                    />

                    <MenuItem
                      icon={<Users className="w-[22px] h-[22px]" />}
                      label="Invite Friends"
                      onClick={handleInvite}
                    />
                    <MenuItem
                      icon={<MessageSquare className="w-[22px] h-[22px]" />}
                      label="Feedback"
                      href="/feedback"
                    />
                    {/* {mounted && (
                      // dark mode toggle with beta badge
                      <div
                        className="relative"
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                      >
                        <MenuItem
                          icon={<Eye className="w-[22px] h-[22px]" />}
                          label="Dark Mode"
                          isToggle={true}
                          isActive={theme === "dark"}
                        /> */}
                    {/* small beta indicator
                        <span className="absolute top-2 right-3 text-[10px] font-black text-white bg-emerald-800 rounded px-1 pointer-events-none">
                          BETA
                        </span>
                      </div>
                    )} */}

                    <MenuItem
                      icon={<Info className="w-[22px] h-[22px]" />}
                      label="Help Center"
                      href="/help"
                    />

                    {/* Logout */}
                    {user && (
                      <div className="mt-4 mb-2 mx-2">
                        <button
                          onClick={async () => {
                            await logout();
                            router.push("/");
                          }}
                          className="flex items-center gap-4 w-full p-2 text-[#F75555] hover:bg-red-50 rounded-xl transition-colors font-bold group"
                        >
                          <LogOut className="w-[22px] h-[22px] group-active:scale-95 transition-transform" />
                          <span className="text-[15px]">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Location Details */}
            <div className="flex items-center p-1.5 px-2 rounded-xl">
              <span className="text-[18px] font-black text-gray-900">
                Hello! {userName || "Guest"}
              </span>
            </div>
          </div>

          {/* Right: Actions (Notification & Cart) */}
          <div className="flex items-center gap-3">


            {/* Cart */}
            <Link href="/cart">
              <button className="relative w-11 h-11 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:bg-primary/5 hover:border-primary/20 hover:text-primary hover:shadow-md transition-all active:scale-95 group">
                <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white ring-1 ring-primary/20"></span>
              </button>
            </Link>
            {/* Notification */}
            <Link href="/notifications">
              <button className="relative w-11 h-11 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:bg-primary/5 hover:border-primary/20 hover:text-primary hover:shadow-md transition-all active:scale-95 group">
                <Bell className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex flex-col items-center justify-center min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white px-1 shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Row: Search Bar */}
        <div className="px-4 mt-2 relative">
          <div className="relative group overflow-hidden rounded-2xl transition-all">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-all duration-300" />
            </div>
            <input
              type="text"
              placeholder="What's on your mind?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="block w-full pl-11 pr-4 py-4 bg-[#F6F6F6] border-2 border-transparent rounded-2xl text-[15px] font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/10 transition-all shadow-sm"
            />
            <div className="absolute inset-0 border-2 border-primary/0 rounded-2xl group-focus-within:border-primary/10 pointer-events-none transition-all duration-300" />
          </div>

          {/* Real-time Search Results Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="absolute left-4 right-4 top-[calc(100%+8px)] bg-white/95 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-2xl z-[100] overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar"
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Items Available</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-600">LIVE</span>
                    </div>
                  </div>
                  
                  {filteredResults.length > 0 ? (
                    filteredResults.map((item) => (
                      <Link 
                        key={`${item.shopId}-${item.id}`} 
                        href={`/shop/${item.shopId}`}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50/50 group transition-all active:scale-[0.98] border border-transparent hover:border-emerald-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white shadow-sm border border-gray-100 group-hover:scale-110 transition-transform",
                            !item.available && "grayscale opacity-50"
                          )}>
                            {item.image || "🥘"}
                          </div>
                          <div>
                            <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-gray-400">
                              {item.shopName} • {item.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-black text-gray-900">₹{item.price}</p>
                          {!item.available ? (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Out of Stock</span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">In Stock</span>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-400 font-bold text-sm">No items matching "{searchQuery}"</p>
                      <p className="text-[11px] text-gray-300 mt-1 uppercase tracking-widest">Global Scan Active</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  icon,
  label,
  rightText,
  isToggle,
  isActive,
  href,
  onClick,
  textClass = "text-gray-800",
}: any) {
  const inner = (
    <div onClick={href ? undefined : onClick} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group">
      <div className="flex items-center gap-4">
        <div className="text-gray-900 group-hover:text-black transition-colors">
          {icon}
        </div>
        <span className={cn("font-bold text-[15px]", textClass)}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {rightText && (
          <span className="text-[14px] font-bold text-gray-900">
            {rightText}
          </span>
        )}
        {isToggle ? (
          <div
            className={cn(
              "w-10 h-6 rounded-full relative shadow-inner transition-colors duration-300",
              isActive
                ? "bg-emerald-500 border-emerald-500"
                : "bg-gray-200 border-gray-300",
            )}
          >
            <div
              className={cn(
                "w-[18px] h-[18px] bg-white rounded-full shadow-sm absolute top-1/2 -translate-y-1/2 transition-all duration-300",
                isActive ? "left-[calc(100%-21px)]" : "left-[3px]",
              )}
            />
          </div>
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        )}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
