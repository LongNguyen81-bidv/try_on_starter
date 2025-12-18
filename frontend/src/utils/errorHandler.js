export const getErrorMessage = (error) => {
  if (!error) {
    return 'Đã xảy ra lỗi không xác định';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  if (error.status === 0) {
    return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
  }

  if (error.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }

  if (error.status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }

  if (error.status === 404) {
    return 'Không tìm thấy dữ liệu.';
  }

  if (error.status === 409) {
    return 'Dữ liệu đã tồn tại hoặc xung đột.';
  }

  if (error.status >= 500) {
    return 'Lỗi server. Vui lòng thử lại sau.';
  }

  return 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
};

export const handleApiError = (error, toast) => {
  const message = getErrorMessage(error);
  
  if (toast && toast.error) {
    toast.error(message);
  }
  
  return message;
};

