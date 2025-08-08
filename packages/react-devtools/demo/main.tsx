import React from 'react';
import { createRoot } from 'react-dom/client';
import { MswDevtools } from '../src';
import '../src/styles.css';

function App() {
  const [count, setCount] = React.useState(0);

  const fetchData = async (endpoint: string) => {
    try {
      const response = await fetch(`/api/${endpoint}`);
      const data = await response.json();
      console.log(`Fetched from ${endpoint}:`, data);
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          MSW DevTools Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test API Calls
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => fetchData('users')}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Fetch Users
              </button>
              <button
                onClick={() => fetchData('posts')}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Fetch Posts
              </button>
              <button
                onClick={() => fetchData('users/1')}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Fetch User Detail
              </button>
              <button
                onClick={() => {
                  fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: 'New User',
                      email: 'user@example.com',
                    }),
                  });
                }}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
              >
                Create User
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Interactive Demo
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Counter:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {count}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCount(count + 1)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => setCount(0)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                DevTools Usage
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Press{' '}
                <kbd className="px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-800 rounded">
                  Ctrl+Shift+M
                </kbd>{' '}
                or click the floating button to open MSW DevTools.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MswDevtools
        position="bottom-right"
        defaultOpen={false}
        enableKeyboardShortcuts={true}
        theme="auto"
      />
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
