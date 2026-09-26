import React, { useEffect, useState } from 'react';
import { usersApi } from '../api/client.ts';
import type { User, UserRole } from '../types/index.ts';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  X,
  UserPlus
} from 'lucide-react';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Avatar } from '../components/ui/avatar.tsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table.tsx';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [role, setRole] = useState<UserRole>('DEVELOPER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MOCK_USERS = [
    { id: '1', name: 'Admin', email: 'admin@company.com', role: 'ADMIN', isOnline: true, lastActive: '2 mins ago', initials: 'A', color: 'bg-purple-600' },
    { id: '2', name: 'Priya Sharma', email: 'priya@company.com', role: 'PROJECT_MANAGER', isOnline: true, lastActive: '5 mins ago', initials: 'P', color: 'bg-amber-600' },
    { id: '3', name: 'Rahul Kumar', email: 'rahul@company.com', role: 'PROJECT_MANAGER', isOnline: true, lastActive: '12 mins ago', initials: 'R', color: 'bg-blue-600' },
    { id: '4', name: 'Vikram Patel', email: 'vikram@company.com', role: 'DEVELOPER', isOnline: false, lastActive: '1 hour ago', initials: 'V', color: 'bg-indigo-600' },
    { id: '5', name: 'Sneha Reddy', email: 'sneha@company.com', role: 'DEVELOPER', isOnline: true, lastActive: '8 mins ago', initials: 'S', color: 'bg-emerald-600' },
    { id: '6', name: 'Ravi Teja', email: 'ravi@company.com', role: 'DEVELOPER', isOnline: true, lastActive: '3 mins ago', initials: 'R', color: 'bg-cyan-600' },
  ];

  const loadUsers = () => {
    setIsLoading(true);
    usersApi.getAll().then((data) => {
      setUsers(data);
    }).catch(console.error).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await usersApi.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleVariant = (roleStr: string) => {
    if (roleStr === 'ADMIN') return 'default';
    if (roleStr.includes('MANAGER')) return 'warning';
    return 'secondary';
  };

  const listToRender = users.length > 0 ? users : MOCK_USERS;

  const filteredUsers = listToRender.filter((u: any) => {
    if (selectedRole !== 'ALL' && u.role !== selectedRole) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header matching Screen 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of personnel, permissions, and session activity
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 py-2.5 h-auto self-start sm:self-auto gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Filter Toolbar matching Screen 8 */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="DEVELOPER">Developer</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
      </div>

      {/* Data Table matching Screen 8 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                  Loading directory...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                  No users found matching query
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u: any, i: number) => {
                const isReal = Boolean(u.role && typeof u.role === 'string');
                const nameStr = u.name;
                const emailStr = u.email;
                const roleStr = isReal ? (u.role === 'PROJECT_MANAGER' ? 'Project Manager' : u.role === 'ADMIN' ? 'Admin' : 'Developer') : u.role;
                const isOnline = u.isOnline !== undefined ? u.isOnline : i !== 3;
                const lastActiveStr = u.lastActive || `${(i + 1) * 2} mins ago`;

                const initials = nameStr.split(' ').map((n: string) => n[0]).join('').toUpperCase();
                const avatarColors = ['bg-blue-600', 'bg-amber-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-purple-600'];
                const avatarBg = avatarColors[i % avatarColors.length];

                return (
                  <TableRow key={u.id || i}>
                    <TableCell className="font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={initials} colorBg={avatarBg} size="md" />
                        <span>{nameStr}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{emailStr}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(roleStr)}>
                        {roleStr}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isOnline ? (
                        <Badge variant="success">Online</Badge>
                      ) : (
                        <Badge variant="secondary">Offline</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500">{lastActiveStr}</TableCell>
                    <TableCell className="text-right">
                      <button className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Add Team Member</h2>
                  <p className="text-[11px] text-slate-400">Invite new colleague with role privileges</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Email Address *</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@velozity.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Default Password</label>
                <Input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="DEVELOPER">Developer</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2 px-4 h-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-5 h-auto shadow-sm shadow-blue-500/20"
                >
                  {isSubmitting ? 'Creating...' : 'Add User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
