import { VerifyPage } from '@/components/auth/auth-pages';

export const metadata = {
  title: 'WARP - Verification Code',
  description: 'Verify your WARP prototype account',
};

export default function VerifyRoute() {
  return <VerifyPage />;
}
