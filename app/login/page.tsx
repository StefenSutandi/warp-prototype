import { LoginPage } from '@/components/auth/auth-pages';

export const metadata = {
  title: 'WARP - Login',
  description: 'Sign in to the WARP prototype workspace',
};

export default function LoginRoute() {
  return <LoginPage />;
}
