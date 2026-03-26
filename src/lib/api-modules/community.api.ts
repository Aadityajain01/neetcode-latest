import { api } from "@/lib/api";

export interface Community {
  _id: string;
  name: string;
  description: string;
  ownerId: string | { _id: string; displayName: string; email: string };
  type: "open" | "domain_restricted";
  domain?: string;
  memberCount: number;
  allowUsersToChat?: boolean;
  allowTestCreation?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  _id: string;
  communityId: string;
  userId: string | { _id: string; displayName: string; email: string; avatarUrl?: string };
  role: "owner" | "admin" | "member";
  isMuted?: boolean;
  joinedAt: string;
}

export interface CommunityTest {
  _id: string;
  title: string;
  description: string;
  communityId: string;
  createdBy: string;
  type: "mcq" | "programming" | "mixed";
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isResultVisible: boolean;
  totalMarks: number;
  questionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestQuestion {
  _id: string;
  testId: string;
  type: "mcq" | "programming";
  marks: number;
  sourceMcqId?: string;
  question?: string;
  options?: string[];
  correctOption?: number;
  problemId?: string;
  title?: string;
  description?: string;
  constraints?: string;
  inputFormat?: string;
  outputFormat?: string;
  languages?: string[];
  customTestcases?: { input: string; output: string; isHidden: boolean }[];
}

export interface TestResult {
  _id: string;
  testId: string;
  userId: string;
  communityId: string;
  submissionId: string;
  totalScore: number;
  mcqScore: number;
  programmingScore: number;
  mcqResults?: {
    questionId: string;
    question: string;
    options: string[];
    selectedOption: number | null;
    correctOption: number;
    isCorrect: boolean;
    marksAwarded: number;
  }[];
  programmingResults?: {
    questionId: string;
    passedCases: number;
    totalCases: number;
    marksAwarded: number;
    status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compile Error" | "Time Limit Exceeded" | "Memory Limit Exceeded" | "Locked" | "Not Attempted" | "No Testcases" | "Language Not Supported" | string;
  }[];
  evaluatedAt: string;
}

export const communityApi = {
  getCommunities: async (): Promise<Community[]> => {
    const response = await api.get<{ communities: Community[] }>("/communities");
    return response.data.communities ?? [];
  },

  getCommunityById: async (communityId: string) => {
    // ✅ This expects the exact object structure returned by the route above
    const res = await api.get<{ 
      community: Community; 
      isMember: boolean; 
      userRole: string | null 
    }>(`/communities/${communityId}`);
    return res.data;
  },

  createCommunity: async (data: {
    name: string;
    description: string;
    type: "open" | "domain_restricted";
    domain?: string;
  }) => {
    const response = await api.post<{ community: Community }>("/communities", data);
    return response.data.community;
  },

  joinCommunity: async (communityId: string) => {
    const response = await api.post(`/communities/${communityId}/join`);
    return response.data;
  },

  leaveCommunity: async (communityId: string) => {
    const response = await api.delete(`/communities/${communityId}/leave`);
    return response.data;
  },

  getMembers: async (communityId: string, params?: { limit?: number; offset?: number }) => {
    const response = await api.get<{ members: CommunityMember[] }>(`/communities/${communityId}/members`, { params });
    return response.data;
  },

  updateSettings: async (communityId: string, data: { name: string; description: string }) => {
    const response = await api.patch(`/communities/${communityId}/settings`, data);
    return response.data;
  },

  deleteCommunity: async (communityId: string) => {
    const response = await api.delete(`/communities/${communityId}`);
    return response.data;
  },

  removeMember: async (communityId: string, userId: string) => {
    const response = await api.delete(`/communities/${communityId}/members/${userId}`);
    return response.data;
  },

  promoteMember: async (communityId: string, userId: string) => {
    const response = await api.post(`/communities/${communityId}/promote`, { userId });
    return response.data;
  },

  transferOwnership: async (communityId: string, newOwnerId: string) => {
    const response = await api.post(`/communities/${communityId}/transfer-owner`, { newOwnerId });
    return response.data;
  },

  muteMember: async (communityId: string, userId: string, isMuted: boolean) => {
    const response = await api.post(`/communities/${communityId}/members/${userId}/mute`, { isMuted });
    return response.data;
  },

  getTests: async (communityId: string): Promise<CommunityTest[]> => {
    const response = await api.get<{ tests: CommunityTest[] }>(`/communities/${communityId}/tests`);
    return response.data.tests ?? [];
  },

  getTestById: async (communityId: string, testId: string) => {
    const response = await api.get<{ test: CommunityTest, questions: TestQuestion[], hasSubmitted: boolean, evaluationComplete: boolean, resultHidden: boolean, result: TestResult | null }>(`/communities/${communityId}/tests/${testId}`);
    return response.data;
  },

  createTest: async (communityId: string, data: Partial<CommunityTest> & { questions: Partial<TestQuestion>[] }) => {
    if (process.env.NODE_ENV !== 'production') {
      const mcqQuestions = (data.questions || []).filter((question) => question.type === 'mcq');
      console.info('[MCQ_DEBUG][FE][API][CREATE_TEST] Request payload', {
        communityId,
        title: data.title,
        type: data.type,
        totalQuestions: data.questions?.length || 0,
        mcqCount: mcqQuestions.length,
        mcqQuestions: mcqQuestions.map((question, index) => ({
          index,
          sourceMcqId: (question as any).sourceMcqId,
          question: (question.question || '').slice(0, 140),
          optionsCount: question.options?.length || 0,
          correctOption: question.correctOption,
          marks: question.marks,
        })),
      });
    }

    const response = await api.post<{ test: CommunityTest }>(`/communities/${communityId}/tests`, data);
    return response.data.test;
  },

  submitTest: async (
    communityId: string,
    testId: string,
    data: {
      answers: { questionId: string; selectedOption: number }[];
      codeSubmissions: {
        questionId: string;
        code?: string;
        language?: string;
        languageId?: number;
        isLocked?: boolean;
      }[];
    }
  ) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[MCQ_DEBUG][FE][API][SUBMIT_TEST] Request payload', {
        communityId,
        testId,
        answersCount: data.answers?.length || 0,
        answers: data.answers,
      });
    }

    const response = await api.post(`/communities/${communityId}/tests/${testId}/submit`, data);
    return response.data;
  },

  getTestAnalytics: async (communityId: string, testId: string) => {
    const response = await api.get(`/communities/${communityId}/tests/${testId}/analytics`);
    return response.data;
  },
};