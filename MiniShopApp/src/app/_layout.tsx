import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Loading } from '../components/Loading';

/**
 * Route guard: redirects unauthenticated users to /login.
 * Runs inside the providers so it has access to auth state.
 */
function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const isAuthScreen = (segments[0] as string) === 'login' || (segments[0] as string) === 'register';

    if (!user && !isAuthScreen) {
      router.replace('/login' as any);
    } else if (user && isAuthScreen) {
      router.replace('/' as any);
    }
  }, [user, isLoading, segments]);

  if (isLoading) return <Loading fullScreen message="Memulai aplikasi..." />;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouteGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: '#F8FAFC' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login"    options={{ animation: 'fade' }} />
            <Stack.Screen name="register" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="detail" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="success" options={{ gestureEnabled: false }} />
          </Stack>
        </RouteGuard>
      </CartProvider>
    </AuthProvider>
  );
}
