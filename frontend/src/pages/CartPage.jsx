import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../services/cart_service.js';
import { checkout } from '../services/order_service.js';
import { logout } from '../services/auth_service.js';

function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState(null);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        shipping_address: '',
        shipping_phone: '',
        notes: '',
    });
    const [orderSuccess, setOrderSuccess] = useState(null);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getCart();
            setCart(response.data || { items: [], totalItems: 0, totalAmount: 0 });
        } catch (err) {
            if (err.status === 401) {
                logout();
                navigate('/login');
                return;
            }
            setError(err.message || 'Không thể tải giỏ hàng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            await updateCartItem(productId, newQuantity);
            await loadCart();
        } catch (err) {
            setError(err.message || 'Không thể cập nhật');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeFromCart(productId);
            await loadCart();
        } catch (err) {
            setError(err.message || 'Không thể xóa');
        }
    };

    const handleClearCart = async () => {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;

        try {
            await clearCart();
            await loadCart();
        } catch (err) {
            setError(err.message || 'Không thể xóa giỏ');
        }
    };

    const handleCheckout = async () => {
        try {
            setIsCheckingOut(true);
            setError(null);

            const response = await checkout(shippingInfo);
            setOrderSuccess(response.data.order);
            setShowCheckoutModal(false);
            setCart({ items: [], totalItems: 0, totalAmount: 0 });
        } catch (err) {
            setError(err.message || 'Không thể đặt hàng');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    // Order Success Screen
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Đặt hàng thành công!</h2>
                    <p className="text-gray-600 mb-2">Mã đơn hàng: <span className="font-mono text-purple-600">{orderSuccess.id?.slice(0, 8)}</span></p>
                    <p className="text-gray-600 mb-6">Tổng tiền: <span className="font-bold text-purple-600">{formatCurrency(orderSuccess.total_amount)}</span></p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/fitting-room')}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Tiếp tục mua sắm
                        </button>
                        <button
                            onClick={() => setOrderSuccess(null)}
                            className="px-6 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                            Xem giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        🛒 Giỏ hàng
                        {cart.totalItems > 0 && (
                            <span className="ml-2 text-lg font-normal text-gray-500">
                                ({cart.totalItems} sản phẩm)
                            </span>
                        )}
                    </h1>
                    <button
                        onClick={() => navigate('/fitting-room')}
                        className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Tiếp tục mua
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {cart.items.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
                        <button
                            onClick={() => navigate('/fitting-room')}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all"
                        >
                            Đến phòng thử đồ
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                        {item.product.image_url ? (
                                            <img
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                📦
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                                        {item.product.category && (
                                            <p className="text-sm text-gray-500">{item.product.category.name}</p>
                                        )}
                                        <p className="text-purple-600 font-semibold mt-1">
                                            {formatCurrency(item.product.price)}
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 mt-2">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                −
                                            </button>
                                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtotal & Remove */}
                                    <div className="text-right flex flex-col justify-between">
                                        <p className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                                        <button
                                            onClick={() => handleRemoveItem(item.product.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Clear Cart */}
                            <button
                                onClick={handleClearCart}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                                🗑️ Xóa toàn bộ giỏ hàng
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tạm tính ({cart.totalItems} sản phẩm)</span>
                                        <span>{formatCurrency(cart.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-green-600">Miễn phí</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>Tổng cộng</span>
                                        <span className="text-purple-600">{formatCurrency(cart.totalAmount)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowCheckoutModal(true)}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg"
                                >
                                    Đặt hàng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Checkout Modal */}
                {showCheckoutModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin giao hàng</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Địa chỉ giao hàng
                                    </label>
                                    <textarea
                                        value={shippingInfo.shipping_address}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, shipping_address: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Nhập địa chỉ giao hàng..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        value={shippingInfo.shipping_phone}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, shipping_phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="0912 345 678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ghi chú (tùy chọn)
                                    </label>
                                    <textarea
                                        value={shippingInfo.notes}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Ghi chú cho đơn hàng..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Tổng thanh toán:</span>
                                    <span className="text-purple-600">{formatCurrency(cart.totalAmount)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCheckoutModal(false)}
                                    className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${isCheckingOut
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
                                        }`}
                                >
                                    {isCheckingOut ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;
