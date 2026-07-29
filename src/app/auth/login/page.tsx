'use client';

import React, { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('📝 [LOGIN] Form submitted with:', { email, passwordLength: password.length });

    try {
      console.log('📝 [LOGIN] Calling signIn...');

      const result = await signIn('credentials', {
        email: email.trim(),
        password: password,
        redirect: false,
      });

      console.log('📝 [LOGIN] SignIn result:', {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url,
      });

      if (!result) {
        console.log('❌ [LOGIN] No result returned');
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      if (result.error) {
        console.log('❌ [LOGIN] Sign in failed:', result.error);
        setError(result.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      if (result.ok) {
        console.log('✅ [LOGIN] Sign in successful, redirecting to:', callbackUrl);
        router.replace(callbackUrl);
        return;
      }

      console.log('❌ [LOGIN] Unexpected result status');
      setError('Sign in failed');
      setLoading(false);
    } catch (err) {
      console.error('❌ [LOGIN] Exception:', err);
      setError('An error occurred');
      setLoading(false);
    }
  }

  return (
    <main className="flex-grow flex flex-col md:flex-row min-h-screen">
      {/* Left Side: Branding */}
      <section className="hidden md:flex flex-col justify-between w-1/2 lg:w-[55%] bg-login-gradient p-2xl relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.15) 0%, transparent 40%)',
          }}
        />
        <header className="relative z-10 flex items-center gap-sm">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              api
            </span>
          </div>
          <div>
            <h1 className="font-h3 text-h3 text-primary dark:text-primary-fixed-dim">KMS</h1>
            <span className="font-label-md text-label-md text-secondary tracking-wide uppercase">
              Enterprise Support
            </span>
          </div>
        </header>
        <div className="relative z-10 flex-grow flex flex-col justify-center items-center">
          <div
            className="w-full max-w-lg mb-xl rounded-xl overflow-hidden border border-outline-variant/30 shadow-lg"
            style={{ aspectRatio: '16 / 9' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[64px]">hub</span>
            </div>
          </div>
          <div className="text-center max-w-md mx-auto">
            <h2 className="font-h2 text-h2 mb-sm text-on-surface dark:text-surface-bright">
              Unified Knowledge Delivery
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-outline">
              Access critical organizational intelligence, manage support tickets, and streamline
              workflows through our centralized enterprise portal.
            </p>
          </div>
        </div>
        <footer className="relative z-10 flex justify-between items-center text-outline dark:text-on-surface-variant font-label-md text-label-md">
          <span>© 2024 Nexus Enterprise Systems</span>
          <div className="flex gap-md">
            <a className="hover:text-primary transition-colors" href="#">
              Privacy
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Terms
            </a>
          </div>
        </footer>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center items-center p-lg md:p-2xl bg-surface dark:bg-inverse-surface shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-20">
        <div className="md:hidden flex items-center gap-sm mb-xl self-start">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              api
            </span>
          </div>
          <div>
            <h1 className="font-h3 text-h3 text-primary dark:text-primary-fixed-dim">KMS</h1>
            <span className="font-label-md text-label-md text-secondary tracking-wide uppercase">
              Enterprise Support
            </span>
          </div>
        </div>
        <div className="w-full max-w-[400px]">
          <div className="mb-lg">
            <h2 className="font-h2 text-h2 mb-xs text-on-surface dark:text-surface-bright">
              Welcome back
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
              Please enter your enterprise credentials to access the portal.
            </p>
          </div>

          {/* SSO Login */}
          <div className="mb-lg">
            <button
              type="button"
              className="w-full h-10 px-md bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant dark:border-outline text-on-surface dark:text-surface-bright font-label-md text-label-md rounded flex items-center justify-center gap-sm hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <span className="material-symbols-outlined text-[18px] text-[#00a4ef]">grid_view</span>
              Sign in with Microsoft SSO
            </button>
          </div>

          <div className="relative flex py-5 items-center mb-lg">
            <div className="flex-grow border-t border-outline-variant dark:border-on-surface-variant" />
            <span className="flex-shrink-0 mx-4 font-label-md text-label-md text-outline dark:text-on-surface-variant uppercase">
              Or continue with email
            </span>
            <div className="flex-grow border-t border-outline-variant dark:border-on-surface-variant" />
          </div>

          {error && (
            <div className="mb-lg p-md rounded bg-error-container/10 border border-error text-error dark:text-error">
              <p className="text-body-sm">{error}</p>
            </div>
          )}

          <form className="space-y-md" onSubmit={handleLogin}>
            <div>
              <label
                className="block font-label-md text-label-md text-on-surface dark:text-surface-bright mb-xs"
                htmlFor="email"
              >
                Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[18px]">mail</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                  className="w-full h-10 pl-10 pr-3 bg-surface dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded text-on-surface dark:text-surface-bright font-body-md text-body-md placeholder-outline focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-xs">
                <label
                  className="block font-label-md text-label-md text-on-surface dark:text-surface-bright"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[18px]">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full h-10 pl-10 pr-10 bg-surface dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded text-on-surface dark:text-surface-bright font-body-md text-body-md placeholder-outline focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface dark:hover:text-surface-bright focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center mt-sm">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="w-4 h-4 text-primary bg-surface dark:bg-inverse-surface border-outline-variant dark:border-outline rounded focus:ring-primary focus:ring-2 focus:ring-offset-0 focus:outline-none cursor-pointer"
              />
              <label
                className="ml-2 font-body-sm text-body-sm text-on-surface-variant dark:text-outline cursor-pointer select-none"
                htmlFor="remember"
              >
                Remember this device for 30 days
              </label>
            </div>
            <div className="pt-sm">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-xs hover:bg-primary-container focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-inverse-surface focus:outline-none transition-colors shadow-sm disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>

          <div className="mt-xl p-md rounded bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 dark:border-outline/30 flex items-start gap-sm">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">info</span>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface dark:text-surface-bright">
                Need Access?
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline mt-1">
                If you are a new employee, your access will be provisioned automatically within 24
                hours of onboarding. Contact IT Support for urgent requests.
              </p>
            </div>
          </div>

          <div className="md:hidden mt-xl pt-lg border-t border-outline-variant/30 flex flex-col gap-sm items-center text-outline font-label-md text-label-md">
            <span>© 2024 Nexus Enterprise Systems</span>
            <div className="flex gap-md">
              <a className="hover:text-primary" href="#">
                Privacy
              </a>
              <a className="hover:text-primary" href="#">
                Terms
              </a>
              <a className="hover:text-primary" href="#">
                Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function LoginPageWrapper() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center bg-surface"><span className="text-on-surface-variant">Loading...</span></main>}>
      <LoginContent />
    </Suspense>
  );
}

export default LoginPageWrapper;
