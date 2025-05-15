declare module 'radon-js' {
  interface HalsteadMetrics {
    difficulty: number;
    effort: number;
  }

  interface PythonFunction {
    name: string;
    lineno: number;
    complexity: number;
    loc: number;
    halstead: HalsteadMetrics;
  }

  interface PythonAnalysis {
    functions: PythonFunction[];
    complexity: {
      cyclomatic: number;
      halstead_effort: number;
    };
    maintainability: number;
  }

  function analyze(code: string): PythonAnalysis;

  export function analyze(code: string): PythonAnalysis;
}
