'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { adminApi, submissionApi } from '@/lib/api-modules';
import { Submission } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  RefreshCw,
  Search,
  Code2,
  BookOpen,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const { initialized, isAuthenticated, user, isLoading } = useAuthStore();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isRejudging, setIsRejudging] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchSubmissions();
  }, [initialized, isAuthenticated, isLoading, user]);
  

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      let submissionsData: Submission[] = [];

      if (filterType === 'dsa') {
        const dosaData = await submissionApi.getDSASubmissions({ limit: 100, offset: 0 });
        submissionsData = dosaData.submissions;
      } else if (filterType === 'practice') {
        const practiceData = await submissionApi.getPracticeSubmissions({ limit: 100, offset: 0 });
        submissionsData = practiceData.submissions;
      } else if (filterType === 'mcq') {
        const mcqData = await submissionApi.getMySubmissions({ type: 'mcq', limit: 100, offset: 0 });
        submissionsData = mcqData.submissions;
      } else {
        const allData = await submissionApi.getMySubmissions({ limit: 100, offset: 0 });
        submissionsData = allData.submissions;
      }

      if (search) {
        const problemIds = submissionsData
          .filter((s: any) => s.problemId)
          .map((s: any) => s.problemId);

        const mcqIds = submissionsData
          .filter((s: any) => s.mcqId)
          .map((s: any) => s.mcqId);

        submissionsData = submissionsData.filter((s: any) =>
          problemIds.includes(s.problemId) ||
          mcqIds.includes(s.mcqId)
        );
      }

      setSubmissions(submissionsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleRejudge = async (submissionId: string) => {
    if (!confirm('Are you sure you want to rejudge this submission?')) {
      return;
    }

    setIsRejudging(submissionId);

    try {
      await adminApi.rejudgeSubmission(submissionId);
      toast.success('Submission queued for rejudging!');

      setTimeout(() => {
        setSelectedSubmission(null);
        setIsRejudging(null);
        fetchSubmissions();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to rejudge submission');
      setIsRejudging(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-[#22C55E]/10 text-[#22C55E]';
      case 'wrong_answer':
        return 'bg-[#EF4444]/10 text-[#EF4444]';
      case 'runtime_error':
      case 'compile_error':
        return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'time_limit_exceeded':
        return 'bg-[#A855F7]/10 text-[#A855F7]';
      case 'memory_limit_exceeded':
        return 'bg-[#A855F7]/10 text-[#A855F7]';
      case 'pending':
      case 'running':
        return 'bg-[#38BDF8]/10 text-[#38BDF8] animate-pulse';
      default:
        return 'bg-[#9CA3AF]/10 text-[#9CA3AF]';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'accepted' || status === 'pending' || status === 'running') {
      return <Loader2 className="h-5 w-5" />;
    }
    if (status === 'wrong_answer') {
      return <XCircle className="h-5 w-5" />;
    }
    return <CheckCircle2 className="h-5 w-5" />;
  };

  const getSubmissionType = (submission: Submission) => {
    if (submission.mcqId) return 'MCQ';
    if (submission.problemId) return 'Code';
    return 'Unknown';
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
          Rejudge Submissions
        </h1>
        <p className="text-[#9CA3AF]">
          Re-evaluate code execution for any submissions
        </p>
      </div>

      {/* Filter Controls */}
      <Card className="bg-[#1E293B] border-[#334155] mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
                <Input
                  placeholder="Search by problem ID or MCQ ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchSubmissions();
                  }}
                  className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] pl-10"
                />
              </div>
            </div>

            <div className="w-full lg:w-48">
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dsa">DSA Submissions</SelectItem>
                  <SelectItem value="practice">Practice Submissions</SelectItem>
                  <SelectItem value="mcq">MCQ Submissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={fetchSubmissions}
              disabled={loading}
              className="bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white whitespace-nowrap"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setSearch('');
                setFilterType('all');
                fetchSubmissions();
              }}
              variant="outline"
              className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#E5E7EB]">Submissions ({submissions.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#E5E7EB] mb-2">
                No submissions found
              </h3>
              <p className="text-[#9CA3AF]">
                Users need to submit problems first
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#9CA3AF]">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#9CA3AF]">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#9CA3AF]">
                      Problem/MCQ
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#9CA3AF]">
                      User
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#9CA3AF]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[#9CA3AF]">
                      Time
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#9CA3AF]">
                      Rejudge
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className={`border-b border-[#334155] hover:bg-[#0F172A] transition-colors ${
                        isRejudging === submission._id ? 'bg-[#38BDF8]/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#6B7280]">
                          {submission._id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20">
                          {getSubmissionType(submission)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {submission.problemId ? (
                          <Link href={`/problems/${submission.problemId}`}>
                            <Button variant="ghost" size="sm" className="text-[#38BDF8] hover:text-[#38BDF8]/90 h-auto">
                              <Code2 className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : submission.mcqId ? (
                          <Link href={`/mcqs/${submission.mcqId}`}>
                            <Button variant="ghost" size="sm" className="text-[#38BDF8] hover:text-[#38BDF8]/90 h-auto">
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-[#9CA3AF]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#E5E7EB]">{submission.userId}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={getStatusColor(submission.status)}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {getStatusIcon(submission.status)}
                            <span className="uppercase text-xs">
                              {submission.status.replace('_', ' ')}
                            </span>
                          </div>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {submission.executionTime ? (
                          <div className="flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3 text-[#9CA3AF]" />
                            <span className="text-[#E5E7EB]">
                              {submission.executionTime}s
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#6B7280]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          onClick={() => handleRejudge(submission._id)}
                          disabled={isRejudging !== null}
                          variant="outline"
                          size="sm"
                          className={`${
                            submission.status === 'accepted'
                              ? 'bg-[#0F172A] border-[#334155] text-[#9CA3AF] hover:bg-[#1E293B] hover:text-[#E5E7EB]'
                              : 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/20 hover:text-[#22C55E]'
                          }`}
                        >
                          {isRejudging === submission._id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Rejudging...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Rejudge
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Details Dialog */}
      {selectedSubmission && (
        <Dialog open={true} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="bg-[#1E293B] border-[#334155] text-[#E5E7EB]">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected submission
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Submission ID</p>
                  <p className="font-mono text-sm text-[#E5E7EB]">{selectedSubmission._id}</p>
                </div>
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Type</p>
                  <Badge variant="outline" className="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20">
                    {getSubmissionType(selectedSubmission)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#9CA3AF] mb-1">Status</p>
                <Badge
                  variant="outline"
                  className={getStatusColor(selectedSubmission.status)}
                >
                  {selectedSubmission.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Submitted At</p>
                  <p className="text-[#E5E7EB]">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Completed At</p>
                  <p className="text-[#E5E7EB]">
                    {selectedSubmission.completedAt
                      ? new Date(selectedSubmission.completedAt).toLocaleString()
                      : 'Not completed'}
                  </p>
                </div>
              </div>
              {selectedSubmission.testCasesPassed !== undefined && (
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Test Cases</p>
                  <p className="text-[#E5E7EB]">
                    {selectedSubmission.testCasesPassed}/{selectedSubmission.totalTestCases} passed
                  </p>
                </div>
              )}
              {selectedSubmission.executionTime && (
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Execution Time</p>
                  <p className="text-[#E5E7EB]">{selectedSubmission.executionTime}s</p>
                </div>
              )}
              {selectedSubmission.score !== undefined && (
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Score</p>
                  <p className="text-[#E5E7EB]">{selectedSubmission.score} points</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedSubmission(null)}
                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}
