"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Plus, Minus, MoreVertical, Edit2, Trash2, X, Search, Image as ImageIcon, Save, AlertCircle, Package, UtensilsCrossed } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useVendorAuth } from "@/context/vendor/VendorContext"
import { subscribeToMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability, updateMenuItemStock, getCategories } from "@/lib/vendor-service"
import type { VendorMenuItem, VendorCategory } from "@/lib/types/vendor"

interface MenuFormState {
    name: string
    description: string
    price: string
    category: string
    image: string
    isVeg: boolean
    available: boolean
    bestseller: boolean
    stock: string // "-1" for unlimited
}

const EMPTY_FORM: MenuFormState = {
    name: "", description: "", price: "", category: "", image: "", isVeg: true, available: true, bestseller: false, stock: "-1",
}

export default function VendorMenuPage() {
    const { shopId } = useVendorAuth()
    const [menu, setMenu] = useState<VendorMenuItem[]>([])
    const [categories, setCategories] = useState<VendorCategory[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState<VendorMenuItem | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [formState, setFormState] = useState<MenuFormState>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [recentlyAdded, setRecentlyAdded] = useState<VendorMenuItem[]>([])

    // Real-time menu subscription
    useEffect(() => {
        if (!shopId) return
        const unsub = subscribeToMenuItems(shopId, (items) => {
            setMenu(items)
            setLoading(false)
        })
        getCategories(shopId).then(setCategories)
        return () => unsub()
    }, [shopId])

    const handleToggleAvailability = (id: string, current: boolean) => {
        if (!shopId) return
        toggleItemAvailability(shopId, id, !current)
    }

    const handleStockChange = (id: string, delta: number) => {
        if (!shopId) return
        const item = menu.find(m => m.id === id)
        if (!item) return
        const currentStock = item.stock ?? -1
        if (currentStock < 0) return // unlimited, don't change
        const newStock = Math.max(0, currentStock + delta)
        updateMenuItemStock(shopId, id, newStock)
    }

    const handleSetStock = (id: string, value: string) => {
        if (!shopId) return
        const num = parseInt(value)
        if (isNaN(num) || num < -1) return
        updateMenuItemStock(shopId, id, num)
    }

    const openAddModal = () => {
        setFormState(EMPTY_FORM)
        setEditingItem(null)
        setRecentlyAdded([]) // clear showcase on fresh open
        setShowAddModal(true)
    }

    const openEditModal = (item: VendorMenuItem) => {
        setFormState({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category,
            image: item.image,
            isVeg: item.isVeg,
            available: item.available,
            bestseller: item.bestseller,
            stock: (item.stock ?? -1).toString(),
        })
        setEditingItem(item)
        setShowAddModal(true)
    }

    const handleSave = async (addAnother = false) => {
        if (!formState.name || !formState.price || !formState.category || !shopId) return
        setSaving(true)

        const stockVal = parseInt(formState.stock)
        const itemData = {
            name: formState.name,
            description: formState.description,
            price: parseFloat(formState.price),
            category: formState.category,
            image: formState.image || "🍽️",
            isVeg: formState.isVeg,
            available: formState.available,
            bestseller: formState.bestseller,
            stock: isNaN(stockVal) ? -1 : stockVal,
        }

        try {
            if (editingItem) {
                await updateMenuItem(shopId, editingItem.id, itemData)
            } else {
                const newId = await addMenuItem(shopId, itemData)
                if (newId) {
                    // Update showcase
                    setRecentlyAdded(prev => [{...itemData, id: newId} as VendorMenuItem, ...prev])
                }
            }

            if (addAnother && !editingItem) {
                // Clear form but keep modal open
                setFormState({ ...EMPTY_FORM, category: formState.category }) // Remember category to speed up data entry
            } else {
                setShowAddModal(false)
                setEditingItem(null)
                setRecentlyAdded([])
            }
        } catch (error) {
            console.error("Failed to save menu item", error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!shopId) return
        await deleteMenuItem(shopId, id)
        setDeleteConfirm(null)
    }

    const handleBulkSoldOut = () => {
        if (!shopId) return
        menu.forEach(m => {
            toggleItemAvailability(shopId!, m.id, false)
            if ((m.stock ?? -1) >= 0) updateMenuItemStock(shopId!, m.id, 0)
        })
    }

    const allCategories = ["All", ...new Set(menu.map(m => m.category))]
    const filteredMenu = menu.filter(item => {
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
        const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const lowStockCount = menu.filter(m => (m.stock ?? -1) >= 0 && m.stock <= 5 && m.stock > 0).length
    const outOfStockCount = menu.filter(m => (m.stock ?? -1) === 0).length

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 font-medium">Syncing menu...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-5 pb-28 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">Menu Management</h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">
                        {menu.length} items • {menu.filter(m => m.available).length} available
                        {lowStockCount > 0 && <span className="text-amber-600 ml-1">• {lowStockCount} low stock</span>}
                        {outOfStockCount > 0 && <span className="text-red-500 ml-1">• {outOfStockCount} out of stock</span>}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50" onClick={handleBulkSoldOut}>
                        Mark All Sold Out
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={openAddModal}>
                        <Plus className="mr-1.5 h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockCount > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-xs font-bold text-amber-800">
                        {lowStockCount} item{lowStockCount > 1 ? "s" : ""} running low on stock. Update quantities to avoid missed orders.
                    </p>
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 bg-white text-sm"
                    />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
                    {allCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0",
                                selectedCategory === cat
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Item Name</th>
                            <th className="p-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="p-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="p-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="p-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 font-bold text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredMenu.map((item) => {
                            const stock = item.stock ?? -1
                            const isLow = stock >= 0 && stock <= 5 && stock > 0
                            const isOut = stock === 0
                            return (
                                <tr key={item.id} className={cn("hover:bg-gray-50/50 transition-colors", isOut && "bg-red-50/30")}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{item.image}</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("h-3.5 w-3.5 border-2 rounded-sm flex items-center justify-center", item.isVeg ? "border-emerald-600" : "border-red-600")}>
                                                        <div className={cn("h-1.5 w-1.5 rounded-full", item.isVeg ? "bg-emerald-600" : "bg-red-600")} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{item.name}</span>
                                                    {item.bestseller && <Badge className="bg-amber-100 text-amber-700 text-[10px] border-amber-200">★ Best</Badge>}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="text-xs font-normal bg-gray-50">{item.category}</Badge>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">₹{item.price}</td>
                                    <td className="p-4">
                                        {stock < 0 ? (
                                            <span className="text-xs font-bold text-gray-400">Unlimited</span>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleStockChange(item.id, -1)}
                                                    className="h-7 w-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-30"
                                                    disabled={stock <= 0}
                                                >
                                                    <Minus className="h-3.5 w-3.5 text-gray-600" />
                                                </button>
                                                <span className={cn(
                                                    "text-sm font-black w-8 text-center tabular-nums",
                                                    isOut ? "text-red-500" : isLow ? "text-amber-600" : "text-gray-900"
                                                )}>
                                                    {stock}
                                                </span>
                                                <button
                                                    onClick={() => handleStockChange(item.id, 1)}
                                                    className="h-7 w-7 rounded-lg bg-gray-100 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5 text-gray-600" />
                                                </button>
                                                {isLow && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-1">LOW</span>}
                                                {isOut && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded ml-1">OUT</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={item.available}
                                                onCheckedChange={() => handleToggleAvailability(item.id, item.available)}
                                            />
                                            <span className={cn("text-xs font-bold", item.available ? "text-emerald-600" : "text-gray-400")}>
                                                {item.available ? "In Stock" : "Sold Out"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEditModal(item)}>
                                                <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteConfirm(item.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-3">
                {filteredMenu.map((item) => {
                    const stock = item.stock ?? -1
                    const isLow = stock >= 0 && stock <= 5 && stock > 0
                    const isOut = stock === 0
                    return (
                        <div key={item.id} className={cn("bg-white p-3 rounded-xl border shadow-sm", isOut ? "border-red-200 bg-red-50/30" : "border-gray-200")}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <span className="text-3xl shrink-0">{item.image}</span>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-3.5 w-3.5 border-2 rounded-sm flex items-center justify-center shrink-0", item.isVeg ? "border-emerald-600" : "border-red-600")}>
                                                <div className={cn("h-1.5 w-1.5 rounded-full", item.isVeg ? "bg-emerald-600" : "bg-red-600")} />
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                                            {item.bestseller && <span className="text-amber-500 text-xs shrink-0">★</span>}
                                        </div>
                                        <p className="text-[10px] text-gray-500 line-clamp-1">{item.description}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none px-1.5 py-0 text-[10px]">{item.category}</Badge>
                                            <span className="font-bold text-gray-900">₹{item.price}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                                    <Switch
                                        checked={item.available}
                                        onCheckedChange={() => handleToggleAvailability(item.id, item.available)}
                                        className="data-[state=checked]:bg-emerald-600"
                                    />
                                    <span className={cn("text-[10px] font-bold uppercase", item.available ? "text-emerald-600" : "text-gray-400")}>
                                        {item.available ? "Active" : "Off"}
                                    </span>
                                </div>
                            </div>

                            {/* Stock Controls */}
                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Package className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Stock:</span>
                                    {stock < 0 ? (
                                        <span className="text-xs font-bold text-gray-500">Unlimited</span>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleStockChange(item.id, -1)}
                                                className="h-6 w-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-30"
                                                disabled={stock <= 0}
                                            >
                                                <Minus className="h-3 w-3 text-gray-600" />
                                            </button>
                                            <span className={cn(
                                                "text-sm font-black w-7 text-center tabular-nums",
                                                isOut ? "text-red-500" : isLow ? "text-amber-600" : "text-gray-900"
                                            )}>
                                                {stock}
                                            </span>
                                            <button
                                                onClick={() => handleStockChange(item.id, 1)}
                                                className="h-6 w-6 rounded-md bg-gray-100 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="h-3 w-3 text-gray-600" />
                                            </button>
                                            {isLow && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">LOW</span>}
                                            {isOut && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded">OUT</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEditModal(item)} className="px-2.5 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        Edit
                                    </button>
                                    <button onClick={() => setDeleteConfirm(item.id)} className="px-2.5 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filteredMenu.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-4xl mb-3">🍽️</div>
                    <h3 className="font-bold text-gray-800">No items found</h3>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or add a new item.</p>
                </div>
            )}

            {/* Add/Edit Modal (Split View) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className={cn("bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row", editingItem ? "max-w-xl" : "max-w-4xl")} onClick={e => e.stopPropagation()}>
                        
                        {/* Form Section */}
                        <div className="flex flex-col w-full">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                                <h3 className="text-lg font-black text-gray-900">{editingItem ? "Edit Item" : "Add New Item"}</h3>
                                {editingItem && (
                                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg md:hidden">
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                )}
                            </div>

                            <div className="p-5 space-y-4 overflow-y-auto flex-1">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Item Name *</label>
                                    <Input value={formState.name} onChange={e => setFormState({ ...formState, name: e.target.value })} placeholder="Chicken Biryani" className="text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Description</label>
                                    <Input value={formState.description} onChange={e => setFormState({ ...formState, description: e.target.value })} placeholder="Aromatic rice with spices..." className="text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Price (₹) *</label>
                                        <Input type="number" value={formState.price} onChange={e => setFormState({ ...formState, price: e.target.value })} placeholder="120" className="text-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Category *</label>
                                        <Input
                                            value={formState.category}
                                            onChange={e => setFormState({ ...formState, category: e.target.value })}
                                            placeholder="Main Course"
                                            list="categories"
                                            className="text-sm"
                                        />
                                        <datalist id="categories">
                                            {categories.map(c => <option key={c.id} value={c.name} />)}
                                        </datalist>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Image (emoji or URL)</label>
                                        <Input value={formState.image} onChange={e => setFormState({ ...formState, image: e.target.value })} placeholder="🍗 or https://..." className="text-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Stock Quantity</label>
                                        <Input
                                            type="number"
                                            value={formState.stock}
                                            onChange={e => setFormState({ ...formState, stock: e.target.value })}
                                            placeholder="-1 for unlimited"
                                            min={-1}
                                            className="text-sm"
                                        />
                                        <p className="text-[9px] text-gray-400 font-medium">Use -1 for unlimited stock</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border">
                                        <Switch checked={formState.isVeg} onCheckedChange={v => setFormState({ ...formState, isVeg: v })} />
                                        <span className="text-sm font-bold text-gray-700">{formState.isVeg ? "Veg" : "Non-Veg"}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border">
                                        <Switch checked={formState.available} onCheckedChange={v => setFormState({ ...formState, available: v })} />
                                        <span className="text-sm font-bold text-gray-700">Available</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer bg-amber-50 border-amber-200 px-3 py-2 rounded-lg border">
                                        <Switch checked={formState.bestseller} onCheckedChange={v => setFormState({ ...formState, bestseller: v })} />
                                        <span className="text-sm font-bold text-amber-900">Bestseller</span>
                                    </label>
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50 shrink-0">
                                <Button variant="outline" className="flex-1 bg-white" onClick={() => setShowAddModal(false)}>Close</Button>
                                {!editingItem && (
                                    <Button
                                        variant="outline"
                                        className="flex-[2] border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-white font-bold"
                                        onClick={() => handleSave(true)}
                                        disabled={saving || !formState.name || !formState.price || !formState.category}
                                    >
                                        {saving ? <div className="h-4 w-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" /> : "Save & Add Another"}
                                    </Button>
                                )}
                                <Button
                                    className={cn("bg-emerald-600 hover:bg-emerald-700 font-bold", editingItem ? "flex-1" : "flex-1")}
                                    onClick={() => handleSave(false)}
                                    disabled={saving || !formState.name || !formState.price || !formState.category}
                                >
                                    {saving ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        editingItem ? "Update Item" : "Done"
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Showcase Section (Right Column) - Only when Adding */}
                        {!editingItem && (
                            <div className="hidden md:flex flex-col w-[380px] bg-gray-50 border-l border-gray-200 shrink-0 relative">
                                <div className="absolute top-4 right-4">
                                     <button onClick={() => setShowAddModal(false)} className="p-2 bg-white hover:bg-gray-100 border shadow-sm rounded-lg opacity-50 hover:opacity-100 transition-opacity">
                                        <X className="h-4 w-4 text-gray-600 font-bold" />
                                    </button>
                                </div>
                                <div className="p-6 pb-2 border-b border-gray-200 bg-white">
                                    <h3 className="font-black text-[#0A2647] text-lg flex items-center gap-2">
                                        Recently Added <span className="text-emerald-500">✨</span>
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500 mt-1">Items added in this session will appear here.</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {recentlyAdded.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                                <UtensilsCrossed className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="font-bold text-gray-600">No items added yet</p>
                                            <p className="text-xs text-gray-500 mt-1">Fill the form and click "Save & Add Another" to quickly build your menu.</p>
                                        </div>
                                    ) : (
                                        recentlyAdded.map(item => (
                                            <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div className="bg-gray-50 w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 border border-gray-100">
                                                    {item.image}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-sm text-gray-900 truncate pr-2">{item.name}</h4>
                                                        <span className="font-bold text-emerald-700 text-sm shrink-0">₹{item.price}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{item.description || "No description"}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-gray-50">{item.category}</Badge>
                                                        <div className="flex items-center gap-1">
                                                            <div className={cn("h-2.5 w-2.5 border rounded-sm flex items-center justify-center", item.isVeg ? "border-emerald-600" : "border-red-600")}>
                                                                <div className={cn("h-1 w-1 rounded-full", item.isVeg ? "bg-emerald-600" : "bg-red-600")} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-600">{item.isVeg ? "Veg" : "Non-Veg"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Delete Item?</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                            <Button className="flex-1 bg-red-600 hover:bg-red-700 font-bold" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
