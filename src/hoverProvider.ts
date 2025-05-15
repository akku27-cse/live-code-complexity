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
        const func = this.analyzer.getFunctionAtPosition(document, position);
        if (!func) {
            return null;
        }

        const config = vscode.workspace.getConfiguration('codeComplexity');
        const cyclomaticThreshold = config.get<number>('cyclomaticThreshold', 10);
        const halsteadThreshold = config.get<number>('halsteadEffortThreshold', 300);

        const severity = this.getSeverity(func, cyclomaticThreshold, halsteadThreshold);
        const severityMark = this.getSeverityMark(severity);

        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### ${func.name} ${severityMark}\n\n`);
        markdown.appendMarkdown(`**Complexity Metrics:**\n`);
        markdown.appendMarkdown(`- Cyclomatic: ${func.cyclomatic}\n`);
        markdown.appendMarkdown(`- Halstead Effort: ${func.halsteadEffort.toFixed(2)}\n`);
        markdown.appendMarkdown(`- Lines of Code: ${func.linesOfCode}\n\n`);

        if (severity === 'high') {
            markdown.appendMarkdown(`⚠️ **Warning:** This function is too complex\n\n`);
        }

        markdown.appendMarkdown(this.getRefactoringSuggestions(func));
        markdown.isTrusted = true;

        return new vscode.Hover(markdown);
    }

    private getSeverity(func: FunctionComplexity, cyclomaticThreshold: number, halsteadThreshold: number): string {
        if (func.cyclomatic > cyclomaticThreshold || func.halsteadEffort > halsteadThreshold) {
            return 'high';
        }
        if (func.cyclomatic > cyclomaticThreshold * 0.7 || func.halsteadEffort > halsteadThreshold * 0.7) {
            return 'medium';
        }
        return 'low';
    }

    private getSeverityMark(severity: string): string {
        switch (severity) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            default: return '🟢';
        }
    }

    private getRefactoringSuggestions(func: FunctionComplexity): string {
        const suggestions = [];
        
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