import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MSWProvider } from '@/lib/mock-setup';
import { DevToolsProvider } from '@/components/DevToolsProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MSW Scenarios Example',
  description: 'Next.js App Router example with MSW Scenarios and React DevTools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <MSWProvider>
          <div className="min-h-full bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white shadow">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900">
                      MSW Scenarios Example
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Next.js App Router + DevTools
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>

          {/* MSW DevTools - 개발 환경에서만 표시 */}
          <DevToolsProvider />
        </MSWProvider>
      </body>
    </html>
  );
}