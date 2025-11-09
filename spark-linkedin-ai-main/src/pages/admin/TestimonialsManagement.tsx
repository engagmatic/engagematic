import { useState, useEffect, useMemo } from 'react';
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
  Plus,
  Loader2,
  Search,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Get API URL - handle both cases where it includes /api or not
const getApiBase = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // If URL already ends with /api, use it as is, otherwise add /api
  return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
};
const API_BASE = getApiBase();

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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [actionTarget, setActionTarget] = useState<Testimonial | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  
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

  const statusDefinitions: Record<string, { label: string; count: number }> = useMemo(() => {
    return {
      all: { label: 'All', count: stats?.total ?? 0 },
      pending: { label: 'Pending Review', count: stats?.pending ?? 0 },
      approved: { label: 'Approved', count: stats?.approved ?? 0 },
      rejected: { label: 'Rejected', count: stats?.rejected ?? 0 },
    };
  }, [stats]);

  const statusBadgeStyles: Record<Testimonial['status'], string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
  };

  const filteredTestimonials = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    let data = [...testimonials];

    if (ratingFilter !== 'all') {
      data = data.filter((item) => Math.round(item.rating) === Number(ratingFilter));
    }

    if (normalizedSearch) {
      data = data.filter((item) => {
        return (
          item.displayName?.toLowerCase().includes(normalizedSearch) ||
          item.userEmail?.toLowerCase().includes(normalizedSearch) ||
          item.comment?.toLowerCase().includes(normalizedSearch) ||
          item.company?.toLowerCase().includes(normalizedSearch) ||
          item.jobTitle?.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    switch (sortOption) {
      case 'oldest':
        data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        data.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        data.sort((a, b) => a.rating - b.rating);
        break;
      default:
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return data;
  }, [testimonials, ratingFilter, searchTerm, sortOption]);

  useEffect(() => {
    if (!filteredTestimonials.length) {
      setSelectedTestimonial(null);
      return;
    }

    if (!selectedTestimonial) {
      setSelectedTestimonial(filteredTestimonials[0]);
      return;
    }

    const stillVisible = filteredTestimonials.some((item) => item._id === selectedTestimonial._id);
    if (!stillVisible) {
      setSelectedTestimonial(filteredTestimonials[0]);
    }
  }, [filteredTestimonials, selectedTestimonial?._id]);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return date;
    }
  };

  const renderRatingStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const baseClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`${baseClass} ${
              index < Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/40'
            }`}
          />
        ))}
      </div>
    );
  };

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
        } else {
          console.error('Failed to fetch stats:', result.message);
          toast({
            title: 'Error',
            description: result.message || 'Failed to fetch testimonial statistics',
            variant: 'destructive'
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch stats:', response.status, errorData);
        if (response.status === 404) {
          toast({
            title: 'Error',
            description: 'API endpoint not found. Please check server configuration.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error',
            description: errorData.message || `Failed to fetch stats (${response.status})`,
            variant: 'destructive'
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch testimonial statistics. Please refresh the page.',
        variant: 'destructive'
      });
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
          const fetched = result.data || [];
          setTestimonials(fetched);
          setSelectedTestimonial((prev) => {
            if (!fetched.length) {
              return null;
            }
            if (prev) {
              const match = fetched.find((item: Testimonial) => item._id === prev._id);
              if (match) return match;
            }
            return fetched[0];
          });
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
        console.error('Failed to fetch testimonials:', response.status, errorData);
        if (response.status === 404) {
          toast({
            title: 'Error',
            description: 'API endpoint not found. Please check server configuration.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error',
            description: errorData.message || `Failed to fetch testimonials (${response.status})`,
            variant: 'destructive'
          });
        }
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
    setActionTarget(testimonial);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!actionTarget || !actionType) return;

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
        `${API_BASE}/testimonials/admin/${actionTarget._id}/${endpoint}`,
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
        setReviewNotes('');
        setActionTarget(null);
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

        {/* Experience Metrics */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Card className="relative overflow-hidden border border-primary/20 bg-primary/5 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">All testimonials</div>
              <div className="mt-2 text-3xl font-semibold text-primary">{stats.total}</div>
              <p className="mt-2 text-xs text-muted-foreground">Across every channel</p>
            </Card>
            <Card className={`p-4 ${stats.pending > 0 ? 'border-yellow-400/70 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
              <div className="text-xs uppercase tracking-wide text-yellow-700">Pending review</div>
              <div className="mt-2 text-3xl font-semibold text-yellow-600">{stats.pending}</div>
              <p className="mt-2 text-xs text-yellow-700">
                {stats.pending > 0 ? 'Queued for approval' : 'All caught up'}
              </p>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wide text-green-700">Approved</div>
              <div className="mt-2 text-3xl font-semibold text-green-600">{stats.approved}</div>
              <p className="mt-2 text-xs text-muted-foreground">Ready for distribution</p>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wide text-red-700">Rejected</div>
              <div className="mt-2 text-3xl font-semibold text-red-500">{stats.rejected}</div>
              <p className="mt-2 text-xs text-muted-foreground">Need follow-up or edits</p>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wide text-purple-700">Featured</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-purple-600">{stats.featured}</span>
                <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-600">
                  Hero ready
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Highlighted on marketing touchpoints</p>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Average rating</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-semibold text-foreground">{stats.avgRating.toFixed(1)}</span>
                {renderRatingStars(stats.avgRating, 'sm')}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Weighted across all submissions</p>
            </Card>
          </div>
        )}

        {/* Command Center */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(statusDefinitions).map(([status, info]) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="flex items-center gap-2"
                >
                  {info.label}
                  <span className="rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {info.count}
                  </span>
                </Button>
              ))}
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search name, email, company, or keyword"
                  className="pl-9"
                />
              </div>
              <Select value={ratingFilter} onValueChange={(value) => setRatingFilter(value as typeof ratingFilter)}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="5">5 stars</SelectItem>
                  <SelectItem value="4">4 stars</SelectItem>
                  <SelectItem value="3">3 stars</SelectItem>
                  <SelectItem value="2">2 stars</SelectItem>
                  <SelectItem value="1">1 star</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as typeof sortOption)}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder="Sort testimonials" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="highest">Highest rating</SelectItem>
                  <SelectItem value="lowest">Lowest rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Workspace */}
        <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
          <Card className="overflow-hidden border-border/60">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Review queue</h2>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? 'Loading…' : `${filteredTestimonials.length} testimonials in view`}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchTestimonials} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            <div className="max-h-[640px] space-y-3 overflow-y-auto px-4 py-4">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading testimonials…
                </div>
              ) : !filteredTestimonials.length ? (
                <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                  <MessageSquare className="mb-2 h-5 w-5" />
                  <span>No testimonials match your filters yet.</span>
                </div>
              ) : (
                filteredTestimonials.map((testimonial) => {
                  const isActive = selectedTestimonial?._id === testimonial._id;
                  return (
                    <button
                      key={testimonial._id}
                      onClick={() => setSelectedTestimonial(testimonial)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40 hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{testimonial.displayName || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.userEmail}</p>
                        </div>
                        <Badge className={`border ${statusBadgeStyles[testimonial.status]}`}>
                          {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        {renderRatingStars(testimonial.rating, 'sm')}
                        {testimonial.isFeatured && (
                          <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-600">
                            <Sparkles className="mr-1 h-3 w-3 text-purple-500" /> Featured
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{testimonial.comment}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {testimonial.company ? testimonial.company : 'Independent'}{' '}
                          {testimonial.jobTitle && `• ${testimonial.jobTitle}`}
                        </span>
                        <span>{formatDate(testimonial.createdAt)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="p-6">
            {!selectedTestimonial ? (
              <div className="flex h-[360px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Sparkles className="h-6 w-6 text-primary" />
                <p className="text-sm font-medium">Select a testimonial to review</p>
                <p className="text-xs">Choose a testimonial from the queue to see full context, notes, and actions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-foreground">
                        {selectedTestimonial.displayName || 'Anonymous'}</h2>
                      <Badge className={`border ${statusBadgeStyles[selectedTestimonial.status]}`}>
                        {selectedTestimonial.status.charAt(0).toUpperCase() + selectedTestimonial.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedTestimonial.userEmail}</p>
                    {(selectedTestimonial.jobTitle || selectedTestimonial.company) && (
                      <p className="text-xs text-muted-foreground">
                        {[selectedTestimonial.jobTitle, selectedTestimonial.company].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {selectedTestimonial.isFeatured && (
                      <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-600">
                        <Sparkles className="mr-1 h-3 w-3 text-purple-500" /> Featured hero
                      </Badge>
                    )}
                    {selectedTestimonial.status === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(selectedTestimonial)}
                        className="gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        {selectedTestimonial.isFeatured ? 'Remove featured' : 'Mark as featured'}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {renderRatingStars(selectedTestimonial.rating)}
                  <Badge variant="outline" className="rounded-full border-border/60">
                    {selectedTestimonial.rating.toFixed(1)} / 5 rating
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-border/60 capitalize">
                    {selectedTestimonial.triggeredBy?.replaceAll('_', ' ') || 'web form'}
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-border/60">
                    {selectedTestimonial.actionCount ?? 0} review actions
                  </Badge>
                </div>

                <blockquote className="rounded-lg border-l-4 border-primary/60 bg-muted/60 p-4 text-lg italic leading-relaxed text-foreground">
                  “{selectedTestimonial.comment}”
                </blockquote>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-dashed border-border/60 bg-background p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Submission details</div>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        <span className="font-medium text-foreground">Submitted on:</span>{' '}
                        {formatDate(selectedTestimonial.createdAt)}
                      </li>
                      <li>
                        <span className="font-medium text-foreground">Channel:</span>{' '}
                        {selectedTestimonial.triggeredBy || 'public form'}
                      </li>
                      <li>
                        <span className="font-medium text-foreground">Featured:</span>{' '}
                        {selectedTestimonial.isFeatured ? 'Yes' : 'No'}
                      </li>
                    </ul>
                  </Card>
                  <Card className="border-dashed border-border/60 bg-background p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Next steps</div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add internal notes, approve or reject, and optionally feature this testimonial across your assets.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Notes are stored with the review history for future audits.
                    </p>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewNotes">Internal notes (optional)</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(event) => setReviewNotes(event.target.value)}
                    rows={4}
                    placeholder="Summarize the tone, where you plan to use it, or why you’re approving/rejecting."
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedTestimonial.status !== 'approved' && (
                    <Button
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction(selectedTestimonial, 'approve')}
                    >
                      <Check className="h-4 w-4" />
                      Approve & publish
                    </Button>
                  )}
                  {selectedTestimonial.status !== 'rejected' && (
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleAction(selectedTestimonial, 'reject')}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add manual testimonial
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!actionTarget} onOpenChange={() => {
        setActionTarget(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Testimonial
            </DialogTitle>
            <DialogDescription>
              {actionTarget && (
                <div className="space-y-3 mt-4">
                  <div>
                    <strong>{actionTarget.displayName}</strong>
                    <div className="flex items-center gap-1 mt-1">
                      {renderRatingStars(actionTarget.rating, 'md')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    "{actionTarget.comment}"
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
              setActionTarget(null);
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

