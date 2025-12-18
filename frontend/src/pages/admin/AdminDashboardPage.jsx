function AdminDashboardPage() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">📁</div>
          <div className="text-sm opacity-90 mb-1">Danh mục</div>
          <div className="text-2xl font-bold">Quản lý danh mục sản phẩm</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">👕</div>
          <div className="text-sm opacity-90 mb-1">Sản phẩm</div>
          <div className="text-2xl font-bold">Quản lý kho hàng</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">⚙️</div>
          <div className="text-sm opacity-90 mb-1">Hệ thống</div>
          <div className="text-2xl font-bold">Cấu hình & Báo cáo</div>
        </div>
      </div>
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Chào mừng đến Admin Dashboard</h2>
        <p className="text-gray-600">
          Sử dụng menu bên trái để quản lý danh mục và sản phẩm của cửa hàng.
        </p>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

