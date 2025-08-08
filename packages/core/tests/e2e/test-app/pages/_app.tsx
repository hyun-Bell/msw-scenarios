import { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import { handlers } from '../mocks/handlers';

async function initMocks() {
  if (typeof window === 'undefined') return;

  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    // @ts-ignore
    window.mswHandlers = handlers;
    const { worker } = await import('../mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initMocks();
  }, []);

  return <Component {...pageProps} />;
}
