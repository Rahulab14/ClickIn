"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { getShopById, SHOPS } from "@/lib/mock-data";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  Trash2,
  ShoppingBag,
  ChevronRight,
  Home,
  Plus,
  Minus,
  X,
  ShieldCheck,
  AlertTriangle,
  WifiOff,
  Download,
  Copy,
  QrCode,
} from "lucide-react";
import { Suspense, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/customer/CartContext";
import { useAuth } from "@/context/auth/AuthContext";
import QRCode from "react-qr-code";
import {
  createCustomerOrder,
  verifyPaymentUTR,
  getShop,
  subscribeToMenuItems,
  subscribeToShop,
  subscribeToSettings,
} from "@/lib/vendor-service";
import type { VendorOrder, VendorMenuItem } from "@/lib/types/vendor";
import Image from "next/image";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shopId = searchParams.get("shopId");
  const cartData = searchParams.get("data");

  const {
    items: cartItems,
    updateQuantity: contextUpdateQty,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [liveMenu, setLiveMenu] = useState<VendorMenuItem[]>([]);
  const [vendorSettings, setVendorSettings] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "UPI_GPAY" | "UPI_PHONEPE" | "UPI_PAYTM" | "UPI_FAMAPP" | "CASH"
  >("UPI_FAMAPP");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUtrDialog, setShowUtrDialog] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [upiLink, setUpiLink] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isPersonalUPI, setIsPersonalUPI] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPostPaymentPrompt, setShowPostPaymentPrompt] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  const qrRef = useRef<any>(null);

  // Detect if UPI is personal or merchant
  const isPersonalUPIId = (upiId: string): boolean => {
    if (!upiId) return false;
    // Merchant UPI providers: @paytmqr, @okhdfcbank, @okaxis (merchant only), @bikaji, @ldgr, etc.
    // Personal: most @okaxis, @okicici, @okidbi, personal bank UPIs
    const merchantProviders =
      /@(paytmqr|okhdfcbank|bikaji|ldgr|upi|ibl|airtelpaytm|apl)/i;
    const hasProvider = merchantProviders.test(upiId);
    return !hasProvider;
  };

  // Generate UPI link without tr parameter for better compatibility across apps (Setu style)
  const generateUPILink = (
    upiId: string,
    shopName: string,
    amount: string,
    orderRef: string,
    _isPersonal: boolean,
  ): string => {
    const encodedShopName = encodeURIComponent(shopName);
    const transactionNote = encodeURIComponent(`${shopName} | ${orderRef}`);

    // Always use generic upi://pay without 'tr' parameter for maximum compatibility
    return `upi://pay?pa=${upiId}&pn=${encodedShopName}&am=${amount}&cu=INR&tn=${transactionNote}`;
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;

    async function fetchShopData() {
      if (shopId) {
        // initial one‑time fetch in case subscription is slow
        const fbShop = await getShop(shopId);
        if (fbShop) {
          setShop(fbShop);
        } else {
          const mockShop = getShopById(shopId);
          setShop(mockShop || SHOPS[0]);
        }

        // subscribe to live updates (including UPI changes)
        unsub = subscribeToShop(shopId, (s) => {
          if (s) setShop(s);
        });
      } else {
        setShop(SHOPS[0]);
      }
    }
    fetchShopData();

    return () => {
      if (unsub) unsub();
    };
  }, [shopId]);

  // Real-time menu & shop subscription for live stock/status updates during checkout
  useEffect(() => {
    if (!shopId) return;
    const unsubMenu = subscribeToMenuItems(shopId, (items) => {
      setLiveMenu(items);
    });
    const unsubShop = subscribeToShop(shopId, (updatedShop) => {
      if (updatedShop) setShop(updatedShop);
    });
    return () => {
      unsubMenu();
      unsubShop();
    };
  }, [shopId]);

  // Ensure fallback to settings.upiId when shop.upiId hasn't propagated yet
  useEffect(() => {
    if (!shopId) return;
    const unsubSettings = subscribeToSettings(shopId, (settings) => {
      setVendorSettings(settings);
    });
    return () => {
      unsubSettings();
    };
  }, [shopId]);

  const updateQuantity = (itemId: string, delta: number) => {
    if (delta > 0) {
      // Cap at available stock
      const menuItem =
        liveMenu.find((i) => i.id === itemId) ||
        (shop?.menu || []).find((i: any) => i.id === itemId);
      if (menuItem) {
        const stock = menuItem.stock ?? -1;
        if (stock >= 0 && (cartItems[itemId] || 0) >= stock) return;
      }
    }
    contextUpdateQty(itemId, delta);
  };

  if (!shop) {
    return (
      <PremiumLoader message="Setting up your secure shop connection..." />
    );
  }

  // Use liveMenu if available for real-time stock, fallback to mock
  const menuSource = liveMenu.length > 0 ? liveMenu : shop.menu || [];
  const items = Object.entries(cartItems)
    .map(([itemId, qty]) => {
      const item = menuSource.find((i: any) => i.id === itemId);
      return item ? { ...item, qty } : null;
    })
    .filter(Boolean) as any[];

  // Check for out-of-stock items in cart
  const outOfStockItems = items.filter((item) => {
    const stock = item.stock ?? -1;
    return !item.available || stock === 0;
  });
  const hasStockIssues = outOfStockItems.length > 0;

  const itemTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = itemTotal;

  // Filter items for Upsell (Items NOT in cart AND available)
  const recommendedItems = menuSource
    .filter(
      (item: any) =>
        !cartItems[item.id] && item.available && (item.stock ?? -1) !== 0,
    )
    .slice(0, 5);

  if (shop?.isOnline === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col pt-16 md:pt-20">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 h-16 md:h-20 fixed top-0 w-full z-40 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 md:p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Checkout
            </h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-red-50">
            <WifiOff className="w-12 h-12 text-red-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-3 tracking-tighter">
            Shop Offline
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-sm mx-auto mb-8 font-medium leading-relaxed">
            The vendor is currently not accepting new orders. Please wait or
            check back later.
          </p>
          <button
            onClick={() => router.push(`/shop/${shopId}`)}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm w-full max-w-sm"
          >
            RETURN TO MENU
          </button>
        </div>
      </div>
    );
  }

  const handlePaymentWithMethod = async (
    method: "UPI_GPAY" | "UPI_PHONEPE" | "UPI_PAYTM" | "UPI_FAMAPP" | "CASH",
  ) => {
    setPaymentMethod(method);
    setSelectedPaymentMethod(method);
    setIsProcessing(true);

    const mappedItems = items.map((item) => ({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      isVeg: item.isVeg,
      image: "📦", // Fallback image string or we can store simple strings
    }));

    // Generate a robust unique ID client-side
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(2, 12);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedOrderId = `ORD-${timestamp}-${randomStr}`;

    const orderData: any = {
      id: generatedOrderId,
      shopId: shop?.id || "demo-shop",
      items: mappedItems,
      total: grandTotal,
      status: "NEW",
      payment: method.startsWith("UPI") ? "UPI" : "CASH",
      paymentProvider: method, // Save exact app just in case
      orderType: "Delivery", // Hardcoded for checkout flow, adjust if needed
      customerName: user?.displayName || "Guest",
      customerPhone: user?.phoneNumber || "",
      customerId: user?.uid || null,
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Save order data to state, but DO NOT create it in backend yet
      setOrderId(generatedOrderId);
      setPendingOrderData(orderData);
      console.log("Order ID pre-generated:", generatedOrderId);

      const transactionNote = encodeURIComponent("Order Payment");
      const transactionRef = encodeURIComponent(generatedOrderId);

      if (method.startsWith("UPI")) {
        // 2. Trigger UPI Intent from Frontend
        // Use famappUpiId for FamApp payments, otherwise use regular upiId
        const upiId =
          method === "UPI_FAMAPP"
            ? (vendorSettings?.famappUpiId || "").trim()
            : (vendorSettings?.upiId || shop?.upiId || "").trim();
        const rawShopName = shop?.name || "Shop";
        const shopName = encodeURIComponent(rawShopName);
        const amount = grandTotal.toFixed(2);
        const validateUpi = (u: string) =>
          /^[a-zA-Z0-9._\-]{2,256}@[a-zA-Z0-9.\-]{2,64}$/.test(u);

        if (!upiId) {
          setIsProcessing(false);
          const appName = method === "UPI_FAMAPP" ? "FamApp" : "UPI";
          window.alert(
            `Merchant ${appName} UPI ID is missing. Cannot proceed with ${appName} payment.`,
          );
          return;
        }

        if (!validateUpi(upiId)) {
          setIsProcessing(false);
          window.alert(
            "Invalid UPI ID. Please check with merchant and try again.",
          );
          return;
        }

        const isPersonalId = isPersonalUPIId(upiId);
        setIsPersonalUPI(isPersonalId);
        const upiLink = generateUPILink(
          upiId,
          rawShopName,
          amount,
          generatedOrderId,
          isPersonalId,
        );

        if (method === "UPI_GPAY" && "PaymentRequest" in window) {
          // GPay: Try PaymentRequest API first for auto-verification
          const supportedInstruments = [
            {
              supportedMethods: ["https://tez.google.com/pay"],
              data: {
                pa: upiId,
                pn: rawShopName,
                tr: generatedOrderId,
                url: window.location.href,
                mc: "5499",
                tn: `Order ${generatedOrderId}`,
              },
            },
          ];

          const paymentDetails = {
            total: {
              label: "Total",
              amount: {
                currency: "INR",
                value: amount,
              },
            },
          };

          try {
            const request = new (window as any).PaymentRequest(
              supportedInstruments,
              paymentDetails,
            );

            const canMakePayment = await Promise.race([
              request.canMakePayment(),
              new Promise<boolean>((resolve) =>
                setTimeout(() => resolve(false), 1500),
              ),
            ]);

            if (canMakePayment) {
              const paymentResponse = await request.show();
              await paymentResponse.complete("success");

              let fetchedUtr = "";
              try {
                if (
                  paymentResponse.details &&
                  paymentResponse.details.tezResponse
                ) {
                  const tezData = JSON.parse(
                    paymentResponse.details.tezResponse,
                  );
                  if (tezData.Status === "SUCCESS") {
                    fetchedUtr =
                      tezData.txnId || tezData.txnRef || "GPAY-VERIFIED";
                  }
                } else if (
                  paymentResponse.details &&
                  paymentResponse.details.txnId
                ) {
                  fetchedUtr = paymentResponse.details.txnId;
                } else {
                  fetchedUtr = "GPAY-VERIFIED";
                }
              } catch (e) {
                console.log("Error parsing tezResponse", e);
                fetchedUtr = "GPAY-VERIFIED";
              }

              if (fetchedUtr) {
                // If GPay auto-verifies, create the order now
                await createCustomerOrder(orderData as any);
                clearCart();
                router.push(
                  `/order/${generatedOrderId}?status=PAID&shopId=${shopId || "demo-shop"}&utr=${fetchedUtr}`,
                );
                return;
              }
            }
            // If PaymentRequest not available or failed, fall through to auto-open
          } catch (err: any) {
            console.error("Payment Request API Failed, falling back to intent:", err);
          }
        }

        // 1. App-specific deep link mapping
        let appLink = upiLink; // default is upi://pay
        if (method === "UPI_GPAY") {
          appLink = upiLink.replace("upi://pay", "tez://upi/pay");
        } else if (method === "UPI_PHONEPE") {
          appLink = upiLink.replace("upi://pay", "phonepe://pay");
        } else if (method === "UPI_PAYTM") {
          appLink = upiLink.replace("upi://pay", "paytmmp://pay");
        }

        // 2. Try app-specific link first
        setUpiLink(appLink);
        window.location.href = appLink;

        // 3. Fallback to generic upi://pay if specific app isn't installed (Setu style)
        if (appLink !== upiLink) {
          setTimeout(() => {
            window.location.href = upiLink;
          }, 1000);
        }

        // 4. After returning from the app, show post-payment prompt
        setTimeout(() => {
          setIsProcessing(false);
          setShowPostPaymentPrompt(true);
        }, 2500); // 2.5s to account for the 1s fallback delay
      } else if (method === "CASH") {
        // If they choose 'Cash at Counter', still open the universal UPI picker and user confirms in app.
        const upiId = (vendorSettings?.upiId || shop?.upiId || "").trim();
        if (!upiId) {
          setIsProcessing(false);
          window.alert(
            "Merchant UPI ID is missing. Cannot proceed with cash/UPI intent.",
          );
          return;
        }

        const shopName = encodeURIComponent(shop?.name || "Shop");
        const rawShopName = shop?.name || "Shop";
        const amount = grandTotal.toFixed(2);
        const validateUpi = (u: string) =>
          /^[a-zA-Z0-9._\-]{2,256}@[a-zA-Z0-9.\-]{2,64}$/.test(u);
        if (!validateUpi(upiId)) {
          setIsProcessing(false);
          window.alert(
            "Invalid UPI ID. Please check with merchant and try again.",
          );
          return;
        }

        const isPersonalId = isPersonalUPIId(upiId);
        setIsPersonalUPI(isPersonalId);
        const upiLink = generateUPILink(
          upiId,
          rawShopName,
          amount,
          generatedOrderId,
          isPersonalId,
        );
        setUpiLink(upiLink);
        window.location.href = upiLink;

        setTimeout(() => {
          setIsProcessing(false);
          setShowPostPaymentPrompt(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!pendingOrderData) return;
    setIsProcessing(true);
    setShowPostPaymentPrompt(false);

    try {
      // Create the order on the backend ONLY now
      // This reduces stock and sends it to the vendor
      await createCustomerOrder(pendingOrderData);

      clearCart();
      // Bypass UTR verification entirely as requested
      router.push(
        `/order/${pendingOrderData.id}?status=PAID&shopId=${shopId || "demo-shop"}&utr=CONFIRMED`,
      );
    } catch (error) {
      console.error("Failed to commit order:", error);
      window.alert("Something went wrong finalizing your order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return <PremiumLoader message="Fetching your items..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-36 font-sans selection:bg-indigo-100">
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full relative">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 shadow-sm md:mt-4 md:rounded-t-[2rem]">
          <button
            onClick={() => router.back()}
            className="p-2.5 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight leading-none">
              Checkout
            </h1>
            <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
              Ordering from {shop.name}
            </p>
          </div>
        </div>

        <div className="px-4 md:px-6 py-6 space-y-6 w-full">
          {/* Stock Warning Banner */}
          {hasStockIssues && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in duration-300">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">
                  Some items are no longer available
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  {outOfStockItems.map((i) => i.name).join(", ")} went out of
                  stock. Remove them to proceed.
                </p>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                Order Items
              </h2>
              <span className="text-xs font-bold bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            <div className="space-y-6">
              {items.map((item) => {
                const stock = item.stock ?? -1;
                const isLow = stock >= 0 && stock > 0 && stock <= 5;
                const isOut = !item.available || stock === 0;
                const canAdd = !isOut && (stock < 0 || item.qty < stock);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex justify-between items-start group rounded-xl transition-colors",
                      isOut && "opacity-50",
                    )}
                  >
                    <div className="flex gap-4 items-start flex-1">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 flex-shrink-0">
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">
                          {item.image}
                        </div>
                        <div
                          className={cn(
                            "absolute bottom-0 left-0 right-0 h-1",
                            item.isVeg ? "bg-emerald-500" : "bg-rose-500",
                          )}
                        />
                      </div>
                      <div className="flex flex-col pt-0.5 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-3 h-3 border-[1.5px] flex items-center justify-center p-[1px] rounded-[2px] flex-shrink-0",
                              item.isVeg
                                ? "border-emerald-600"
                                : "border-rose-600",
                            )}
                          >
                            <div
                              className={cn(
                                "w-full h-full rounded-full",
                                item.isVeg ? "bg-emerald-600" : "bg-rose-600",
                              )}
                            />
                          </div>
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-[15px] leading-tight line-clamp-2">
                            {item.name}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                          ₹{item.price}
                        </p>
                        {isOut && (
                          <p className="text-[10px] font-bold text-red-500 mt-1">
                            Out of stock
                          </p>
                        )}
                        {isLow && !isOut && (
                          <p className="text-[10px] font-bold text-amber-600 mt-1">
                            Only {stock} left
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 rounded-lg p-1 border border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-900 rounded-md shadow-sm border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={!canAdd}
                          className={cn(
                            "w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-900 rounded-md shadow-sm border border-gray-100 dark:border-gray-800 transition-colors active:scale-95",
                            canAdd
                              ? "text-gray-600 dark:text-gray-400 hover:text-green-500 hover:bg-green-50"
                              : "text-gray-300 cursor-not-allowed",
                          )}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-gray-100 text-base tabular-nums">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upsell / Complete your meal */}
          {recommendedItems.length > 0 && (
            <div className="space-y-3 px-1">
              <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                Complete your meal
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {recommendedItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="min-w-[160px] bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-2 relative group hover:border-primary/20 transition-colors"
                  >
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950">
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        {item.image}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className={cn(
                            "w-2.5 h-2.5 border-[1px] flex items-center justify-center p-[0.5px] rounded-[1px] flex-shrink-0",
                            item.isVeg
                              ? "border-emerald-600"
                              : "border-rose-600",
                          )}
                        >
                          <div
                            className={cn(
                              "w-full h-full rounded-full",
                              item.isVeg ? "bg-emerald-600" : "bg-rose-600",
                            )}
                          />
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                          {item.name}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          ₹{item.price}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="bg-white dark:bg-gray-900 text-emerald-600 text-xs font-black px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm uppercase hover:bg-emerald-50 active:scale-95 transition-all"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bill Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100/50 space-y-4 relative">
            {/* Dashed line decoration */}
            <div className="absolute -top-3 left-0 right-0 h-6 overflow-hidden">
              <div className="w-full h-full border-b-2 border-dashed border-gray-100 dark:border-gray-800"></div>
            </div>

            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              Payment Details
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Item Total</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium tabular-nums">
                  ₹{itemTotal}
                </span>
              </div>
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 mt-2 pt-4 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  Total Payable
                </span>
                <span className="font-black text-xl text-primary tabular-nums tracking-tight">
                  ₹{grandTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">
              Pay via UPI App
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {/* Google Pay */}
              {/* <button
                onClick={() => handlePaymentWithMethod("UPI_GPAY")}
                disabled={isProcessing}
                className="relative px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <Image className="w-10 h-10 rounded-xl ] flex items-center justify-center shadow-sm"
      src="/gpay.png"        // Path relative to public folder
      alt="Company Logo"
      width={150}            // Required for remote/public images
      height={50}           
      priority               // Recommended for logos to load immediately
    />
                  <span className="font-semibold text-[15px] text-gray-800 dark:text-gray-200">
                    Google Pay
                  </span>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    paymentMethod === "UPI_GPAY"
                      ? "border-teal-400 bg-teal-400"
                      : "border-teal-400",
                  )}
                >
                  {paymentMethod === "UPI_GPAY" && (
                    <div className="w-2.5 h-2.5 bg-white dark:bg-gray-900 rounded-full" />
                  )}
                </div>
              </button>

              {/* PhonePe */}
              {/* <button
                onClick={() => handlePaymentWithMethod("UPI_PHONEPE")}
                disabled={isProcessing}
                className="relative px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                   <Image className="w-10 h-10 rounded-xl bg-[#5F259F] flex items-center justify-center shadow-sm"
      src="/phonepe.png"        // Path relative to public folder
      alt="Company Logo"
      width={250}            // Required for remote/public images
      height={50}           
      priority               // Recommended for logos to load immediately
    />
                  <span className="font-semibold text-[15px] text-gray-800 dark:text-gray-200">
                    PhonePe
                  </span>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    paymentMethod === "UPI_PHONEPE"
                      ? "border-teal-400 bg-teal-400"
                      : "border-teal-400",
                  )}
                >
                  {paymentMethod === "UPI_PHONEPE" && (
                    <div className="w-2.5 h-2.5 bg-white dark:bg-gray-900 rounded-full" />
                  )}
                </div>
              </button> */}

              {/* Paytm */}
              {/* <button
                onClick={() => handlePaymentWithMethod("UPI_PAYTM")}
                disabled={isProcessing}
                className="relative px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <Image className="w-10 h-10 rounded-xl bg-[#00b9f1] flex items-center justify-center shadow-sm"
      src="/paytm.png"        // Path relative to public folder
      alt="Company Logo"
      width={150}            // Required for remote/public images
      height={50}           
      priority               // Recommended for logos to load immediately
    />
                  <span className="font-semibold text-[15px] text-gray-800 dark:text-gray-200">
                    Paytm
                  </span>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    paymentMethod === "UPI_PAYTM"
                      ? "border-teal-400 bg-teal-400"
                      : "border-teal-400",
                  )}
                >
                  {paymentMethod === "UPI_PAYTM" && (
                    <div className="w-2.5 h-2.5 bg-white dark:bg-gray-900 rounded-full" />
                  )}
                </div>
              </button> 
               */}

              {/* FamApp */}
              <button
                onClick={() => handlePaymentWithMethod("UPI_FAMAPP")}
                disabled={isProcessing}
                className="relative px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                <Image className="w-10 h-10 rounded-xl bg-[#00b9f1] flex items-center justify-center shadow-sm"
      src="/famapp.png"        // Path relative to public folder
      alt="Company Logo"
      width={150}            // Required for remote/public images
      height={50}           
      priority               // Recommended for logos to load immediately
    />

                  <span className="font-semibold text-[15px] text-gray-800 dark:text-gray-200">
                    FamApp
                  </span>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    paymentMethod === "UPI_FAMAPP"
                      ? "border-teal-400 bg-teal-400"
                      : "border-teal-400",
                  )}
                >
                  {paymentMethod === "UPI_FAMAPP" && (
                    <div className="w-2.5 h-2.5 bg-white dark:bg-gray-900 rounded-full" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        

        {/* Pay Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50">
          <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
            <button
              onClick={() => handlePaymentWithMethod(paymentMethod)}
              disabled={isProcessing}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-3 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden relative"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>

              {isProcessing ? (
                <>
                  <Clock className="h-5 w-5 animate-spin text-white/90" />
                  <span className="opacity-95 text-[16px]">Processing...</span>
                </>
              ) : (
                <div className="flex items-center justify-between w-full px-4">
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-medium opacity-80 uppercase tracking-widest">
                      Total
                    </span>
                    <span className="text-xl font-bold">₹{grandTotal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">Place Order</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      
      {/* Post-Payment Prompt - After auto-opening UPI app */}
      {showPostPaymentPrompt && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Payment Status</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Did you complete the payment?</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmPayment}
                className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-[15px] hover:bg-emerald-600 transition-colors shadow-sm active:scale-[0.98]"
              >
                Yes, Payment Completed
              </button>
              <button
                onClick={() => {
                  setShowPostPaymentPrompt(false);
                }}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-xl text-[15px] hover:bg-gray-200 transition-colors active:scale-[0.98]"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <PremiumLoader message="Initializing ClickIn Secure Server..." />
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
