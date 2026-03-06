// Mock Data for QR Ordering MVP

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    isVeg: boolean;
    category: string;
    bestseller?: boolean;
}

export interface Shop {
    id: string;
    name: string;
    location: string;
    image: string;
    rating: number;
    menu: MenuItem[];
    tags: string[];
    deliveryTime: string;
    upiId?: string;
}

export const SHOPS: Shop[] = [
    {
        id: "1",
        name: "Sakthi Canteen",
        location: "Main Block",
        rating: 4.5,
        deliveryTime: "15 mins",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60",
        tags: ["South Indian", "Meals"],
        menu: [
            { id: "s1", name: "Full Meals", price: 80, description: "Rice, Sambar, Rasam, Kootu, Poriyal, Curd", image: "🍛", isVeg: true, category: "Lunch", bestseller: true },
            { id: "s2", name: "Variety Rice", price: 50, description: "Lemon/Tomato/Curd Rice", image: "🍚", isVeg: true, category: "Lunch" },
            { id: "s3", name: "Chapati (2)", price: 40, description: "With Kurma", image: "🫓", isVeg: true, category: "Dinner" }
        ]
    },
    {
        id: "2",
        name: "MH-3 nearby Canteen",
        location: "Near MH-3",
        rating: 4.2,
        deliveryTime: "20 mins",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=60", // Pizza/Fast food style or generic
        tags: ["Snacks", "Tea"],
        menu: [
            { id: "m1", name: "Tea", price: 10, description: "Hot masala chai", image: "☕", isVeg: true, category: "Beverages", bestseller: true },
            { id: "m2", name: "Samosa", price: 15, description: "Crispy potato filling", image: "🥟", isVeg: true, category: "Snacks" },
            { id: "m3", name: "Egg Puff", price: 20, description: "Spicy egg filling", image: "🥚", isVeg: false, category: "Snacks" }
        ]
    },
    {
        id: "3",
        name: "Juice Shop (No bill)",
        location: "Food Court",
        rating: 4.7,
        deliveryTime: "10 mins",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=60",
        tags: ["Juices", "Shakes"],
        menu: [
            { id: "j1", name: "Orange Juice", price: 50, description: "Freshly squeezed", image: "🍊", isVeg: true, category: "Fresh Juices", bestseller: true },
            { id: "j2", name: "Chocolate Shake", price: 70, description: "Thick and creamy", image: "🥤", isVeg: true, category: "Shakes" },
            { id: "j3", name: "Fruit Salad", price: 60, description: "Seasonal fruits", image: "🥗", isVeg: true, category: "Desserts" }
        ]
    },
    {
        id: "4",
        name: "Xerox Shop (Bill)",
        location: "Library Complex",
        rating: 4.0,
        deliveryTime: "Open Now",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60", // Placeholder
        tags: ["Stationery", "Print"],
        menu: [
            { id: "x1", name: "A4 Print", price: 2, description: "Black & White per page", image: "📄", isVeg: true, category: "Printing" },
            { id: "x2", name: "Color Print", price: 10, description: "Per page", image: "🌈", isVeg: true, category: "Printing" },
            { id: "x3", name: "Spiral Binding", price: 30, description: "Upto 100 pages", image: "📒", isVeg: true, category: "Services" }
        ]
    },
    {
        id: "5",
        name: "Nalabagam Canteen",
        location: "Engineering Block",
        rating: 4.6,
        deliveryTime: "25 mins",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60",
        tags: ["Biryani", "Parotta", "Chinese"],
        menu: [
            // VEG
            { id: "n1", name: "Meals (Limited)", price: 70, description: "Traditional South Indian Lunch", image: "🍱", isVeg: true, category: "Veg", bestseller: true },
            { id: "n2", name: "Veg Briyani", price: 50, description: "Aromatic rice with vegetables", image: "🥘", isVeg: true, category: "Veg" },
            { id: "n3", name: "Veg Fried Rice", price: 70, description: "Indo-Chinese style", image: "🍚", isVeg: true, category: "Veg" },
            { id: "n4", name: "Gobi Manchurian", price: 100, description: "Crispy cauliflower in sauce", image: "🍲", isVeg: true, category: "Veg" },
            { id: "n5", name: "Paneer Masala", price: 100, description: "Rich gravy", image: "🧀", isVeg: true, category: "Veg" },
            { id: "n6", name: "Parotta (2 NOS)", price: 25, description: "Flaky layered flatbread", image: "🫓", isVeg: true, category: "Veg", bestseller: true },
            { id: "n7", name: "Tea / Milk", price: 10, description: "Hot beverage", image: "☕", isVeg: true, category: "Veg" },

            // NON-VEG
            { id: "n8", name: "Chicken Briyani", price: 100, description: "Flavorful chicken biryani", image: "🍗", isVeg: false, category: "Non-Veg", bestseller: true },
            { id: "n9", name: "Chicken Fried Rice", price: 90, description: "Wok tossed rice with chicken", image: "🍛", isVeg: false, category: "Non-Veg" },
            { id: "n10", name: "Chicken Noodles", price: 90, description: "Stir fried noodles", image: "🍜", isVeg: false, category: "Non-Veg" },
            { id: "n11", name: "Pepper Chicken", price: 100, description: "Spicy dry roast", image: "🌶️", isVeg: false, category: "Non-Veg" },
            { id: "n12", name: "Grilled Chicken (Full)", price: 400, description: "Charcoal grilled", image: "🍖", isVeg: false, category: "Non-Veg" },
            { id: "n13", name: "Egg Parotta", price: 80, description: "Minced parotta with egg", image: "🍳", isVeg: false, category: "Non-Veg" }
        ]
    },
    {
        id: "6",
        name: "Sodexo Canteen",
        location: "Central Dining",
        rating: 4.1,
        deliveryTime: "30 mins",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60",
        tags: ["Thali", "North Indian"],
        menu: [
            { id: "so1", name: "North Indian Thali", price: 120, description: "Roti, Dal, Paneer, Rice, Sweet", image: "🍛", isVeg: true, category: "Lunch", bestseller: true },
            { id: "so2", name: "Aloo Paratha", price: 40, description: "Stuffed flatbread with curd", image: "🥔", isVeg: true, category: "Breakfast" },
            { id: "so3", name: "Chole Bhature", price: 80, description: "Spicy chickpea curry with fried bread", image: "🥘", isVeg: true, category: "Special" }
        ]
    },
    {
        id: "7",
        name: "Raja Canteen",
        location: "Hostel Zone",
        rating: 4.3,
        deliveryTime: "15 mins",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=60",
        tags: ["Breakfast", "Snacks"],
        menu: [
            { id: "r1", name: "Masala Dosa", price: 40, description: "Crispy crepe with potato filling", image: "🥞", isVeg: true, category: "Breakfast", bestseller: true },
            { id: "r2", name: "Idli (2)", price: 20, description: "Steamed rice cakes", image: "⚪", isVeg: true, category: "Breakfast" },
            { id: "r3", name: "Vada", price: 10, description: "Savory donut", image: "🍩", isVeg: true, category: "Snacks" }
        ]
    },
    {
        id: "8",
        name: "Vada Kadai (opp Juice)",
        location: "Opposite Juice Shop",
        rating: 4.8,
        deliveryTime: "5 mins",
        image: "https://images.unsplash.com/photo-1606491956689-2ea28c674675?w=800&auto=format&fit=crop&q=60",
        tags: ["Vada", "Bajji"],
        menu: [
            { id: "v1", name: "Medhu Vada", price: 10, description: "Crispy lentil fritter", image: "🍩", isVeg: true, category: "Snacks", bestseller: true },
            { id: "v2", name: "Masala Vada", price: 10, description: "Crunchy spiced fritter", image: "🍪", isVeg: true, category: "Snacks" },
            { id: "v3", name: "Potato Bajji", price: 8, description: "Fried potato slices", image: "🥔", isVeg: true, category: "Snacks" }
        ]
    },
    {
        id: "9",
        name: "Ice Cream Shop (No bill)",
        location: "Entrance Gate",
        rating: 4.9,
        deliveryTime: "10 mins",
        image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&auto=format&fit=crop&q=60",
        tags: ["Ice Cream", "Desserts"],
        menu: [
            { id: "i1", name: "Vanilla Cone", price: 30, description: "Classic vanilla", image: "🍦", isVeg: true, category: "Ice Cream" },
            { id: "i2", name: "Chocolate Scoop", price: 40, description: "Rich chocolate", image: "🍫", isVeg: true, category: "Ice Cream", bestseller: true },
            { id: "i3", name: "Butterscotch", price: 50, description: "Creamy nutty flavor", image: "🍨", isVeg: true, category: "Ice Cream" }
        ]
    }
];

export const getShopById = (id: string) => SHOPS.find(s => s.id === id);
