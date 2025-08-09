// tests/e2e/test-app/components/UserList.tsx
import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div data-testid="loading-state">Loading...</div>;
  }

  if (error) {
    return (
      <div data-testid="error-state" className="text-red-600 text-center p-8">
        {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div data-testid="empty-state" className="text-center py-8 text-gray-500">
        No users found
      </div>
    );
  }

  return (
    <div data-testid="user-list" className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
          className="btn btn-secondary"
          data-testid="logout-button"
        >
          Logout
        </button>
      </div>

      <div className="bg-white shadow rounded-lg divide-y">
        {users.map((user) => (
          <div
            key={user.id}
            data-testid="user-item"
            className="p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <span
              data-testid={`role-${user.role}`} // 테스트 ID 추가
              className={`px-2 py-1 text-xs rounded-full ${
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
