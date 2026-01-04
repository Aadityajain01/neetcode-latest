'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { adminApi, problemApi } from '@/lib/api-modules';
import { Problem } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Code2,
  Search,
  Clock,
  Database,
} from 'lucide-react';

export default function AdminProblemsPage() {
  const router = useRouter();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create/Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    type: 'dsa' as 'dsa' | 'practice',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard' | undefined,
    tags: '',
    timeLimit: 1,
    memoryLimit: 256,
    languages: 'javascript,python' as string,
  });

  const { initialized, isAuthenticated, user, isLoading } = useAuthStore();
  
  useEffect(() => {
    if (!initialized || isLoading) return; // wait
  
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  
    if (!user) return; // still loading user
  
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  
    fetchProblems();
  }, [initialized, isAuthenticated, isLoading, user]);
  

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await problemApi.getProblems({
        search: search || undefined,
        limit: 100,
        offset: 0,
      });
      setProblems(data.problems);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.type === 'dsa' && !formData.difficulty) {
      toast.error('Difficulty is required for DSA problems');
      return;
    }

    if (!formData.languages) {
      toast.error('Please select at least one language');
      return;
    }

    setSubmitting(true);

    try {
      const problem = await adminApi.createProblem({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        difficulty: formData.type === 'dsa' ? formData.difficulty : undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        timeLimit: formData.timeLimit,
        memoryLimit: formData.memoryLimit,
        languages: formData.languages.split(',').map(l => l.trim()).filter(l => l),
      });

      toast.success('Problem created successfully!');
      setIsDialogOpen(false);
      resetForm();
      fetchProblems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create problem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProblem = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const problem = await adminApi.updateProblem(formData._id, {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        timeLimit: formData.timeLimit,
        memoryLimit: formData.memoryLimit,
        languages: formData.languages.split(',').map(l => l.trim()).filter(l => l),
      });

      toast.success('Problem updated successfully!');
      setIsDialogOpen(false);
      resetForm();
      fetchProblems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update problem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProblem = async (problemId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await adminApi.deleteProblem(problemId);
      toast.success('Problem deleted successfully!');
      fetchProblems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete problem');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (problem: Problem) => {
    setFormData({
      _id: problem._id,
      title: problem.title,
      description: problem.description,
      type: problem.type,
      difficulty: problem.difficulty || 'easy',
      tags: problem.tags.join(', '),
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      languages: problem.languages.join(', '),
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      title: '',
      description: '',
      type: 'dsa',
      difficulty: 'easy',
      tags: '',
      timeLimit: 1,
      memoryLimit: 256,
      languages: 'javascript,python',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-[#22C55E]/10 text-[#22C55E]';
      case 'medium':
        return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'hard':
        return 'bg-[#EF4444]/10 text-[#EF4444]';
      default:
        return 'bg-[#9CA3AF]/10 text-[#9CA3AF]';
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">
          Manage Problems
        </h1>
        <p className="text-[#9CA3AF]">
          Create, edit, and delete coding problems
        </p>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <Button
          onClick={openCreateDialog}
          className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Problem
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-[#1E293B] border-[#334155] mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
            <Input
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchProblems();
              }}
              className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Problems List */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12">
              <Code2 className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
              <p className="text-[#9CA3AF]">No problems found. Create your first problem!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  className="flex items-start justify-between p-4 bg-[#0F172A] rounded-lg border border-[#334155]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-[#E5E7EB]">
                        {problem.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`ml-2 ${
                          problem.type === 'dsa'
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'
                            : 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20'
                        }`}
                      >
                        {problem.type === 'dsa' ? 'DSA' : 'Practice'}
                      </Badge>
                      {problem.difficulty && (
                        <Badge
                          variant="outline"
                          className={`ml-2 ${getDifficultyColor(problem.difficulty)}`}
                        >
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#9CA3AF] line-clamp-2">
                      {problem.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{problem.timeLimit}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="h-4 w-4" />
                        <span>{problem.memoryLimit}MB</span>
                      </div>
                      <span>{problem.languages.length} langs</span>
                      <span>{problem.tags.length} tags</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/problems/${problem._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
                      >
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(problem)}
                      className="bg-[#0F172A] border-[#334155] text-[#38BDF8] hover:bg-[#1E293B]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProblem(problem._id, problem.title)}
                      className="bg-[#0F172A] border-[#334155] text-[#EF4444] hover:bg-[#1E293B] hover:text-[#DC2626]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#E5E7EB] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Problem' : 'Create New Problem'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update problem details'
                : 'Create a new coding problem with test cases'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                Title *
              </label>
              <Input
                placeholder="e.g., Two Sum"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                Description *
              </label>
              <Textarea
                placeholder="Describe the problem..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280] rounded-md p-3"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Type *
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'dsa' | 'practice') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#334155]">
                    <SelectItem value="dsa">DSA Problem</SelectItem>
                    <SelectItem value="practice">Practice Problem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type === 'dsa' && (
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Difficulty *
                  </label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                Tags (comma-separated)
              </label>
              <Input
                placeholder="e.g., arrays, hash-table, dynamic-programming"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Time Limit (seconds) *
                </label>
                <Input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 1 })}
                  className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Memory Limit (MB) *
                </label>
                <Input
                  type="number"
                  value={formData.memoryLimit}
                  onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) || 256 })}
                  className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                Supported Languages (comma-separated) *
              </label>
              <Input
                placeholder="e.g., javascript,python,java"
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280]"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
              >
                Cancel
              </Button>
              <Button
                onClick={isEditMode ? handleEditProblem : handleCreateProblem}
                disabled={submitting}
                className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Problem
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Problem
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
