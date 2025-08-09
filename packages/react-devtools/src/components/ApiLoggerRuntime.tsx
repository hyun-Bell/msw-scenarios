import { useState, useEffect } from 'react';
import { useMockingState } from '../hooks/useMockingState';
import { apiLoggerStyles as styles } from '../styles/apiLogger';

interface ApiLog {
  id: string;
  timestamp: Date;
  method: string;
  path: string;
  status: number;
  duration: number;
  preset?: string;
  request?: any;
  response?: any;
}

export function ApiLoggerRuntime() {
  const mockingState = useMockingState();
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [hoveredLog, setHoveredLog] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState(false);

  // Use actual API calls from mockingState
  useEffect(() => {
    if (!mockingState || !mockingState.recentApiCalls) return;

    // Convert recent API calls to logs
    const newLogs: ApiLog[] = mockingState.recentApiCalls.map((call) => ({
      id: call.id,
      timestamp: new Date(call.timestamp),
      method: call.method,
      path: call.path,
      status: call.status,
      duration: call.duration,
      preset: call.preset,
    }));

    setLogs(newLogs);
  }, [mockingState?.recentApiCalls]);

  const filteredLogs = logs.filter((log) => {
    // Filter by method
    if (filter !== 'all' && log.method.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    // Filter by search
    if (search && !log.path.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.status >= 200 && l.status < 300).length,
    error: logs.filter((l) => l.status >= 400).length,
    avgDuration:
      logs.length > 0
        ? Math.round(logs.reduce((acc, l) => acc + l.duration, 0) / logs.length)
        : 0,
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      // fractionalSecondDigits: 3, // Not supported in all browsers
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerRow}>
          <h3 style={styles.title}>API Request Logs</h3>
          <button
            onClick={handleClearLogs}
            style={{
              ...styles.clearButton,
              ...(hoveredButton === 'clear' ? styles.clearButtonHover : {}),
            }}
            onMouseEnter={() => setHoveredButton('clear')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Clear Logs
          </button>
        </div>
        <div style={styles.filters}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Methods</option>
            <option value="get">GET</option>
            <option value="post">POST</option>
            <option value="put">PUT</option>
            <option value="patch">PATCH</option>
            <option value="delete">DELETE</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocusedInput(true)}
            onBlur={() => setFocusedInput(false)}
            placeholder="Search by path..."
            style={{
              ...styles.filterInput,
              ...(focusedInput ? styles.filterInputFocus : {}),
            }}
          />
        </div>
      </div>

      {logs.length > 0 && (
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Total</div>
            <div style={styles.statValue}>{stats.total}</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Success</div>
            <div style={styles.statValue}>{stats.success}</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Errors</div>
            <div style={styles.statValue}>{stats.error}</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Avg Duration</div>
            <div style={styles.statValue}>{stats.avgDuration}ms</div>
          </div>
        </div>
      )}

      {filteredLogs.length > 0 ? (
        <div style={styles.logsList}>
          {filteredLogs.map((log) => {
            const isHovered = hoveredLog === log.id;
            return (
              <div
                key={log.id}
                style={{
                  ...styles.logEntry,
                  ...(isHovered ? styles.logEntryHover : {}),
                }}
                onMouseEnter={() => setHoveredLog(log.id)}
                onMouseLeave={() => setHoveredLog(null)}
              >
                <div style={styles.logHeader}>
                  <span style={styles.logTimestamp}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span style={styles.methodBadge(log.method)}>
                    {log.method}
                  </span>
                  <span style={styles.statusBadge(log.status)}>
                    {log.status}
                  </span>
                  <span style={styles.durationBadge}>{log.duration}ms</span>
                  {log.preset && (
                    <span style={styles.presetBadge}>{log.preset}</span>
                  )}
                </div>
                <div style={styles.logPath}>{log.path}</div>
                {isHovered && (
                  <div style={styles.logDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Request ID:</span>
                      <span style={styles.detailValue}>{log.id}</span>
                    </div>
                    {log.preset && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Preset:</span>
                        <span style={styles.detailValue}>{log.preset}</span>
                      </div>
                    )}
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Duration:</span>
                      <span style={styles.detailValue}>{log.duration}ms</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          <div style={styles.emptyTitle}>No API requests yet</div>
          <div style={styles.emptyText}>
            API requests will appear here as they are made
          </div>
        </div>
      )}
    </div>
  );
}
