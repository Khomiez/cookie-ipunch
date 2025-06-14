// src/app/(admin)/admin/products/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Power,
  PowerOff,
  AlertCircle,
  CheckCircle,
  X,
  Upload,
  Tag,
  DollarSign,
  Image as ImageIcon,
  RefreshCw,
  Download,
  Settings,
  Archive,
  Zap,
} from "lucide-react";
import { IProduct } from "@/interfaces/product";

interface ProductsResponse {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  images: string[];
  tag: string;
  category: string;
  active: boolean;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Bulk selection
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    images: [],
    tag: '',
    category: 'cookies',
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Check authentication
  useEffect(() => {
    const session = sessionStorage.getItem("fatsprinkle_admin_session");
    if (!session) {
      router.push("/admin/login");
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, currentPage, searchTerm, statusFilter]);

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      images: [],
      tag: '',
      category: 'cookies',
      active: true
    });
    setFormError('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (product: IProduct) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images || [],
      tag: product.tag || '',
      category: 'cookies',
      active: product.active ?? true
    });
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: IProduct) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedProduct(null);
    resetForm();
  };

  // Bulk selection handlers
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const clearSelection = () => {
    setSelectedProducts([]);
    setShowBulkActions(false);
  };

  // CRUD operations
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      await fetchProducts();
      closeModals();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      await fetchProducts();
      closeModals();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      await fetchProducts();
      closeModals();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductStatus = async (product: IProduct) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !product.active })
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  // Bulk operations
  const handleBulkOperation = async (action: string) => {
    if (selectedProducts.length === 0) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          productIds: selectedProducts 
        })
      });

      if (response.ok) {
        await fetchProducts();
        clearSelection();
      }
    } catch (error) {
      console.error('Bulk operation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const syncWithStripe = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/products/bulk', {
        method: 'PUT'
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f6f0" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7f6957]"></div>
      </div>
    );
  }

  const ProductFormModal = ({ isEdit = false }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ backgroundColor: "#fefbdc" }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#eaf7ff" }}
              >
                <Package size={24} style={{ color: "#7f6957" }} />
              </div>
              <h2 className="text-xl font-bold comic-text" style={{ color: "#7f6957" }}>
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-xl">
              <X size={20} style={{ color: "#7f6957" }} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={isEdit ? handleUpdate : handleCreate} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2 comic-text" style={{ color: "#7f6957" }}>
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none comic-text"
                style={{ 
                  backgroundColor: "white", 
                  borderColor: "#e5e7eb",
                  color: "#7f6957"
                }}
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 comic-text" style={{ color: "#7f6957" }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none comic-text h-24 resize-none"
                style={{ 
                  backgroundColor: "white", 
                  borderColor: "#e5e7eb",
                  color: "#7f6957"
                }}
                placeholder="Enter product description"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2 comic-text" style={{ color: "#7f6957" }}>
                Price (THB) *
              </label>
              <div className="relative">
                <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#7f6957" }} />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-2xl focus:outline-none comic-text"
                  style={{ 
                    backgroundColor: "white", 
                    borderColor: "#e5e7eb",
                    color: "#7f6957"
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Tag */}
            <div>
              <label className="block text-sm font-medium mb-2 comic-text" style={{ color: "#7f6957" }}>
                Tag
              </label>
              <div className="relative">
                <Tag size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#7f6957" }} />
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-2xl focus:outline-none comic-text"
                  style={{ 
                    backgroundColor: "white", 
                    borderColor: "#e5e7eb",
                    color: "#7f6957"
                  }}
                  placeholder="e.g. Popular, New, Limited"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium mb-2 comic-text" style={{ color: "#7f6957" }}>
                Image URL
              </label>
              <div className="relative">
                <ImageIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#7f6957" }} />
                <input
                  type="url"
                  value={formData.images[0] || ''}
                  onChange={(e) => setFormData({...formData, images: e.target.value ? [e.target.value] : []})}
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-2xl focus:outline-none comic-text"
                  style={{ 
                    backgroundColor: "white", 
                    borderColor: "#e5e7eb",
                    color: "#7f6957"
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="active" className="text-sm font-medium comic-text" style={{ color: "#7f6957" }}>
                Product is active and visible to customers
              </label>
            </div>

            {/* Error */}
            {formError && (
              <div className="p-4 rounded-2xl border" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
                <p className="text-red-600 text-sm comic-text flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={closeModals}
                className="flex-1 py-3 rounded-2xl border-2 border-dashed font-medium comic-text"
                style={{ borderColor: "#7f6957", color: "#7f6957" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-2xl text-white font-medium comic-text disabled:opacity-50"
                style={{ backgroundColor: "#7f6957" }}
              >
                {isSubmitting ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f6f0" }}>
      {/* Header */}
      <header 
        className="border-b shadow-sm"
        style={{ 
          backgroundColor: "rgba(255, 255, 255, 0.95)", 
          borderColor: "rgba(127, 105, 87, 0.1)"
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7f6957" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: "#7f6957" }}
                >
                  <Package size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold comic-text" style={{ color: "#7f6957" }}>
                    Products
                  </h1>
                  <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                    Manage your cookie inventory
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={syncWithStripe}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl border-2 border-dashed font-medium comic-text disabled:opacity-50"
                style={{ borderColor: "#7f6957", color: "#7f6957" }}
              >
                <RefreshCw size={16} className={isSubmitting ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
              
              <button 
                onClick={openCreateModal}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-medium comic-text hover:scale-105 transition-transform"
                style={{ backgroundColor: "#7f6957" }}
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Filters and Bulk Actions */}
          <div 
            className="rounded-2xl p-6 mb-6 shadow-sm border border-white/50"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search and Filters */}
              <div className="flex-1 flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#7f6957" }} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none comic-text"
                    style={{ 
                      backgroundColor: "#fefbdc", 
                      borderColor: "#e5e7eb",
                      color: "#7f6957"
                    }}
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 border-2 rounded-xl focus:outline-none comic-text"
                  style={{ 
                    backgroundColor: "#fefbdc", 
                    borderColor: "#e5e7eb",
                    color: "#7f6957"
                  }}
                >
                  <option value="all">All Products</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                {/* Bulk Select */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={selectAllProducts}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm comic-text" style={{ color: "#7f6957" }}>
                    Select All
                  </span>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedProducts.length > 0 && (
                <div className="flex items-center space-x-2 p-2 rounded-xl" style={{ backgroundColor: "#eaf7ff" }}>
                  <span className="text-sm font-medium comic-text" style={{ color: "#7f6957" }}>
                    {selectedProducts.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkOperation('activate')}
                    className="px-3 py-1 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50"
                  >
                    Enable
                  </button>
                  <button
                    onClick={() => handleBulkOperation('deactivate')}
                    className="px-3 py-1 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50"
                  >
                    Disable
                  </button>
                  <button
                    onClick={() => handleBulkOperation('delete')}
                    className="px-3 py-1 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={clearSelection}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={16} style={{ color: "#7f6957" }} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-white/50 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div 
              className="text-center py-12 rounded-2xl shadow-sm border border-white/50"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
            >
              <Package size={48} className="mx-auto mb-4 opacity-50" style={{ color: "#7f6957" }} />
              <h3 className="text-lg font-bold mb-2 comic-text" style={{ color: "#7f6957" }}>
                No products found
              </h3>
              <p className="opacity-75 mb-4 comic-text" style={{ color: "#7f6957" }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
              </p>
              <button 
                onClick={openCreateModal}
                className="px-6 py-3 rounded-xl text-white font-medium comic-text"
                style={{ backgroundColor: "#7f6957" }}
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="group rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                  >
                    {/* Selection Checkbox */}
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 rounded"
                      />
                      
                      {/* Status Badge */}
                      <span 
                        className={`px-2 py-1 text-xs font-medium rounded-full comic-text ${
                          product.active 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-gray-600 bg-gray-100'
                        }`}
                      >
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Product Image */}
                    <div className="relative mb-4">
                      <div 
                        className="w-full h-48 rounded-xl overflow-hidden group-hover:scale-[1.02] transition-transform"
                        style={{ backgroundColor: "#fefbdc" }}
                      >
                        {product.image && product.image !== '/api/placeholder/300/300' ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">🍪</span>
                          </div>
                        )}
                      </div>

                      {/* Tag */}
                      {product.tag && (
                        <div className="absolute top-2 left-2">
                          <span 
                            className="px-2 py-1 text-xs font-bold text-white rounded-full comic-text"
                            style={{ backgroundColor: "#7f6957" }}
                          >
                            {product.tag}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg mb-1 comic-text line-clamp-1" style={{ color: "#7f6957" }}>
                        {product.name}
                      </h3>
                      <p className="text-sm opacity-75 mb-2 comic-text line-clamp-2" style={{ color: "#7f6957" }}>
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold comic-text" style={{ color: "#7f6957" }}>
                          {product.price.toFixed(0)}.-
                        </span>
                        <span className="text-xs opacity-60 comic-text" style={{ color: "#7f6957" }}>
                          ID: {product.id.slice(-8)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleProductStatus(product)}
                        className={`flex-1 py-2 rounded-xl font-medium text-sm comic-text flex items-center justify-center space-x-1 ${
                          product.active 
                            ? 'border-2 border-dashed border-orange-400 text-orange-600 hover:bg-orange-50' 
                            : 'border-2 border-dashed border-green-400 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {product.active ? <PowerOff size={14} /> : <Power size={14} />}
                        <span>{product.active ? 'Disable' : 'Enable'}</span>
                      </button>
                      
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-4 py-2 rounded-xl text-white font-medium comic-text hover:scale-105 transition-transform"
                        style={{ backgroundColor: "#7f6957" }}
                      >
                        <Edit3 size={14} />
                      </button>
                      
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="px-4 py-2 rounded-xl text-white font-medium bg-red-500 hover:bg-red-600 hover:scale-105 transition-transform"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div 
                  className="flex items-center justify-between p-6 rounded-2xl shadow-sm border border-white/50"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                >
                  <div className="text-sm comic-text" style={{ color: "#7f6957" }}>
                    Showing {products.length} of {pagination.totalCount} products
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-2 rounded-lg border disabled:opacity-50 comic-text"
                      style={{ borderColor: "#7f6957", color: "#7f6957" }}
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 comic-text" style={{ color: "#7f6957" }}>
                      {currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-2 rounded-lg border disabled:opacity-50 comic-text"
                      style={{ borderColor: "#7f6957", color: "#7f6957" }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && <ProductFormModal />}
      {showEditModal && <ProductFormModal isEdit={true} />}
      
      {/* Delete Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl"
            style={{ backgroundColor: "#fefbdc" }}
          >
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "#fee2e2" }}
              >
                <AlertCircle size={32} className="text-red-500" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 comic-text" style={{ color: "#7f6957" }}>
                Delete Product?
              </h3>
              
              <p className="mb-6 comic-text" style={{ color: "#7f6957" }}>
                Are you sure you want to delete "{selectedProduct.name}"? This action will deactivate the product in Stripe and cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={closeModals}
                  className="flex-1 py-3 rounded-2xl border-2 border-dashed font-medium comic-text"
                  style={{ borderColor: "#7f6957", color: "#7f6957" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-2xl text-white font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50 comic-text"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}