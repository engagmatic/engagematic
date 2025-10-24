/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}/api`;
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Download,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  TrendingUp
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  _id: string;
  email: string;
  name: string;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedDate: string;
  lastActive: string;
  postsGenerated: number;
  commentsGenerated: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterPlan, setFilterPlan] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterPlan, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.users || [];
        setUsers(userData);
        setFilteredUsers(userData);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Plan filter
    if (filterPlan !== 'all') {
      filtered = filtered.filter(user => user.plan === filterPlan);
    }

    setFilteredUsers(filtered);
  };

  const exportUsers = () => {
    const csv = [
      ['Email', 'Name', 'Plan', 'Status', 'Joined', 'Posts', 'Comments'],
      ...filteredUsers.map(user => [
        user.email,
        user.name || '',
        user.plan,
        user.status,
        new Date(user.joinedDate).toLocaleDateString(),
        user.postsGenerated,
        user.commentsGenerated
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      suspended: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      starter: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      pro: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[plan as keyof typeof styles] || styles.trial}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and monitor all platform users
            </p>
          </div>
          <Button onClick={exportUsers} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Plan Filter */}
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">All Plans</option>
              <option value="trial">Trial</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.joinedDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">{user.postsGenerated} posts</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{user.commentsGenerated} comments</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}

