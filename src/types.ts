export interface FunctionComplexity {
    name: string;
    line: number;
    cyclomatic: number;
    halsteadDifficulty: number;
    halsteadEffort: number;
    linesOfCode: number;
}

export interface ComplexityReport {
    functions: FunctionComplexity[];
    averageCyclomatic: number;
    averageHalsteadEffort: number;
    fileComplexity: number; // Maintainability index or similar
}