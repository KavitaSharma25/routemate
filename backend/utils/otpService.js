/**
 * OTP Service
 * Handles generation, validation, and expiration of One-Time Passwords
 */

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get OTP expiry time (15 minutes from now)
 * @returns {Date} Expiry timestamp
 */
const getOTPExpiry = () => {
  const now = new Date();
  return new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
};

/**
 * Check if OTP has expired
 * @param {Date} otpExpiry - OTP expiry timestamp
 * @returns {boolean} true if expired, false otherwise
 */
const isOTPExpired = (otpExpiry) => {
  return new Date() > new Date(otpExpiry);
};

/**
 * Verify OTP
 * @param {string} providedOTP - OTP provided by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} otpExpiry - OTP expiry timestamp
 * @returns {object} { valid: boolean, message: string }
 */
const verifyOTP = (providedOTP, storedOTP, otpExpiry) => {
  if (!storedOTP) {
    return { valid: false, message: 'OTP not generated yet' };
  }

  if (isOTPExpired(otpExpiry)) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (providedOTP.trim() !== storedOTP) {
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  isOTPExpired,
  verifyOTP
};
