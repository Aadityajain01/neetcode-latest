import axios, { AxiosInstance } from "axios";
import { config } from "../config/index";
import { logger } from "../logger/index";

export interface ExecuteRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

export interface ExecuteResponse {
  token: string;
}

export interface SubmissionResult {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: number;
  memory?: number;
  exit_code?: number;
}

export class Judge0Service {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.judge0.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        base64_encoded: false,
        wait: false,
      },
    });

    // if (config.judge0.apiKey) {
    //   this.client.defaults.headers['X-Auth-Token'] = config.judge0.apiKey;
    // }
  }

  private getLanguageId(language: string): number {
    const languageMap: { [key: string]: number } = {
      javascript: 63,
      python: 71,
      python3: 71,
      java: 62,
      c: 11,
      cpp: 54,
      "c++": 54,
      csharp: 51,
      go: 60,
      rust: 73,
      ruby: 72,
      php: 68,
      swift: 83,
      kotlin: 79,
      typescript: 74,
    };

    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    return languageId;
  }

  // public async execute(request: ExecuteRequest): Promise<ExecuteResponse> {
  //   try {
  //     const languageId = this.getLanguageId(request.language_id as any);

  //     const payload: any = {
  //       source_code: request.source_code,
  //       language_id: languageId,
  //     };

  //     if (request.stdin) {
  //       payload.stdin = request.stdin;
  //     }

  //     if (request.expected_output) {
  //       payload.expected_output = request.expected_output;
  //     }

  //     if (request.cpu_time_limit) {
  //       payload.cpu_time_limit = request.cpu_time_limit;
  //     }

  //     if (request.memory_limit) {
  //       payload.memory_limit = request.memory_limit * 1024 * 1024; // Convert to bytes
  //     }

  //     const response = await this.client.post('/submissions', payload);
  //     logger.info('Judge0 submission created', { token: response.data.token });

  //     return response.data;
  //   } catch (error) {
  //     logger.error('Judge0 execution failed:', error);
  //     throw new Error('Failed to submit code for execution');
  //   }
  // }
  public async execute(request: ExecuteRequest): Promise<ExecuteResponse> {
    try {
      const payload = {
        source_code: request.source_code,
        language_id: request.language_id, // use directly
        stdin: request.stdin,
        expected_output: request.expected_output,
        cpu_time_limit: request.cpu_time_limit,
        memory_limit: request.memory_limit
          ? request.memory_limit * 1024 * 1024
          : undefined,
      };

      const response = await this.client.post("/submissions", payload);
      logger.info("Judge0 submission created", { token: response.data.token });

      return response.data;
    } catch (error) {
      logger.error("Judge0 execution failed:", error);
      throw new Error("Failed to submit code for execution");
    }
  }

  // public async getSubmissionStatus(token: string): Promise<SubmissionResult> {
  //   try {
  //     const response = await this.client.get(`/submissions/${token}`);
  //     return response.data;
  //   } catch (error) {
  //     logger.error("Failed to get submission status:", error);
  //     throw new Error("Failed to get submission status");
  //   }
  // }
//   public async getSubmissionStatus(token: string): Promise<SubmissionResult> {
//   try {
//     const response = await this.client.get(
//       `/submissions/${token}`,
//       {
//         params: {
//           base64_encoded: false,
//           fields: "*",
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Failed to get submission status:", error);
//     throw new Error("Failed to get submission status");
//   }
// }
public async getSubmissionStatus(token: string): Promise<SubmissionResult> {
  try {
    const response = await this.client.get(`/submissions/${token}`, {
      params: {
        base64_encoded: false,
        fields: "*",
      },
    });
    return response.data;
  } catch (error) {
    logger.error("Failed to get submission status:", error);
    throw new Error("Failed to get submission status");
  }
}



  public async waitForCompletion(
    token: string,
    onProgress?: (status: SubmissionResult) => void
  ): Promise<SubmissionResult> {
    let attempts = 0;
    const maxAttempts = config.judge0.maxPollingAttempts;
    const pollingInterval = config.judge0.pollingInterval;

    while (attempts < maxAttempts) {
      const result = await this.getSubmissionStatus(token);

      if (onProgress) {
        onProgress(result);
      }

      if ([1, 2].includes(result.status.id)) {
        await new Promise((resolve) => setTimeout(resolve, pollingInterval));
        attempts++;
      } else {
        return result;
      }
    }

    throw new Error("Submission timeout");
  }

  public judge0StatusToOurStatus(judge0StatusId: number): string {
    const statusMap: { [key: number]: string } = {
      1: "pending",
      2: "running",
      3: "accepted",
      4: "wrong_answer",
      5: "time_limit_exceeded",
      6: "compile_error",
      7: "runtime_error",
      8: "memory_limit_exceeded",
      9: "runtime_error",
      10: "runtime_error",
      11: "compile_error",
      12: "runtime_error",
    };

    return statusMap[judge0StatusId] || "runtime_error";
  }
}

export const judge0Service = new Judge0Service();
