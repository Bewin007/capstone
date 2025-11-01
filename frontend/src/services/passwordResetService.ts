import { api } from './api';
import { ApiResponse } from '../types';

export interface ForgotPasswordResponse {
  resetToken: string;
  otp: string;
  expiresIn: number;
}

export interface VerifyOTPResponse {
  resetToken: string;
  verified: boolean;
}

export const passwordResetService = {
  // Request password reset OTP
  forgotPassword: async (email: string): Promise<ApiResponse<ForgotPasswordResponse>> => {
    const response = await api.post<ApiResponse<ForgotPasswordResponse>>('/auth/forgot-password', {
      email,
    });

    return response.data;
  },

  // Verify OTP
  verifyOTP: async (resetToken: string, otp: string): Promise<ApiResponse<VerifyOTPResponse>> => {
    const response = await api.post<ApiResponse<VerifyOTPResponse>>('/auth/verify-otp', {
      resetToken,
      otp,
    });

    return response.data;
  },

  // Reset password
  resetPassword: async (resetToken: string, newPassword: string): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/auth/reset-password', {
      resetToken,
      newPassword,
    });

    return response.data;
  },

  // Resend OTP
  resendOTP: async (resetToken: string): Promise<ApiResponse<ForgotPasswordResponse>> => {
    const response = await api.post<ApiResponse<ForgotPasswordResponse>>('/auth/resend-otp', {
      resetToken,
    });

    return response.data;
  },

  // Open OTP display in new tab
  openOTPDisplay: (otp: string, resetToken: string): void => {
    const otpWindow = window.open('', '_blank', 'width=400,height=300,scrollbars=no,resizable=no');
    if (otpWindow) {
      otpWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Password Reset OTP</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .otp-container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 30px;
              border-radius: 15px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 20px 0;
              padding: 15px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 10px;
              font-family: 'Courier New', monospace;
            }
            .info {
              margin: 15px 0;
              font-size: 14px;
            }
            .timer {
              font-size: 18px;
              color: #ffeb3b;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="otp-container">
            <h2>🔐 Password Reset OTP</h2>
            <div class="info">Enter this OTP to reset your password:</div>
            <div class="otp-code" id="otpCode">${otp}</div>
            <div class="info">This OTP will expire in:</div>
            <div class="timer" id="timer">05:00</div>
            <div class="info" style="margin-top: 20px; font-size: 12px;">
              Keep this window open until you complete the password reset process.
            </div>
          </div>
          
          <script>
            // Countdown timer
            let timeLeft = 300; // 5 minutes
            const timerElement = document.getElementById('timer');
            
            const countdown = setInterval(() => {
              const minutes = Math.floor(timeLeft / 60);
              const seconds = timeLeft % 60;
              timerElement.textContent = 
                String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
              
              if (timeLeft <= 0) {
                clearInterval(countdown);
                timerElement.textContent = 'EXPIRED';
                timerElement.style.color = '#f44336';
                document.getElementById('otpCode').style.opacity = '0.5';
              }
              timeLeft--;
            }, 1000);
          </script>
        </body>
        </html>
      `);
      otpWindow.document.close();
    }
  },
};