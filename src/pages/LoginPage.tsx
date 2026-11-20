import React, { useState } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';
import { authService } from '../services';
import { AuthSession } from '../types/cms';

interface LoginPageProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { locale, t, localizeError } = useLanguage();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const session = await authService.login({
        username: username.trim(),
        password,
      });
      onLoginSuccess(session);
    } catch (error) {
      setErrorMessage(localizeError(error, t.login.fallbackError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141414] relative flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      {/* Top-Right Language Switcher */}
      <div className="fixed top-6 right-6 sm:top-8 sm:right-10 z-30">
        <LanguageSwitcher />
      </div>

      {/* Subtle Architectural Framing Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
      >
        <div className="w-[720px] h-[720px] rounded-full border border-[#F0EAE0]" />
        <div className="absolute w-[540px] h-[540px] rounded-full border border-[#F4EFE6]" />
      </div>

      {/* Main Sharp-Edged Luxury Login Card */}
      <main className="relative z-10 w-full max-w-[440px]">
        <div className="bg-white border border-[#E2DACB] border-t-2 border-t-[#141414] px-9 sm:px-11 pt-12 pb-10 shadow-[0_20px_56px_rgba(20,20,20,0.06)]">
          {/* Brand Logo & Editorial Header */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/assets/remy/remy-logo.png"
              alt="Rémy Martin"
              width={185}
              height={76}
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className="h-[76px] w-auto object-contain"
            />

            {/* Champagne Hairline with Diamond Ornament */}
            <div className="flex items-center justify-center my-6" aria-hidden="true">
              <div className="w-12 h-[1px] bg-[#C5B28E]" />
              <div className="w-2 h-2 border border-[#A88950] rotate-45 mx-2 bg-white" />
              <div className="w-12 h-[1px] bg-[#C5B28E]" />
            </div>

            <h1 className="font-luxury text-[28px] tracking-[0.14em] text-[#141414] font-medium">
              AI SHOWCASE
            </h1>
            <p className="text-[12px] tracking-[0.18em] text-[#8E7D63] mt-1.5">
              {t.login.subtitle}
            </p>
          </div>

          {/* Minimal Sharp-Edged Login Form */}
          <form onSubmit={handleSubmit} className="mt-9 space-y-5" noValidate>
            <div className="mwg-field">
              <label
                htmlFor="cms-login-username"
                className={`block text-[12px] text-[#6E675C] mb-2 transition-colors ${
                  locale === 'en' ? 'tracking-normal' : 'tracking-[0.06em]'
                }`}
              >
                {t.login.usernameLabel}
              </label>
              <input
                id="cms-login-username"
                type="text"
                required
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={t.login.usernamePlaceholder}
                className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[14px] text-[#141414] placeholder:text-[#B5AEA2] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors disabled:opacity-60"
              />
            </div>

            <div className="mwg-field">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="cms-login-password"
                  className={`block text-[12px] text-[#6E675C] transition-colors ${
                    locale === 'en' ? 'tracking-normal' : 'tracking-[0.06em]'
                  }`}
                >
                  {t.login.passwordLabel}
                </label>
                <button
                  type="button"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[12px] text-[#8E7D63] hover:text-[#141414] transition-colors cursor-pointer"
                >
                  {showPassword ? t.login.hidePassword : t.login.showPassword}
                </button>
              </div>
              <input
                id="cms-login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={t.login.passwordPlaceholder}
                className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[14px] text-[#141414] placeholder:text-[#B5AEA2] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors disabled:opacity-60"
              />
            </div>

            {errorMessage && (
              <p role="alert" className="text-[12px] text-[#B9382C] pt-0.5">
                {errorMessage}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 bg-[#141414] hover:bg-[#A88950] disabled:opacity-65 text-white text-[13px] font-medium tracking-[0.14em] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A88950]"
              >
                {isSubmitting ? t.login.submitting : t.login.submitButton}
              </button>
            </div>
          </form>
        </div>

        {/* Quiet Brand Footer */}
        <footer className="mt-7 text-center text-[11px] tracking-[0.24em] text-[#9A8E7A] uppercase">
          RÉMY MARTIN · COGNAC FINE CHAMPAGNE
        </footer>
      </main>
    </div>
  );
};
