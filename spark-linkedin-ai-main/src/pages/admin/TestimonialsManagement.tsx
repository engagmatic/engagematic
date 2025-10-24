import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Star,
  Check,
  X,
  Sparkles,
  MessageSquare,
  Filter,
  Download
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  _id: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  displayName: string;
  jobTitle?: string;
  company?: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  createdAt: string;
  actionCount: number;
  triggeredBy: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  featured: number;
  avgRating: number;
}

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchTestimonials();
  }, [filterStatus]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/testimonials/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const url = filterStatus === 'all'
        ? `${API_BASE}/testimonials/admin/all`
        : `${API_BASE}/testimonials/admin/all?status=${filterStatus}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTestimonials(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (testimonial: Testimonial, action: 'approve' | 'reject') => {
    setSelectedTestimonial(testimonial);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!selectedTestimonial || !actionType) return;

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = actionType === 'approve' ? 'approve' : 'reject';
      
      const response = await fetch(
        `${API_BASE}/testimonials/admin/${selectedTestimonial._id}/${endpoint}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: reviewNotes })
        }
      );

      if (response.ok) {
        toast({
          title: `Testimonial ${actionType}d`,
          description: `Successfully ${actionType}d the testimonial.`,
        });
        
        fetchTestimonials();
        fetchStats();
        setSelectedTestimonial(null);
        setReviewNotes('');
        setActionType(null);
      }
    } catch (error) {
      console.error(`Failed to ${actionType}:`, error);
      toast({
        title: 'Action failed',
        description: `Failed to ${actionType} testimonial`,
        variant: 'destructive'
      });
    }
  };

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${API_BASE}/testimonials/admin/${testimonial._id}/toggle-featured`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast({
          title: testimonial.isFeatured ? 'Unfeatured' : 'Featured',
          description: `Testimonial ${testimonial.isFeatured ? 'removed from' : 'added to'} featured list.`,
        });
        fetchTestimonials();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage user feedback and reviews
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-yellow-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-green-600">Approved</div>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-red-600">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-purple-600">Featured</div>
              <div className="text-2xl font-bold text-purple-600">{stats.featured}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                {stats.avgRating} <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Testimonials Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Loading testimonials...
                  </TableCell>
                </TableRow>
              ) : testimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No testimonials found
                  </TableCell>
                </TableRow>
              ) : (
                testimonials.map((testimonial) => (
                  <TableRow key={testimonial._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {testimonial.displayName}
                        </p>
                        <p className="text-sm text-gray-500">{testimonial.userEmail}</p>
                        {testimonial.jobTitle && (
                          <p className="text-xs text-gray-400">
                            {testimonial.jobTitle}
                            {testimonial.company && ` at ${testimonial.company}`}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRatingStars(testimonial.rating)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-md truncate text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.comment}
                      </p>
                    </TableCell>
                    <TableCell>{getStatusBadge(testimonial.status)}</TableCell>
                    <TableCell>
                      {testimonial.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatured(testimonial)}
                        >
                          {testimonial.isFeatured ? (
                            <Sparkles className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      {testimonial.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleAction(testimonial, 'approve')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleAction(testimonial, 'reject')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedTestimonial} onOpenChange={() => {
        setSelectedTestimonial(null);
        setReviewNotes('');
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Testimonial
            </DialogTitle>
            <DialogDescription>
              {selectedTestimonial && (
                <div className="space-y-3 mt-4">
                  <div>
                    <strong>{selectedTestimonial.displayName}</strong>
                    <div className="flex items-center gap-1 mt-1">
                      {getRatingStars(selectedTestimonial.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    "{selectedTestimonial.comment}"
                  </p>
                  <Textarea
                    placeholder="Add review notes (optional)..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedTestimonial(null);
              setReviewNotes('');
              setActionType(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

