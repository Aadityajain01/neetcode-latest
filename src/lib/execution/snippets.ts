import type { Problem } from "@/lib/api-modules";

const IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  node: "javascript",
  py: "python",
  python3: "python",
  "c++": "cpp",
};

export const LANGUAGE_NAMES: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
};

export const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 11,
  typescript: 74,
};

const LEGACY_TEMPLATES: Record<string, string> = {
  python: `class Solution:
    def solve(self, args):
        # args[0] is first input, args[1] is second input, ...
        # Do not use input().
        # Return the final answer.
        return None`,

  javascript: `class Solution {
    solve(args) {
        // args[0] is first input line.
        // Do not use process.stdin.
        // Return the final answer.
        return null;
    }
}`,

  java: `// Java Solution
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // Read input
        // int a = scanner.nextInt();

        // Process logic

        // Print output
        // System.out.println(a);

        scanner.close();
    }
}`,

  cpp: `// C++ Solution
#include <iostream>
using namespace std;

int main() {
    ios::sync_with_stdio(0);
    cin.tie(0);

    // Read input
    // int a;
    // cin >> a;

    // Process logic

    // Print output
    // cout << a;

    return 0;
}`,

  c: `// C Solution
#include <stdio.h>

int main() {
    // Read input
    // int a;
    // scanf("%d", &a);

    // Process logic

    // Print output
    // printf("%d", a);

    return 0;
}`,
};

function sanitizeFunctionName(functionName?: string): string {
  const value = (functionName || "").trim();
  if (!value) return "solve";
  return IDENTIFIER_REGEX.test(value) ? value : "solve";
}

export function normalizeExecutionLanguage(language: string): string {
  const normalized = (language || "").trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] || normalized;
}

export function isFunctionBasedProblem(problem: Problem): boolean {
  if (problem.functionName && problem.functionName.trim().length > 0) {
    return true;
  }

  return Boolean(problem.codeSnippets && Object.keys(problem.codeSnippets).length > 0);
}

function getDefaultFunctionTemplates(functionName: string): Record<string, string> {
  return {
    python: `class Solution:
    def ${functionName}(self, args):
        """
        args is a parsed list of input lines.
        Return your answer instead of printing it.
        """

        # Example:
        # a = int(args[0])
        # b = int(args[1])
        # return a + b

        return None`,

    javascript: `class Solution {
    ${functionName}(args) {
        // args is a parsed array of input lines.
        // Return your answer instead of console.log.

        // Example:
        // const a = Number(args[0]);
        // const b = Number(args[1]);
        // return a + b;

        return null;
    }
}`,

    java: `import java.util.*;

class Solution {
    public Object ${functionName}(List<String> args) {
        // args contains input lines as strings.
        // Return the answer instead of System.out.println.

        return null;
    }
}`,

    cpp: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    string ${functionName}(vector<string> args) {
        // args contains input lines as strings.
        // Return the answer instead of cout.

        return "";
    }
};`,

    c: `#include <stdio.h>
#include <stdlib.h>

char* ${functionName}(char** args, int argsCount) {
    // args contains input lines as strings.
    // Return a string answer instead of printf.

    return NULL;
}`,
  };
}

export function getEditorSnippet(problem: Problem, language: string): string {
  const normalizedLanguage = normalizeExecutionLanguage(language);

  const customSnippet =
    problem.codeSnippets?.[normalizedLanguage] ||
    problem.codeSnippets?.[language] ||
    problem.codeSnippets?.[language.toLowerCase()];

  if (customSnippet) {
    return customSnippet;
  }

  if (isFunctionBasedProblem(problem)) {
    const functionName = sanitizeFunctionName(problem.functionName);
    const templates = getDefaultFunctionTemplates(functionName);
    return templates[normalizedLanguage] || "";
  }

  return LEGACY_TEMPLATES[normalizedLanguage] || "";
}
