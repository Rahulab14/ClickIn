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
} from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/customer/CartContext";
import { useAuth } from "@/context/auth/AuthContext";
import {
  createCustomerOrder,
  verifyPaymentUTR,
  getShop,
  subscribeToMenuItems,
  subscribeToShop,
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
  const [paymentMethod, setPaymentMethod] = useState<
    "UPI_GPAY" | "UPI_PHONEPE" | "UPI_PAYTM" | "UPI_FAMAPP" | "CASH"
  >("UPI_GPAY");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUtrDialog, setShowUtrDialog] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [upiLink, setUpiLink] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

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
      <div className="min-h-screen bg-gray-50 flex flex-col pt-16 md:pt-20">
        <div className="bg-white border-b border-gray-100 flex items-center justify-between px-4 h-16 md:h-20 fixed top-0 w-full z-40 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 md:p-3 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </button>
            <h1 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight">
              Checkout
            </h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-red-50">
            <WifiOff className="w-12 h-12 text-red-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">
            Shop Offline
          </h2>
          <p className="text-gray-500 text-base max-w-sm mx-auto mb-8 font-medium leading-relaxed">
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
      // 1. Create order FIRST (in backend) with the pre-generated ID
      // We fire this and proceed to payment; the backend uses setDoc(id).
      createCustomerOrder(
        orderData as Omit<VendorOrder, "id" | "updatedAt"> & { id: string },
      ).catch((err) =>
        console.error("Firestore background write failed:", err),
      );

      setOrderId(generatedOrderId);
      console.log("Order ID pre-generated:", generatedOrderId);

      setOrderId(generatedOrderId);
      console.log("Order created:", { orderId: generatedOrderId });

      if (method.startsWith("UPI")) {
        // 2. Trigger UPI Intent from Frontend
        const upiId = (shop?.upiId || "balajier2006@okaxis").trim();
        const rawShopName = shop?.name || "Shop";
        const shopName = encodeURIComponent(rawShopName);
        const amount = grandTotal.toFixed(2);
        const validateUpi = (u: string) => /^[\w.\-]{3,}@[a-zA-Z]+$/.test(u);
        if (!validateUpi(upiId)) {
          // let the user know, but still attempt the intent in case the bank accepts it
          window.alert(
            "Warning: the UPI ID seems malformed. Please double-check with the vendor.",
          );
        }

        if (method === "UPI_GPAY" && "PaymentRequest" in window) {
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

            // Fast fail if unsupported
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
                clearCart();
                router.push(
                  `/order/${generatedOrderId}?status=PAID&shopId=${shopId || "demo-shop"}&utr=${fetchedUtr}`,
                );
                return; // Exit here, no dialog needed
              }
            } else {
              window.location.href = `tez://upi/pay?pa=${upiId}&pn=${shopName}&am=${amount}&cu=INR&tn=Order%20${generatedOrderId}`;
            }
          } catch (err: any) {
            console.error("Payment Request API Failed:", err);
            if (err.name === "NotSupportedError") {
              window.location.href = `gpay://upi/pay?pa=${upiId}&pn=${shopName}&am=${amount}&cu=INR&tn=Order%20${generatedOrderId}`;
            } else {
              window.location.href = `tez://upi/pay?pa=${upiId}&pn=${shopName}&am=${amount}&cu=INR&tn=Order%20${generatedOrderId}`;
            }
          }
        } else {
          let intentPrefix = "upi://pay";
          if (method === "UPI_GPAY") intentPrefix = "tez://upi/pay";
          if (method === "UPI_PHONEPE") intentPrefix = "phonepe://pay";
          if (method === "UPI_PAYTM") intentPrefix = "paytmmp://pay";
          if (method === "UPI_FAMAPP") intentPrefix = "fampay://pay"; // Use specific fampay intent scheme

          const upiLink = `${intentPrefix}?pa=${upiId}&pn=${shopName}&am=${amount}&cu=INR&tn=Order%20${generatedOrderId}`;

          window.location.href = upiLink;
        }

        // 3. Show UTR verification dialog after returning from intent
        setTimeout(() => {
          setIsProcessing(false);
          setShowUtrDialog(true);
        }, 2000);
      } else if (method === "CASH") {
        // If they choose 'Cash at Counter', the user said "it need to open the app and the customer need to pay to the vendor".
        // This means even for "Cash", we open the generic UPI picker.
        const upiId = (shop?.upiId || "balajier2006@okaxis").trim();
        const shopName = encodeURIComponent(shop?.name || "Shop");
        const amount = grandTotal.toFixed(2);
        // if the ID looks malformed we provide a fallback alert so user can paste manually
        const validateUpi = (u: string) => /^[\w.\-]{3,}@[a-zA-Z]+$/.test(u);
        if (!validateUpi(upiId)) {
          window.alert(
            "The vendor's UPI ID appears invalid, please verify before proceeding.",
          );
        }
        const upiLink = `upi://pay?pa=${upiId}&pn=${shopName}&am=${amount}&cu=INR&tn=Order%20${generatedOrderId}`;

        window.location.href = upiLink;

        setTimeout(() => {
          setIsProcessing(false);
          setShowUtrDialog(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      setIsProcessing(false);
    }
  };

  const handleVerifyUtr = async () => {
    if (utrNumber.length < 12) {
      setUtrError("Please enter a valid 12-digit UTR/Reference No.");
      return;
    }

    // 5. Verify Payment on Backend (Option B - Manual Verification via UPI Reference ID)
    setIsProcessing(true);

    try {
      const isVerified = await verifyPaymentUTR(orderId, utrNumber);
      if (isVerified) {
        clearCart();
        setShowUtrDialog(false);
        // Redirect to order with PAID status inside URL (MVP approach)
        router.push(
          `/order/${orderId}?status=PAID&shopId=${shopId || "demo-shop"}&utr=${utrNumber}`,
        );
      } else {
        setUtrError(
          "Failed to verify payment. Please check UTR and try again.",
        );
        setIsProcessing(false);
      }
    } catch (error) {
      setUtrError("Server error during verification.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return <PremiumLoader message="Fetching your items..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-36 font-sans selection:bg-indigo-100">
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full relative">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 sticky top-0 z-30 border-b border-gray-100 shadow-sm md:mt-4 md:rounded-t-[2rem]">
          <button
            onClick={() => router.back()}
            className="p-2.5 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-gray-900 tracking-tight leading-none">
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
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Order Items
              </h2>
              <span className="text-xs font-bold bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-100">
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
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
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
                          <p className="font-bold text-gray-900 text-[15px] leading-tight line-clamp-2">
                            {item.name}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mt-1">
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
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100 text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-95"
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
                            "w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100 transition-colors active:scale-95",
                            canAdd
                              ? "text-gray-600 hover:text-green-500 hover:bg-green-50"
                              : "text-gray-300 cursor-not-allowed",
                          )}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900 text-base tabular-nums">
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
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                Complete your meal
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {recommendedItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="min-w-[160px] bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col gap-2 relative group hover:border-primary/20 transition-colors"
                  >
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-gray-50">
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
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">
                          {item.name}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{item.price}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="bg-white text-emerald-600 text-xs font-black px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm uppercase hover:bg-emerald-50 active:scale-95 transition-all"
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
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50 space-y-4 relative">
            {/* Dashed line decoration */}
            <div className="absolute -top-3 left-0 right-0 h-6 overflow-hidden">
              <div className="w-full h-full border-b-2 border-dashed border-gray-100"></div>
            </div>

            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Payment Details
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Item Total</span>
                <span className="text-gray-900 font-medium tabular-nums">
                  ₹{itemTotal}
                </span>
              </div>
              <div className="border-t border-dashed border-gray-200 mt-2 pt-4 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900">
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
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
              Pay via UPI App
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {/* Google Pay */}
              <button
                onClick={() => handlePaymentWithMethod("UPI_GPAY")}
                disabled={isProcessing}
                className="relative px-5 py-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                    <span
                      className="text-xl font-bold"
                      style={{
                        background:
                          "linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      G
                    </span>
                  </div>
                  <span className="font-semibold text-[15px] text-gray-800">
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
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </button>

              {/* PhonePe */}
              <button
                onClick={() => handlePaymentWithMethod("UPI_PHONEPE")}
                disabled={isProcessing}
                className="relative px-5 py-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#5f259f] flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">Pe</span>
                  </div>
                  <span className="font-semibold text-[15px] text-gray-800">
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
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </button>

              {/* Paytm */}
              <button
                onClick={() => handlePaymentWithMethod("UPI_PAYTM")}
                disabled={isProcessing}
                className="relative px-5 py-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00b9f1] flex items-center justify-center shadow-sm">
                    <span className="text-white font-black text-[9px] tracking-tighter">
                      Paytm
                    </span>
                  </div>
                  <span className="font-semibold text-[15px] text-gray-800">
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
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </button>

              {/* FamApp */}
              <button
                onClick={() => handlePaymentWithMethod("UPI_FAMAPP")}
                disabled={isProcessing}
                className="relative px-5 py-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] flex items-center justify-center shadow-sm">
                    <span className="text-[#FFD100] font-black text-[12px] tracking-tight">
                      Fam
                    </span>
                  </div>
                  <span className="font-semibold text-[15px] text-gray-800">
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
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50">
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

      {/* Payment Dialog - Shows UPI Link to Open */}
      {showPaymentDialog && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                  Open Payment App
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Click below to open your UPI app and complete the payment.
                </p>
              </div>
              <button
                onClick={() => setShowPaymentDialog(false)}
                className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <a
                href={upiLink}
                className="block w-full bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 text-center hover:bg-blue-600 transition-colors active:scale-95"
              >
                Open UPI App →
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(upiLink);
                  alert("Payment link copied to clipboard!");
                }}
                className="w-full border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Copy Payment Link
              </button>

              <p className="text-center text-xs text-gray-400 font-medium px-4">
                After completing payment in your UPI app, click below to verify.
              </p>

              <button
                onClick={() => {
                  setShowPaymentDialog(false);
                  setTimeout(() => setShowUtrDialog(true), 300);
                }}
                className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Payment Done, Verify UTR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UTR Verification Dialog (Option B: Manual Verification via UPI Reference ID) */}
      {showUtrDialog && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  Verify Payment
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Please enter the 12-digit UTR/Reference No. from your UPI app
                  to confirm your order.
                </p>
              </div>
              <button
                onClick={() => setShowUtrDialog(false)}
                className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                  UTR / Reference ID
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={utrNumber}
                  onChange={(e) => {
                    setUtrNumber(e.target.value);
                    setUtrError("");
                  }}
                  placeholder="e.g. 301234567890"
                  className={cn(
                    "w-full bg-gray-50 border px-4 py-3.5 rounded-xl text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all text-[16px]",
                    utrError
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-200 focus:ring-primary/20 focus:border-primary",
                  )}
                />
                {utrError && (
                  <p className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {utrError}
                  </p>
                )}
              </div>

              <button
                onClick={handleVerifyUtr}
                disabled={isProcessing || utrNumber.length < 5}
                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <>Verify & Confirm Order</>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 font-medium px-4">
                Once verified, your order QR code will be generated
                automatically.
              </p>
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
