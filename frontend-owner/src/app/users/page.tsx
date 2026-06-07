'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Shield, ShieldAlert, KeyRound, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  role: {
    name: string;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/owner/users');
      setUsers(res.data);
    } catch {
      toast.error('Nie udało się pobrać użytkowników');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/owner/users/${userId}/status`, { status: newStatus });
      toast.success(`Status zmieniony na: ${newStatus}`);
      fetchUsers();
    } catch {
      toast.error('Błąd podczas zmiany statusu');
    }
  };

  const handlePasswordReset = async (userId: string) => {
    const newPassword = prompt('Wpisz nowe hasło dla tego użytkownika (min 6 znaków):');
    if (!newPassword) return;
    if (newPassword.length < 6) {
      toast.error('Hasło jest za krótkie');
      return;
    }

    try {
      await api.patch(`/owner/users/${userId}/password`, { newPassword });
      toast.success('Hasło nadpisane pomyślnie');
    } catch {
      toast.error('Błąd podczas nadpisywania hasła');
    }
  };

  if (isLoading) return <div className="p-4 text-slate-500">Ładowanie użytkowników...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Zarządzanie Użytkownikami</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Imię i Nazwisko</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rola</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Akcje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role.name === 'Właściciel' ? 'bg-purple-100 text-purple-800' :
                      u.role.name === 'Sekretariat' ? 'bg-blue-100 text-blue-800' :
                      u.role.name === 'Kierowca' ? 'bg-orange-100 text-orange-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {u.role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status === 'active' ? 'Aktywny' : 'Zablokowany'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handlePasswordReset(u.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Zresetuj hasło"
                      >
                        <KeyRound className="w-5 h-5" />
                      </button>
                      
                      {u.status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(u.id, 'blocked')}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Zablokuj"
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(u.id, 'active')}
                          className="p-1.5 text-slate-400 hover:text-green-600 transition-colors"
                          title="Odblokuj"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
