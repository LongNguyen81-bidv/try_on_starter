import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminOrders, updateOrderStatus, getOrderStats } from '../../services/order_service.js';
import { logout } from '../../services/auth_service.js';
import AdminLayout from '../../components/AdminLayout.jsx';

function AdminOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const statusOptions = [
        { value: '', label: 'Tất cả' },
        { value: 'pending', label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
        { value: 'processing', label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800' },
        { value: 'shipped', label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
        { value: 'delivered', label: 'Đã giao', color: 'bg-green-100 text-green-800' },
        { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    ];

    const getStatusColor = (status) => {
        const option = statusOptions.find((opt) => opt.value === status);
        return option?.color || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const option = statusOptions.find((opt) => opt.value === status);
        return option?.label || status;
    };

    useEffect(() => {
        loadOrders();
        loadStats();
    }, [selectedStatus]);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getAdminOrders({ status: selectedStatus || undefined });
            setOrders(response.data?.orders || []);
        } catch (err) {
            if (err.status === 401) {
                logout();
                navigate('/login');
                return;
            }
            if (err.status === 403) {
                navigate('/');
                return;
            }
            setError(err.message || 'Không thể tải đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const statsData = await getOrderStats();
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            await loadOrders();
            await loadStats();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (err) {
            setError(err.message || 'Không thể cập nhật trạng thái');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">📦 Quản lý đơn hàng</h1>
                    <p className="text-gray-600">Xem và quản lý tất cả đơn hàng của khách hàng</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                        <p className="text-sm text-gray-500">Tổng đơn</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                        <p className="text-sm text-gray-500">Chờ xác nhận</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.confirmed || 0}</p>
                        <p className="text-sm text-gray-500">Đã xác nhận</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-indigo-600">{stats.processing || 0}</p>
                        <p className="text-sm text-gray-500">Đang xử lý</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.shipped || 0}</p>
                        <p className="text-sm text-gray-500">Đang giao</p>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.delivered || 0}</p>
                        <p className="text-sm text-gray-500">Đã giao</p>
                    </div>
                    <div className="bg-red-50 rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.cancelled || 0}</p>
                        <p className="text-sm text-gray-500">Đã hủy</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="mb-6">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">Chưa có đơn hàng nào</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã đơn
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm text-gray-900">
                                                #{order.id?.slice(0, 8)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {order.user?.name || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">{order.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-purple-600">
                                                {formatCurrency(order.total_amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} border-0 cursor-pointer`}
                                            >
                                                {statusOptions.slice(1).map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Chi tiết đơn hàng #{selectedOrder.id?.slice(0, 8)}
                                </h2>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Trạng thái:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                        {getStatusLabel(selectedOrder.status)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">Khách hàng:</span>
                                    <span className="font-medium">{selectedOrder.user?.name || 'N/A'}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">Email:</span>
                                    <span>{selectedOrder.user?.email}</span>
                                </div>

                                {selectedOrder.shipping_address && (
                                    <div>
                                        <span className="text-gray-500">Địa chỉ:</span>
                                        <p className="text-gray-900">{selectedOrder.shipping_address}</p>
                                    </div>
                                )}

                                <hr />

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Sản phẩm:</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span>
                                                    {item.product_name} x{item.quantity}
                                                </span>
                                                <span className="font-medium">{formatCurrency(item.unit_price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <hr />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng:</span>
                                    <span className="text-purple-600">{formatCurrency(selectedOrder.total_amount)}</span>
                                </div>

                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Ngày đặt:</span>
                                    <span>{formatDate(selectedOrder.created_at)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full mt-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminOrdersPage;
