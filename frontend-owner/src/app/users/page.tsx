'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Shield, ShieldAlert, KeyRound, CheckCircle, Trash2, UserPlus, Loader2 } from 'lucide-react';

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

const createUserSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  firstName: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki'),
  lastName: z.string().min(2, 'Nazwisko musi mieć co najmniej 2 znaki'),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  roleId: z.string().min(1, 'Wybierz rolę'),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      roleId: '',
    },
  });

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
      toast.success(`Status zmieniony na: ${newStatus === 'active' ? 'Aktywny' : 'Zablokowany'}`);
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
      await api.patch(`/owner/users/${userId}/password`, { password: newPassword });
      toast.success('Hasło nadpisane pomyślnie');
    } catch {
      toast.error('Błąd podczas nadpisywania hasła');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Czy na pewno chcesz bezpowrotnie usunąć konto użytkownika ${email}?`)) {
      return;
    }

    try {
      await api.delete(`/owner/users/${userId}`);
      toast.success('Konto użytkownika zostało usunięte');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Nie udało się usunąć użytkownika.');
    }
  };

  const onSubmit = async (data: CreateUserFormValues) => {
    setActionLoading(true);
    try {
      await api.post('/owner/users', {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        password: data.password,
        roleId: Number(data.roleId),
      });
      toast.success('Nowy użytkownik został pomyślnie dodany!');
      reset();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Błąd podczas rejestracji użytkownika');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading && users.length === 0) {
    return <div className="p-4 text-slate-500">Ładowanie użytkowników...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="text-blue-600 w-8 h-8" />
        <h1 className="text-3xl font-bold text-slate-900">Zarządzanie Użytkownikami</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add User Form */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 self-start shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <UserPlus className="text-slate-700" size={18} />
            <h2 className="text-lg font-semibold text-gray-800">Nowy Użytkownik</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Imię</label>
              <input
                type="text"
                placeholder="np. Jan"
                {...register('firstName')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nazwisko</label>
              <input
                type="text"
                placeholder="np. Kowalski"
                {...register('lastName')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="np. jan.kowalski@kkbus.pl"
                {...register('email')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hasło</label>
              <input
                type="password"
                placeholder="min. 6 znaków"
                {...register('password')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefon (opcjonalnie)</label>
              <input
                type="text"
                placeholder="np. 600100200"
                {...register('phone')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rola</label>
              <select
                {...register('roleId')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Wybierz rolę...</option>
                <option value="4">Właściciel (Owner)</option>
                <option value="3">Sekretariat (Secretariat)</option>
                <option value="2">Kierowca (Driver)</option>
                <option value="1">Klient (Customer)</option>
              </select>
              {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId.message}</p>}
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              Utwórz Użytkownika
            </button>
          </form>
        </div>

        {/* Users List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
                      <div className="flex justify-end gap-3 items-center">
                        <button
                          onClick={() => handlePasswordReset(u.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Zresetuj hasło"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        
                        {u.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(u.id, 'blocked')}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Zablokuj"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(u.id, 'active')}
                            className="p-1.5 text-slate-400 hover:text-green-600 transition-colors cursor-pointer"
                            title="Odblokuj"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1.5 text-slate-400 hover:text-red-700 transition-colors cursor-pointer"
                          title="Usuń użytkownika"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
