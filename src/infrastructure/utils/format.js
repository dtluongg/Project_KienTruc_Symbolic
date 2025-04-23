/**
 * Định dạng số tiền theo định dạng tiền tệ Việt Nam
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã được định dạng (vd: 1.234.567 ₫)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}; 