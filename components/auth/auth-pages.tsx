'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AppRole, normalizeAppRole, ROLE_STORAGE_KEY } from '@/lib/types';

const WARP_LOGO = '/assets/figma-export/logo/warp-logo-full.svg';
const AUTH_ILLUSTRATION = '/assets/figma-export/auth/auth-illustration.png';

const DEMO_CREDENTIALS = {
  owner: { password: 'owner', role: 'owner', destination: '/owner' },
  coordinator: { password: 'coordinator', role: 'coordinator', destination: '/avatar' },
  member: { password: 'member', role: 'member', destination: '/avatar' },
  employer: { password: 'employer', role: 'owner', destination: '/owner' },
  employee: { password: 'employee', role: 'member', destination: '/avatar' },
} as const;

const SIGNUP_ROLES: { id: AppRole; label: string; description: string }[] = [
  { id: 'owner', label: 'Owner', description: 'Create and manage the workspace' },
  { id: 'coordinator', label: 'Coordinator', description: 'Coordinate projects and reviews' },
  { id: 'member', label: 'Member', description: 'Collaborate and complete tasks' },
];

function AuthShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="warp-font-ui min-h-screen bg-[#e2e0f0] text-[#111111]">
      <style>{`
        @keyframes warp-auth-enter {
          from {
            opacity: 0;
            transform: translateY(-18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes warp-auth-enter-centered {
          from {
            opacity: 0;
            transform: translate(-50%, -18px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .warp-auth-enter {
          animation: warp-auth-enter 680ms ease-out both;
        }

        .warp-auth-enter-centered {
          animation: warp-auth-enter-centered 680ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .warp-auth-enter,
          .warp-auth-enter-centered {
            animation: none;
            opacity: 1;
            transform: none;
          }

          .warp-auth-enter-centered {
            transform: translateX(-50%);
          }
        }
      `}</style>
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden p-[23px_25px_23px_22px] lg:block">
          <div className="relative h-full min-h-[720px] overflow-hidden rounded-[26px] bg-[linear-gradient(151.5deg,#f4f3ff_9.8%,#eef8fb_52.4%,#fdfdff_98.5%)]">
            <Image
              src={WARP_LOGO}
              alt="Warp"
              width={111}
              height={40}
              priority
              className="warp-auth-enter-centered absolute left-1/2 top-[58px] h-[40px] w-[111px] object-contain"
              style={{ animationDelay: '0ms' }}
            />

            <h1
              className="warp-auth-enter warp-font-header absolute left-[10.7%] top-[139px] text-[clamp(38px,3.34vw,48px)] font-extrabold leading-none tracking-[-0.035em] text-black"
              style={{ animationDelay: '120ms' }}
            >
              <span className="block">Enter your virtual</span>
              <span className="block text-[#685eeb]">workspace.</span>
            </h1>

            <Image
              src={AUTH_ILLUSTRATION}
              alt="A virtual WARP office with workspace tools"
              width={601}
              height={484}
              priority
              className="warp-auth-enter-centered absolute left-1/2 top-[271px] h-auto w-[min(89.3%,601px)] object-contain"
              style={{ animationDelay: '240ms' }}
            />
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[#f9fbfd] px-[24px] py-[42px] sm:px-[36px] lg:min-h-0">
          {children}
        </section>
      </div>
    </main>
  );
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
    <div className="warp-auth-enter w-full max-w-[560px]" style={{ animationDelay: '320ms' }}>
      <div className="mb-[34px] flex justify-center lg:hidden">
        <Image src={WARP_LOGO} alt="Warp" width={111} height={40} priority className="h-[40px] w-auto" />
      </div>
      <div className="min-h-[680px] rounded-[41px] bg-white px-[28px] py-[48px] shadow-[0_8px_44px_rgba(104,94,235,0.12)] sm:px-[60px] lg:px-[85px] lg:py-[72px]">
        <h2 className="warp-font-header text-[40px] font-extrabold leading-[normal] tracking-[-0.035em] text-black">{title}</h2>
        <p className="mt-[9px] whitespace-nowrap text-[15px] font-semibold leading-[normal] text-[#858585] max-sm:whitespace-normal">{description}</p>
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
  placeholder,
  rightControl,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rightControl?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-[10px] block text-[14px] font-bold text-[#858585]">{label}</span>
      <span className="flex h-[58px] items-center gap-[11px] rounded-[15px] border-2 border-[#858585] bg-white px-[19px] transition-all duration-150 hover:border-[#a29bfc] focus-within:border-[#685eeb] focus-within:shadow-[0_0_0_4px_rgba(104,94,235,0.10)] focus-within:ring-0">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#454545] outline-none placeholder:text-[#6a6a6a]"
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
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();
    const credential = DEMO_CREDENTIALS[normalizedUsername as keyof typeof DEMO_CREDENTIALS];

    if (credential && password === credential.password) {
      localStorage.setItem(ROLE_STORAGE_KEY, credential.role);
      localStorage.setItem('warpLoggedIn', 'true');
      router.push(credential.destination);
      return;
    }

    setError('Use owner, coordinator, or member with the matching password.');
  };

  return (
    <AuthShell>
      <AuthCard title="Login" description="Enter your credentials to access your workspace">
        <form onSubmit={handleSubmit} className="mt-[40px]">
          <div className="space-y-[28px]">
            <TextInput
              label="Username or email"
              value={username}
              onChange={(nextValue) => {
                setUsername(nextValue);
                setError('');
              }}
              placeholder="example@gmail.com"
            />
            <div>
              <div className="mb-[10px] flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#858585]">Password</span>
                <button type="button" className="rounded-sm text-[14px] font-bold text-[#858585] transition-colors duration-150 hover:text-[#685eeb] hover:underline hover:decoration-[#a29bfc] hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30">
                  Forgot password?
                </button>
              </div>
              <span className="flex h-[58px] items-center rounded-[15px] border-2 border-[#858585] bg-white pl-[19px] pr-[12px] transition-all duration-150 hover:border-[#a29bfc] focus-within:border-[#685eeb] focus-within:shadow-[0_0_0_4px_rgba(104,94,235,0.10)]">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#454545] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-[#858585] opacity-80 transition-all duration-150 hover:bg-[#f0eff8] hover:text-[#685eeb] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30 active:scale-95"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
                </button>
              </span>
            </div>
          </div>

          {error ? (
            <p className="mt-[10px] rounded-[12px] border border-[#ffd5d5] bg-[#fff3f3] px-[12px] py-[8px] text-[12px] font-semibold text-[#d94c4c]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-[24px] flex h-[48px] w-full items-center justify-center rounded-[15px] bg-[linear-gradient(104deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(104,94,235,0.28)] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-[1.04] hover:shadow-[0_8px_20px_rgba(104,94,235,0.34)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#685eeb]/20 active:translate-y-[1px] active:scale-[0.99] active:brightness-95"
          >
            Login to WARP
          </button>

          <p className="mt-[18px] text-center text-[14px] font-medium text-[#858585]">or continue with</p>

          <button
            type="button"
            className="mt-[18px] flex h-[48px] w-full items-center justify-center gap-[8px] rounded-[15px] border border-[#bdbdbd] bg-white text-[15px] font-medium text-[#454545] shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#a9a9a9] hover:bg-[#f5f5f7] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#685eeb]/15 active:translate-y-[1px] active:scale-[0.99]"
          >
            <span className="flex h-[18px] w-[18px] items-center justify-center text-[14px] font-black text-[#4285f4]">
              G
            </span>
            Continue with Google
          </button>
        </form>

        <p className="mt-[20px] text-center text-[14px] font-normal text-[#858585]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="rounded-sm font-bold text-[#685eeb] transition-colors duration-150 hover:text-[#4f45d9] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30">
            Sign up here
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
  const [selectedRole, setSelectedRole] = useState<AppRole>('member');

  useEffect(() => {
    const storedRole = normalizeAppRole(localStorage.getItem(ROLE_STORAGE_KEY));
    if (storedRole) setSelectedRole(storedRole);
  }, []);

  return (
    <AuthShell>
      <AuthCard title="Sign Up" description="Create a demo account to continue.">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
            router.push('/verify');
          }}
          className="mt-[30px] space-y-[18px]"
        >
          <TextInput label="Full name" value={name} onChange={setName} placeholder="Your name" />
          <TextInput label="Email" value={email} onChange={setEmail} placeholder="you@company.com" />
          <TextInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="Create password"
            rightControl={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-[#858585] opacity-80 transition-all duration-150 hover:bg-[#f0eff8] hover:text-[#685eeb] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30 active:scale-95"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
              </button>
            }
          />
          <fieldset>
            <legend className="mb-[8px] text-[13px] font-semibold text-[#5c5780]">Workspace role</legend>
            <div className="grid gap-[8px] sm:grid-cols-3">
              {SIGNUP_ROLES.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'rounded-[13px] border px-[10px] py-[11px] text-left transition',
                      isSelected
                        ? 'border-[#685eeb] bg-[#f0eff8] shadow-[0_6px_16px_rgba(104,94,235,0.10)]'
                        : 'border-[#e2e0f0] bg-white hover:bg-[#f9fbfd]'
                    )}
                  >
                    <span className={cn('block text-[12px] font-bold', isSelected ? 'text-[#685eeb]' : 'text-[#111111]')}>{role.label}</span>
                    <span className="mt-[3px] block text-[9px] leading-[1.3] text-[#858585]">{role.description}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <button
            type="submit"
            className="flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[linear-gradient(97deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] text-[15px] font-extrabold text-white shadow-[0_4px_12px_rgba(104,94,235,0.28)] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-[1.04] hover:shadow-[0_8px_20px_rgba(104,94,235,0.34)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#685eeb]/20 active:translate-y-[1px] active:scale-[0.99] active:brightness-95"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-[24px] text-center text-[13px] font-medium text-[#858585]">
          Already have account?{' '}
          <Link href="/login" className="rounded-sm font-bold text-[#685eeb] transition-colors duration-150 hover:text-[#4f45d9] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30">
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
    <AuthShell>
      <AuthCard title="Verification Code" description="Enter the four digit code sent to your email.">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const storedRole = normalizeAppRole(localStorage.getItem(ROLE_STORAGE_KEY)) ?? 'member';
            localStorage.setItem(ROLE_STORAGE_KEY, storedRole);
            router.push('/avatar');
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
