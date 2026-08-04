import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Must be a valid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['noc_viewer', 'dc_manager', 'platform_admin']),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'noc_viewer',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setError(null);
      await axios.post('/api/v1/admin/users', data);
      reset();
      onUserCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user in Keycloak');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100">Create New User</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-md text-xs text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username *</label>
            <input
              {...register('username')}
              placeholder="johndoe"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
            {errors.username && <p className="text-xs text-rose-400 mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
            <input
              {...register('email')}
              placeholder="john@example.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
              <input
                {...register('firstName')}
                placeholder="John"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
              <input
                {...register('lastName')}
                placeholder="Doe"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Temporary Password *</label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role *</label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="noc_viewer">NOC Viewer (Read-only)</option>
              <option value="dc_manager">DC Manager (Read & Write)</option>
              <option value="platform_admin">Platform Admin (Full Access)</option>
            </select>
            {errors.role && <p className="text-xs text-rose-400 mt-1">{errors.role.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
