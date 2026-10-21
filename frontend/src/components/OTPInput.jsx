import React, { useRef, useState, useEffect } from 'react';

export default function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  onResend,
  resendCooldown = 60
}) {
  const inputsRef = useRef([]);
  const [digits, setDigits] = useState(Array(length).fill(''));
  const [countdown, setCountdown] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);

  // Sync internal digits with incoming value
  useEffect(() => {
    const chars = (value || '').split('').slice(0, length);
    const newDigits = Array(length).fill('');
    chars.forEach((c, idx) => {
      newDigits[idx] = c;
    });
    setDigits(newDigits);
  }, [value, length]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown > 0) {
      setCanResend(false);
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    const char = rawVal.replace(/\D/g, '').slice(-1); // only single digit

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    const fullCode = newDigits.join('');
    if (onChange) onChange(fullCode);

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (fullCode.length === length && !fullCode.includes('')) {
      if (onComplete) onComplete(fullCode);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
        if (onChange) onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, length);
    if (!pasteData) return;

    const newDigits = Array(length).fill('');
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setDigits(newDigits);
    const fullCode = newDigits.join('');
    if (onChange) onChange(fullCode);

    const focusIdx = Math.min(pasteData.length, length - 1);
    inputsRef.current[focusIdx]?.focus();

    if (pasteData.length === length && onComplete) {
      onComplete(fullCode);
    }
  };

  const triggerResend = () => {
    if (!canResend || disabled) return;
    setCountdown(resendCooldown);
    setCanResend(false);
    if (onResend) onResend();
  };

  return (
    <div className="otp-container">
      <div className="otp-boxes-row" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            disabled={disabled}
            className={`otp-digit-box ${digit ? 'filled' : ''}`}
            autoFocus={idx === 0}
          />
        ))}
      </div>

      <div className="otp-resend-row">
        <span className="resend-label">Didn't receive the code?</span>
        {canResend ? (
          <button
            type="button"
            className="resend-action-btn"
            onClick={triggerResend}
            disabled={disabled}
          >
            Resend OTP
          </button>
        ) : (
          <span className="resend-countdown">
            Resend in <strong className="text-yellow">{countdown}s</strong>
          </span>
        )}
      </div>

      <style>{`
        .otp-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
          margin: 12px 0;
        }
        .otp-boxes-row {
          display: flex;
          gap: 12px;
          justify-content: center;
          width: 100%;
        }
        .otp-digit-box {
          width: 52px;
          height: 60px;
          background: #111116;
          border: 1.5px solid rgba(250, 204, 21, 0.35);
          border-radius: 12px;
          text-align: center;
          font-size: 1.8rem;
          font-weight: 800;
          color: #facc15;
          caret-color: #facc15;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        .otp-digit-box:focus {
          border-color: #facc15;
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.45);
          transform: translateY(-2px);
          background: #181820;
        }
        .otp-digit-box.filled {
          border-color: rgba(250, 204, 21, 0.8);
          background: #14141b;
        }
        .otp-resend-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.88rem;
          color: #d1d5db;
        }
        .resend-action-btn {
          background: none;
          border: none;
          color: #facc15;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          font-size: 0.88rem;
          transition: color 0.15s ease;
        }
        .resend-action-btn:hover {
          color: #fef08a;
        }
        .resend-countdown {
          color: #ffffff;
        }
        .text-yellow {
          color: #facc15;
        }
        @media (max-width: 480px) {
          .otp-boxes-row {
            gap: 6px;
          }
          .otp-digit-box {
            width: clamp(34px, 11vw, 42px);
            height: 48px;
            font-size: 1.35rem;
            border-radius: 8px;
          }
        }
        @media (max-width: 360px) {
          .otp-boxes-row {
            gap: 4px;
          }
          .otp-digit-box {
            width: 32px;
            height: 44px;
            font-size: 1.2rem;
            border-radius: 6px;
          }
          .otp-resend-row {
            font-size: 0.78rem;
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
