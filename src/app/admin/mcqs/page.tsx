'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { adminApi, mcqApi } from '@/lib/api-modules';
import { MCQ } from '@/lib/api-modules';
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
  BookOpen,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminMCQsPage() {
  const router = useRouter();


  const [mcqs, setMCQs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create/Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    question: '',
    language: 'javascript',
    options: ['', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard' | undefined,
    tags: '',
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

  fetchMCQs();
}, [initialized, isAuthenticated, isLoading, user]);

  const fetchMCQs = async () => {
    try {
      setLoading(true);
      const data = await mcqApi.getMCQs({
        search: search || undefined,
        limit: 100,
        offset: 0,
      });

      setMCQs(data.mcqs);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load MCQs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMCQ = async () => {
    if (!formData.question || !formData.options[0] || !formData.options[1]) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.options.filter(o => o.trim()).length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    setSubmitting(true);

    try {
      await adminApi.createMCQ({
        question: formData.question,
        language: formData.language,
        options: formData.options.filter(o => o.trim()),
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        difficulty: formData.difficulty,
      });

      toast.success('MCQ created successfully!');
      setIsDialogOpen(false);
      resetForm();
      fetchMCQs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create MCQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMCQ = async () => {
    if (!formData.question || !formData.options[0] || !formData.options[1]) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      await adminApi.updateMCQ(formData._id, {
        question: formData.question,
        language: formData.language,
        options: formData.options.filter(o => o.trim()),
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        difficulty: formData.difficulty,
      });

      toast.success('MCQ updated successfully!');
      setIsDialogOpen(false);
      resetForm();
      fetchMCQs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update MCQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMCQ = async (mcqId: string, question: string) => {
    if (!confirm(`Are you sure you want to delete this MCQ: "${question}"?`)) {
      return;
    }

    try {
      await adminApi.deleteMCQ(mcqId);
      toast.success('MCQ deleted successfully!');
      fetchMCQs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete MCQ');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (mcq: MCQ) => {
    setFormData({
      _id: mcq._id,
      question: mcq.question,
      language: mcq.language,
      options: [...mcq.options],
      correctAnswer: mcq.correctAnswer ?? 0,
      explanation: mcq.explanation || '',
      difficulty: mcq.difficulty || 'easy',
      tags: mcq.tags.join(', '),
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      question: '',
      language: 'javascript',
      options: ['', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'easy',
      tags: '',
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddOption = () => {
    if (formData.options.length < 10) {
      setFormData({ ...formData, options: [...formData.options, ''] });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
      if (formData.correctAnswer === index) {
        setFormData({ ...formData, correctAnswer: 0 });
      } else if (formData.correctAnswer > index) {
        setFormData({ ...formData, correctAnswer: formData.correctAnswer - 1 });
      }
    }
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
          Manage MCQs
        </h1>
        <p className="text-[#9CA3AF]">
          Create, edit, and delete multiple choice questions
        </p>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <Button
          onClick={openCreateDialog}
          className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create MCQ
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-[#1E293B] border-[#334155] mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
            <Input
              placeholder="Search MCQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchMCQs();
              }}
              className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* MCQs List */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
            </div>
          ) : mcqs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
              <p className="text-[#9CA3AF]">
                No MCQs found. Create your first MCQ!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mcqs.map((mcq) => (
                <div
                  key={mcq._id}
                  className="flex items-start justify-between p-4 bg-[#0F172A] rounded-lg border border-[#334155]"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <Badge
                        variant="outline"
                        className="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20"
                      >
                        {mcq.language}
                      </Badge>
                      {mcq.difficulty && (
                        <Badge
                          variant="outline"
                          className={`${getDifficultyColor(mcq.difficulty)}`}
                        >
                          {mcq.difficulty.charAt(0).toUpperCase() + mcq.difficulty.slice(1)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[#E5E7EB] mb-2">
                      {mcq.question.length > 80
                        ? mcq.question.substring(0, 80) + '...'
                        : mcq.question}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-[#9CA3AF]">
                      <span>{mcq.options.length} options</span>
                      {mcq.tags.length > 0 && (
                        <span>{mcq.tags.slice(0, 2).join(', ')}{mcq.tags.length > 2 ? '...' : ''}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/mcqs/${mcq._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(mcq)}
                      className="bg-[#0F172A] border-[#334155] text-[#38BDF8] hover:bg-[#1E293B]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMCQ(mcq._id, mcq.question)}
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
              {isEditMode ? 'Edit MCQ' : 'Create New MCQ'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update MCQ details' : 'Create a new multiple choice question'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                Question *
              </label>
              <Textarea
                placeholder="Enter your question..."
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={3}
                className="w-full bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280] rounded-md p-3"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Language *
                </label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#334155]">
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Difficulty
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
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Tags (comma-separated)
                </label>
                <Input
                  placeholder="arrays, hash-table..."
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                Options * (Minimum 2)
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                      disabled={formData.options.length <= 2}
                      className="bg-[#0F172A] border-[#334155] text-[#EF4444] hover:text-[#DC2626]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.options.length < 10 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/20"
                  >
                    <Plus className="h-4 w-4" />
                    Add Option
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                Correct Answer *
              </label>
              <Select
                value={formData.correctAnswer.toString()}
                onValueChange={(value) => setFormData({ ...formData, correctAnswer: parseInt(value) })}
              >
                <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  {formData.options.map((option, index) => {
                    if (option.trim()) {
                      return (
                        <SelectItem key={index} value={index.toString()}>
                          {index + 1}. {option.trim()}
                        </SelectItem>
                      );
                    }
                    return null;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                Explanation
              </label>
              <Textarea
                placeholder="Explain why this is the correct answer..."
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={2}
                className="w-full bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280] rounded-md p-3"
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
                onClick={isEditMode ? handleEditMCQ : handleCreateMCQ}
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
                        Update MCQ
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create MCQ
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
