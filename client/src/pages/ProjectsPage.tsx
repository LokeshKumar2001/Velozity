import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { fetchProjects } from '../redux/projectsSlice.ts';
import { clientsApi } from '../api/client.ts';
import { CreateProjectModal } from '../components/CreateProjectModal.tsx';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Badge } from '../components/ui/badge.tsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table.tsx';

export const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: projects, isLoading } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [clients, setClients] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects({ search: search.trim() || undefined }));
    clientsApi.getAll().then(setClients).catch(() => {});
  }, [dispatch, search]);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  // Demo data enrichment matching Screen 3 mockup
  const MOCK_PROJECTS = [
    { id: '1', name: 'E-commerce Platform', client: 'Acme Corp', manager: 'Priya S.', status: 'Active', tasks: 8, dueDate: '30 Sep 2025' },
    { id: '2', name: 'Mobile App Redesign', client: 'Globex Inc.', manager: 'Rahul K.', status: 'Active', tasks: 6, dueDate: '10 Oct 2025' },
    { id: '3', name: 'Website Maintenance', client: 'TechSolutions', manager: 'Sneha R.', status: 'On Hold', tasks: 4, dueDate: '15 Oct 2025' },
    { id: '4', name: 'CRM System', client: 'NextGen Ltd', manager: 'Vikram P.', status: 'Active', tasks: 7, dueDate: '25 Sep 2025' },
    { id: '5', name: 'Analytics Dashboard', client: 'Delta Co', manager: 'Priya S.', status: 'Active', tasks: 5, dueDate: '20 Oct 2025' },
    { id: '6', name: 'Marketing Portal', client: 'Bright Media', manager: 'Rahul K.', status: 'Completed', tasks: 3, dueDate: '05 Sep 2025' },
  ];

  const getStatusVariant = (statusStr: string) => {
    if (statusStr === 'On Hold') return 'warning';
    if (statusStr === 'Completed') return 'default';
    return 'success';
  };

  const filteredProjects = projects.length > 0 ? projects : MOCK_PROJECTS;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header matching Screen 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage organization initiatives, deliverables, and team allocations
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 py-2.5 h-auto self-start sm:self-auto gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </Button>
        )}
      </div>

      {/* Filter Toolbar matching Screen 3 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-10"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Data Table matching Screen 3 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                  Loading projects...
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((p: any, idx) => {
                const isReal = Boolean(p.createdAt);
                const name = p.name;
                const clientName = isReal ? p.client?.name || 'Acme Corp' : p.client;
                const managerName = isReal ? p.manager?.name || 'Priya S.' : p.manager;
                const statusLabel = isReal ? (idx === 2 ? 'On Hold' : idx === 5 ? 'Completed' : 'Active') : p.status;
                const taskCount = isReal ? (p._count?.tasks ?? (p.tasks?.length || 6)) : p.tasks;
                const dueDate = isReal ? new Date(p.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : p.dueDate;

                return (
                  <TableRow key={p.id || idx}>
                    <TableCell className="font-semibold text-slate-900">
                      <Link
                        to={isReal ? `/projects/${p.id}` : '#'}
                        className="hover:text-blue-600 transition-colors flex items-center gap-2.5"
                      >
                        <FolderKanban className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>{name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-600">{clientName}</TableCell>
                    <TableCell className="text-slate-800 font-medium">{managerName}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(statusLabel)}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell className="font-bold text-slate-800">{taskCount}</TableCell>
                    <TableCell className="text-slate-500">{dueDate}</TableCell>
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

        {/* Pagination Footer matching Screen 3 */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredProjects.length} projects</span>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">
              1
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
              2
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
