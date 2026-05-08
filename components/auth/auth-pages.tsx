'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Check, Eye, EyeOff, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const WARP_LOGO = '/assets/dashboard-employer/branding/warp-logo.svg';

function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="warp-font-ui min-h-screen bg-[#f9fbfd] text-[#111111]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(420px,0.92fr)_minmax(520px,1fr)]">
        <section className="relative hidden overflow-hidden bg-[#e2e0f0] p-[34px] lg:block">
          <div className="flex h-full flex-col rounded-[28px] bg-[linear-gradient(145deg,#f5f3ff_0%,#eef8fb_55%,#ffffff_100%)] p-[34px] shadow-[0_18px_48px_rgba(104,94,235,0.14)]">
            <Image src={WARP_LOGO} alt="Warp" width={119} height={29} priority className="h-[29px] w-auto" />

            <div className="mt-auto">
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#685eeb]">{eyebrow}</p>
              <h1 className="warp-font-display mt-[14px] max-w-[460px] text-[44px] font-extrabold leading-[0.98] tracking-[-0.04em] text-black">
                {title}
              </h1>
              <p className="mt-[18px] max-w-[390px] text-[15px] font-medium leading-[1.55] text-[#5c5780]">
                {subtitle}
              </p>
            </div>

            <div className="mt-[42px] rounded-[24px] border border-white/80 bg-white/70 p-[18px] shadow-[0_18px_36px_rgba(104,94,235,0.12)]">
              <div className="rounded-[18px] bg-[#f0eff8] p-[18px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[#111111]">Papers Studio</p>
                    <p className="mt-[4px] text-[11px] text-[#858585]">Team focus session</p>
                  </div>
                  <span className="rounded-full bg-[#d9fff4] px-[10px] py-[5px] text-[11px] font-semibold text-[#289f77]">
                    Online
                  </span>
                </div>
                <div className="mt-[22px] grid grid-cols-3 gap-[10px]">
                  {['Daily sync', 'Task review', 'Room chat'].map((item) => (
                    <div key={item} className="rounded-[14px] bg-white px-[12px] py-[13px] shadow-[0_6px_18px_rgba(104,94,235,0.07)]">
                      <div className="mb-[11px] h-[7px] w-[34px] rounded-full bg-[#685eeb]" />
                      <p className="text-[11px] font-semibold text-[#5c5780]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-[24px] py-[42px] sm:px-[36px]">
          {children}
        </section>
      </div>
    </main>
  );
}

function FieldIcon({ type }: { type: 'user' | 'mail' | 'lock' }) {
  const className = "h-[18px] w-[18px] text-[#9b96b8]";
  if (type === 'lock') return <Lock className={className} strokeWidth={1.8} />;
  if (type === 'mail') return <Mail className={className} strokeWidth={1.8} />;
  return <UserRound className={className} strokeWidth={1.8} />;
}

function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-[470px]">
      <div className="mb-[34px] flex justify-center lg:hidden">
        <Image src={WARP_LOGO} alt="Warp" width={119} height={29} priority className="h-[29px] w-auto" />
      </div>
      <div className="rounded-[28px] border border-[#e2e0f0] bg-white px-[28px] py-[30px] shadow-[0_20px_46px_rgba(104,94,235,0.10)] sm:px-[38px] sm:py-[38px]">
        <h2 className="warp-font-display text-[36px] font-extrabold leading-none tracking-[-0.04em] text-black">{title}</h2>
        <p className="mt-[10px] text-[14px] font-medium leading-[1.45] text-[#858585]">{description}</p>
        {children}
      </div>
    </div>
  );
}

