import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/product_service.js';
import { tryOnProduct } from '../services/tryon_service.js';
import { getProfile } from '../services/profile_service.js';
import { logout } from '../services/auth_service.js';
import { addToCart } from '../services/cart_service.js';

function FittingRoomPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tryOnImageUrl, setTryOnImageUrl] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [imageCache, setImageCache] = useState({});
  const [categoryId, setCategoryId] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState({ type: '', text: '' });

  const currentProduct = products[currentIndex] || null;

  const minSwipeDistance = 50;

  useEffect(() => {
    checkProfileAndLoadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0 && currentIndex >= 0) {
      loadTryOnImage(products[currentIndex].id);
    }
  }, [currentIndex, products]);

  const checkProfileAndLoadProducts = async () => {
    try {
      setIsInitialLoading(true);
      setError(null);

      const profileResponse = await getProfile();
      const profile = profileResponse.data.profile;

      if (!profile.avatar_url) {
        setError('Bạn cần cập nhật ảnh toàn thân để sử dụng tính năng này');
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
        return;
      }

      setOriginalImageUrl(profile.avatar_url);

      const productsResponse = await getProducts(categoryId);
      const productsList = productsResponse.data.products || [];

      if (productsList.length === 0) {
        setError('Chưa có sản phẩm trong danh mục này');
        return;
      }

      setProducts(productsList);
      setCurrentIndex(0);
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadTryOnImage = useCallback(async (productId) => {
    if (imageCache[productId]) {
      setTryOnImageUrl(imageCache[productId]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await tryOnProduct(productId);
      const imageUrl = response.data.generated_image_url;

      setImageCache((prev) => ({
        ...prev,
        [productId]: imageUrl,
      }));
      setTryOnImageUrl(imageUrl);
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.message || 'Không thể tạo ảnh thử đồ');
      setTryOnImageUrl(originalImageUrl);
    } finally {
      setIsLoading(false);
    }
  }, [imageCache, originalImageUrl, navigate]);

  const handleNext = () => {
    if (isLoading) return;
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (isLoading) return;
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(products.length - 1);
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải phòng thử đồ...</p>
        </div>
      </div>
    );
  }

  if (error && !currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {error.includes('ảnh toàn thân') && (
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Đi đến trang hồ sơ
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="relative">
              <div
                className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 text-sm">AI đang ngắm bạn...</p>
                      <p className="text-gray-500 text-xs mt-2">Đang mặc thử áo...</p>
                    </div>
                  </div>
                ) : tryOnImageUrl ? (
                  <img
                    src={tryOnImageUrl}
                    alt={currentProduct?.name || 'Thử đồ'}
                    className="w-full h-full object-cover"
                  />
                ) : originalImageUrl ? (
                  <img
                    src={originalImageUrl}
                    alt="Ảnh gốc"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Chưa có ảnh
                  </div>
                )}
              </div>

              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={isLoading || products.length === 0}
                  className="w-12 h-12 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg"
                  aria-label="Sản phẩm trước"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    {currentIndex + 1} / {products.length}
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  disabled={isLoading || products.length === 0}
                  className="w-12 h-12 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg"
                  aria-label="Sản phẩm tiếp theo"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              {currentProduct ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {currentProduct.name}
                  </h1>
                  {currentProduct.description && (
                    <p className="text-gray-600 mb-4">{currentProduct.description}</p>
                  )}
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-purple-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(currentProduct.price)}
                    </span>
                  </div>
                  {currentProduct.category && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {currentProduct.category.name}
                      </span>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={async () => {
                      if (addingToCart || !currentProduct) return;
                      setAddingToCart(true);
                      setCartMessage({ type: '', text: '' });
                      try {
                        await addToCart(currentProduct.id, 1);
                        setCartMessage({ type: 'success', text: '🎉 Đã thêm vào giỏ hàng!' });
                        setTimeout(() => setCartMessage({ type: '', text: '' }), 3000);
                      } catch (err) {
                        setCartMessage({ type: 'error', text: err.message || 'Không thể thêm vào giỏ' });
                        setTimeout(() => setCartMessage({ type: '', text: '' }), 3000);
                      } finally {
                        setAddingToCart(false);
                      }
                    }}
                    disabled={addingToCart || isLoading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${addingToCart
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                  >
                    {addingToCart ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Thêm vào giỏ
                      </>
                    )}
                  </button>

                  {/* Cart Message Toast */}
                  {cartMessage.text && (
                    <div className={`mt-3 p-3 rounded-lg text-sm font-medium animate-pulse ${cartMessage.type === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                      {cartMessage.text}
                    </div>
                  )}

                  {/* Link to Cart */}
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full mt-3 py-2 px-4 rounded-lg font-medium text-purple-600 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Xem giỏ hàng
                  </button>
                  {currentProduct.image_url && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-500 mb-2">Ảnh sản phẩm:</p>
                      <img
                        src={currentProduct.image_url}
                        alt={currentProduct.name}
                        className="w-full max-w-sm rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Không có sản phẩm</p>
                </div>
              )}

              {error && currentProduct && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FittingRoomPage;

