import * as vscode from 'vscode';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { FunctionComplexity } from './types';

export class ComplexityHoverProvider implements vscode.HoverProvider {
    private analyzer: ComplexityAnalyzer;

    constructor(analyzer: ComplexityAnalyzer) {
        this.analyzer = analyzer;
    }

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
       const func = this.analyzer.getFunctionAtPosition(document, position) as FunctionComplexity | undefined;

        if (!func) {
            return null;
        }

        // Provide defaults for optional properties
        const safeFunc: Required<FunctionComplexity> = {
            halsteadEffort: 0,
            halsteadDifficulty: 0,
            linesOfCode: 0,
            ...func
        };

        const config = vscode.workspace.getConfiguration('codeComplexity');
        const cyclomaticThreshold = config.get<number>('cyclomaticThreshold', 10);
        const halsteadThreshold = config.get<number>('halsteadEffortThreshold', 300);

        const severity = this.getSeverity(safeFunc, cyclomaticThreshold, halsteadThreshold);
        const severityMark = this.getSeverityMark(severity);

        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### ${safeFunc.name} ${severityMark}\n\n`);
        markdown.appendMarkdown(`**Complexity Metrics:**\n`);
        markdown.appendMarkdown(`- Cyclomatic: ${safeFunc.cyclomatic}\n`);
        markdown.appendMarkdown(`- Halstead Effort: ${safeFunc.halsteadEffort.toFixed(2)}\n`);
        markdown.appendMarkdown(`- Lines of Code: ${safeFunc.linesOfCode}\n\n`);

        if (severity === 'high') {
            markdown.appendMarkdown(`⚠️ **Warning:** This function is too complex\n\n`);
        }

        markdown.appendMarkdown(this.getRefactoringSuggestions(safeFunc));
        markdown.isTrusted = true;

        return new vscode.Hover(markdown);
    }

    private getSeverity(
        func: { cyclomatic: number; halsteadEffort: number },
        cyclomaticThreshold: number,
        halsteadThreshold: number
    ): 'low' | 'medium' | 'high' {
        if (func.cyclomatic > cyclomaticThreshold || func.halsteadEffort > halsteadThreshold) {
            return 'high';
        }
        if (func.cyclomatic > cyclomaticThreshold * 0.7 || func.halsteadEffort > halsteadThreshold * 0.7) {
            return 'medium';
        }
        return 'low';
    }

    private getSeverityMark(severity: 'low' | 'medium' | 'high'): string {
        switch (severity) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            default: return '🟢';
        }
    }

    private getRefactoringSuggestions(
        func: { cyclomatic: number; halsteadEffort: number; linesOfCode: number }
    ): string {
        const suggestions: string[] = [];
        
        if (func.cyclomatic > 10) {
            suggestions.push("- Break into smaller functions");
            suggestions.push("- Reduce conditional branches");
        }
        
        if (func.halsteadEffort > 300) {
            suggestions.push("- Simplify logical expressions");
            suggestions.push("- Extract complex calculations");
        }
        
        if (func.linesOfCode > 30) {
            suggestions.push("- Split into smaller functions");
            suggestions.push("- Use early returns to reduce nesting");
        }

        return suggestions.length > 0 
            ? `**Refactoring Suggestions:**\n${suggestions.join('\n')}`
            : '✅ This function has good complexity metrics';
    }
}