function TextInput({
  label,
  type = 'text',
  value,
  onChange,
  icon,
  placeholder,
  rightControl,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  icon: 'user' | 'mail' | 'lock';
  placeholder: string;
  rightControl?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-[8px] block text-[13px] font-semibold text-[#5c5780]">{label}</span>
      <span className="flex h-[48px] items-center gap-[11px] rounded-[14px] border border-[#e2e0f0] bg-[#f9fbfd] px-[14px] transition focus-within:border-[#a29bfc] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#685eeb]/15">
        <FieldIcon type={icon} />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#111111] outline-none placeholder:text-[#a5a4a4]"
        />
        {rightControl}
      </span>
    </label>
  );
}

export function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername === 'employee' && password === 'employee') {
      localStorage.setItem('warpRole', 'employee');
      localStorage.setItem('warpLoggedIn', 'true');
      router.push('/employee');
      return;
    }

    if (normalizedUsername === 'employer' && password === 'employer') {
      localStorage.setItem('warpRole', 'employer');
      localStorage.setItem('warpLoggedIn', 'true');
      router.push('/employer');
      return;
    }

    setError('Use employee / employee or employer / employer for this prototype.');
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Enter your virtual workspace."
      subtitle="Sign in to continue into the WARP prototype as an employee or employer."
    >
      <AuthCard title="Login" description="Use your demo account to access the workspace.">
        <form onSubmit={handleSubmit} className="mt-[30px] space-y-[18px]">
          <TextInput
            label="Email or username"
            value={username}
            onChange={(nextValue) => {
              setUsername(nextValue);
              setError('');
            }}
            icon="user"
            placeholder="employee or employer"
          />
          <TextInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(nextValue) => {
              setPassword(nextValue);
              setError('');
            }}
            icon="lock"
            placeholder="Enter password"
            rightControl={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-[#5c5780] transition hover:bg-[#f0eff8] active:scale-95"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
              </button>
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-[12px]">
            <label className="flex cursor-pointer items-center gap-[9px] text-[13px] font-medium text-[#5c5780]">
              <span
                className={cn(
                  'flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition',
                  remember ? 'border-[#685eeb] bg-[#685eeb] text-white' : 'border-[#c8c4df] bg-white'
                )}
              >
                {remember ? <Check className="h-[13px] w-[13px]" strokeWidth={2.4} /> : null}
              </span>
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="sr-only" />
              Remember me
            </label>
            <button type="button" className="text-[13px] font-semibold text-[#685eeb] transition hover:text-[#4f45d9]">
              Forgot password?
            </button>
          </div>

          {error ? (
            <p className="rounded-[12px] border border-[#ffd5d5] bg-[#fff3f3] px-[12px] py-[10px] text-[12px] font-semibold text-[#d94c4c]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-[4px] flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[linear-gradient(97deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] text-[15px] font-extrabold text-white shadow-[0_14px_28px_rgba(104,94,235,0.22)] transition-all hover:brightness-[1.03] active:translate-y-[1px] active:scale-[0.99] active:brightness-95"
          >
            Login
          </button>

          <button
            type="button"
            className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[14px] border border-[#e2e0f0] bg-white text-[14px] font-bold text-[#5c5780] transition hover:bg-[#f9fbfd] active:translate-y-[1px] active:scale-[0.99]"
          >
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#e2e0f0] text-[12px] font-black text-[#685eeb]">
              G
            </span>
            Continue with Google
          </button>
        </form>

        <p className="mt-[24px] text-center text-[13px] font-medium text-[#858585]">
          Don't have account?{' '}
          <Link href="/signup" className="font-bold text-[#685eeb] transition hover:text-[#4f45d9]">
            Register Now
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

export function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthShell
      eyebrow="Create account"
      title="Build your workspace profile."
      subtitle="This static prototype screen mirrors the signup step before verification."
    >
      <AuthCard title="Sign Up" description="Create a demo account to continue.">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            router.push('/verify');
          }}
          className="mt-[30px] space-y-[18px]"
        >
          <TextInput label="Full name" value={name} onChange={setName} icon="user" placeholder="Your name" />
          <TextInput label="Email" value={email} onChange={setEmail} icon="mail" placeholder="you@company.com" />
          <TextInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            icon="lock"
            placeholder="Create password"
            rightControl={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-[#5c5780] transition hover:bg-[#f0eff8] active:scale-95"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
              </button>
            }
          />
          <button
            type="submit"
            className="flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[linear-gradient(97deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] text-[15px] font-extrabold text-white shadow-[0_14px_28px_rgba(104,94,235,0.22)] transition-all hover:brightness-[1.03] active:translate-y-[1px] active:scale-[0.99] active:brightness-95"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-[24px] text-center text-[13px] font-medium text-[#858585]">
          Already have account?{' '}
          <Link href="/login" className="font-bold text-[#685eeb] transition hover:text-[#4f45d9]">
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

export function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '']);

  return (
    <AuthShell
      eyebrow="Verification"
      title="Confirm your account code."
      subtitle="A visual-only verification step for the WARP prototype signup flow."
    >
      <AuthCard title="Verification Code" description="Enter the four digit code sent to your email.">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            router.push('/login');
          }}
          className="mt-[30px]"
        >
          <div className="flex justify-between gap-[12px]">
            {code.map((digit, index) => (
              <input
                key={index}
                value={digit}
                onChange={(event) => {
                  const nextCode = [...code];
                  nextCode[index] = event.target.value.slice(-1);
                  setCode(nextCode);
                }}
                inputMode="numeric"
                className="h-[58px] min-w-0 flex-1 rounded-[16px] border border-[#e2e0f0] bg-[#f9fbfd] text-center text-[24px] font-extrabold text-[#111111] outline-none transition focus:border-[#a29bfc] focus:bg-white focus:ring-2 focus:ring-[#685eeb]/15"
              />
            ))}
          </div>

          <div className="mt-[24px] flex items-center gap-[10px] rounded-[16px] bg-[#f0eff8] px-[14px] py-[12px] text-[12px] font-semibold text-[#5c5780]">
            <ShieldCheck className="h-[18px] w-[18px] text-[#685eeb]" />
            This screen is static for demo purposes.
          </div>

          <button
            type="submit"
            className="mt-[24px] flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[linear-gradient(97deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] text-[15px] font-extrabold text-white shadow-[0_14px_28px_rgba(104,94,235,0.22)] transition-all hover:brightness-[1.03] active:translate-y-[1px] active:scale-[0.99] active:brightness-95"
          >
            Continue
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
