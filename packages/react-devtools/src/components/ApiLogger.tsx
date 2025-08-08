'use client';import React, { useState, useEffect } from 'react';
import type { ApiCall } from '../types';

export function ApiLogger() {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [filter, setFilter] = useState<'all' | 'mocked' | 'unmocked'>('all');
  const [autoScroll, setAutoScroll] = useState(true);

  // Mock data for demonstration - in real app, this would come from MSW or a hook
  useEffect(() => {
    const mockCalls: ApiCall[] = [
      {
        id: '1',
        timestamp: Date.now() - 5000,
        method: 'GET',
        path: '/api/users',
        status: 200,
        preset: 'success',
        duration: 45
      },
      {
        id: '2',
        timestamp: Date.now() - 3000,
        method: 'POST',
        path: '/api/users',
        status: 201,
        preset: 'created',
        duration: 120
      },
      {
        id: '3',
        timestamp: Date.now() - 1000,
        method: 'GET',
        path: '/api/posts',
        status: 404,
        duration: 80
      }
    ];
    setApiCalls(mockCalls);
  }, []);

  const filteredCalls = apiCalls.filter(call => {
    if (filter === 'mocked') return !!call.preset;
    if (filter === 'unmocked') return !call.preset;
    return true;
  });

  const clearLogs = () => {
    setApiCalls([]);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          API Call Logs
        </h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-gray-600 dark:text-gray-400">Auto scroll</span>
          </label>
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { key: 'all', label: 'All' },
            { key: 'mocked', label: 'Mocked' },
            { key: 'unmocked', label: 'Real' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-auto">
        {filteredCalls.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-4 opacity-50">
              <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.5L8 21l-1.5-1.5L8 18h12c1.1 0 2-.9 2-2V8h-2v8H8l1.5 1.5z"/>
            </svg>
            <p className="text-lg font-medium mb-2">No API calls</p>
            <p className="text-sm">Make some API calls to see them logged here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCalls.map((call) => (
              <ApiCallCard key={call.id} call={call} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ApiCallCardProps {
  call: ApiCall;
}

function ApiCallCard({ call }: ApiCallCardProps) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PUT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusColors: Record<number, string> = {
    200: 'text-green-600 dark:text-green-400',
    201: 'text-green-600 dark:text-green-400',
    400: 'text-orange-600 dark:text-orange-400',
    401: 'text-orange-600 dark:text-orange-400',
    403: 'text-red-600 dark:text-red-400',
    404: 'text-red-600 dark:text-red-400',
    500: 'text-red-600 dark:text-red-400',
  };

  const getStatusBackground = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    if (status >= 400 && status < 500) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700';
    if (status >= 500) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (duration: number) => {
    return `${duration}ms`;
  };

  return (
    <div className={`p-3 border rounded-lg ${getStatusBackground(call.status)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${
              methodColors[call.method] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {call.method}
            </span>
            <span className={`text-sm font-mono font-medium ${
              statusColors[call.status] || 'text-gray-600 dark:text-gray-400'
            }`}>
              {call.status}
            </span>
            {call.preset && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                {call.preset}
              </span>
            )}
          </div>
          <div className="text-sm font-mono text-gray-900 dark:text-white mb-1">
            {call.path}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTime(call.timestamp)}</span>
            <span>•</span>
            <span>{formatDuration(call.duration)}</span>
            {call.preset && (
              <>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400">Mocked</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}