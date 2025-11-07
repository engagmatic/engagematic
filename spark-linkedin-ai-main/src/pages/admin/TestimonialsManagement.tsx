import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Star,
  Check,
  X,
  Sparkles,
  MessageSquare,
  Filter,
  Download,
  Plus,
  Loader2
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}/api`;

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
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Add Testimonial State
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    displayName: '',
    userEmail: '',
    jobTitle: '',
    company: '',
    rating: 5,
    comment: '',
    autoApprove: true,
    isFeatured: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchTestimonials();
  }, [filterStatus]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE}/testimonials/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      const url = filterStatus === 'all'
        ? `${API_BASE}/testimonials/admin/all`
        : `${API_BASE}/testimonials/admin/all?status=${filterStatus}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTestimonials(result.data || []);
        } else {
          console.error('Failed to fetch testimonials:', result.message);
          toast({
            title: 'Error',
            description: result.message || 'Failed to fetch testimonials',
            variant: 'destructive'
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch testimonials:', errorData);
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to fetch testimonials',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch testimonials:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch testimonials. Please refresh the page.',
        variant: 'destructive'
      });
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

    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Please login again',
          variant: 'destructive'
        });
        return;
      }

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

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: `Testimonial ${actionType}d`,
          description: data.message || `Successfully ${actionType}d the testimonial.`,
        });
        
        await fetchTestimonials();
        await fetchStats();
        setSelectedTestimonial(null);
        setReviewNotes('');
        setActionType(null);
      } else {
        toast({
          title: 'Action failed',
          description: data.message || `Failed to ${actionType} testimonial`,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error(`Failed to ${actionType}:`, error);
      toast({
        title: 'Action failed',
        description: error.message || `Failed to ${actionType} testimonial. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Please login again',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(
        `${API_BASE}/testimonials/admin/${testimonial._id}/toggle-featured`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: testimonial.isFeatured ? 'Unfeatured' : 'Featured',
          description: data.message || `Testimonial ${testimonial.isFeatured ? 'removed from' : 'added to'} featured list.`,
        });
        fetchTestimonials();
        fetchStats();
      } else {
        toast({
          title: 'Action failed',
          description: data.message || 'Failed to toggle featured status',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle featured:', error);
      toast({
        title: 'Action failed',
        description: error.message || 'Failed to toggle featured status',
        variant: 'destructive'
      });
    }
  };

  const handleAddTestimonial = async () => {
    // Validation
    if (!newTestimonial.displayName.trim() || !newTestimonial.comment.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Display name and comment are required.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE}/testimonials/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTestimonial)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Testimonial Added!',
          description: 'The testimonial has been successfully created.',
        });
        
        // Reset form
        setNewTestimonial({
          displayName: '',
          userEmail: '',
          jobTitle: '',
          company: '',
          rating: 5,
          comment: '',
          autoApprove: true,
          isFeatured: false
        });
        setShowAddDialog(false);
        
        // Refresh lists
        fetchTestimonials();
        fetchStats();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to add testimonial',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to add testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to add testimonial. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
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
            <div className="mt-2">
              <Badge variant="outline" className="gap-1">
                <MessageSquare className="h-3 w-3" />
                Collection Link: <code className="text-xs">/testimonial</code>
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('/testimonial', '_blank')}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              View Collection Page
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Testimonial
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            </Card>
            <Card className={`p-4 ${stats.pending > 0 ? 'border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
              <div className="text-sm text-yellow-600 font-semibold">Pending Review</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              {stats.pending > 0 && (
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Needs approval
                </p>
              )}
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
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAction(testimonial, 'approve')}
                            title="Approve testimonial"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(testimonial, 'reject')}
                            title="Reject testimonial"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {testimonial.status === 'approved' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(testimonial, 'reject')}
                            title="Reject testimonial"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {testimonial.status === 'rejected' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAction(testimonial, 'approve')}
                            title="Approve testimonial"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
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
              disabled={isActionLoading}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                actionType === 'approve' ? 'Approve' : 'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Testimonial Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Testimonial</DialogTitle>
            <DialogDescription>
              Create a testimonial manually. It will automatically appear on the homepage if approved and featured.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="displayName"
                placeholder="e.g., Priya S."
                value={newTestimonial.displayName}
                onChange={(e) => setNewTestimonial({...newTestimonial, displayName: e.target.value})}
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email (Optional)</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="user@example.com"
                value={newTestimonial.userEmail}
                onChange={(e) => setNewTestimonial({...newTestimonial, userEmail: e.target.value})}
              />
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Content Creator"
                value={newTestimonial.jobTitle}
                onChange={(e) => setNewTestimonial({...newTestimonial, jobTitle: e.target.value})}
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                placeholder="e.g., Tech Corp"
                value={newTestimonial.company}
                onChange={(e) => setNewTestimonial({...newTestimonial, company: e.target.value})}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewTestimonial({...newTestimonial, rating: star})}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= newTestimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {newTestimonial.rating} star{newTestimonial.rating !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">
                Testimonial Comment <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="comment"
                placeholder="Write the testimonial content here..."
                value={newTestimonial.comment}
                onChange={(e) => setNewTestimonial({...newTestimonial, comment: e.target.value})}
                rows={5}
              />
              <p className="text-xs text-gray-500">
                {newTestimonial.comment.length} characters
              </p>
            </div>

            {/* Auto-approve checkbox */}
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <input
                type="checkbox"
                id="autoApprove"
                checked={newTestimonial.autoApprove}
                onChange={(e) => setNewTestimonial({...newTestimonial, autoApprove: e.target.checked})}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <Label htmlFor="autoApprove" className="text-sm font-medium text-green-900 dark:text-green-100 cursor-pointer">
                Auto-approve this testimonial
              </Label>
            </div>

            {/* Featured checkbox */}
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <input
                type="checkbox"
                id="isFeatured"
                checked={newTestimonial.isFeatured}
                onChange={(e) => setNewTestimonial({...newTestimonial, isFeatured: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <Label htmlFor="isFeatured" className="text-sm font-medium text-purple-900 dark:text-purple-100 cursor-pointer flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Feature on homepage
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewTestimonial({
                  displayName: '',
                  userEmail: '',
                  jobTitle: '',
                  company: '',
                  rating: 5,
                  comment: '',
                  autoApprove: true,
                  isFeatured: false
                });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTestimonial}
              disabled={isSubmitting || !newTestimonial.displayName.trim() || !newTestimonial.comment.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Add Testimonial'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

