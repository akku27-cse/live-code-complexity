import * as vscode from 'vscode';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { FunctionComplexity } from './types';

export class ComplexityDecorator {
    private analyzer: ComplexityAnalyzer;
    private decorationTypes: Record<string, vscode.TextEditorDecorationType>;
    private activeEditor?: vscode.TextEditor;

    constructor(analyzer: ComplexityAnalyzer) {
        this.analyzer = analyzer;
        this.decorationTypes = this.createDecorationTypes();
    }

    public updateDecorations(document: vscode.TextDocument): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return;
        }

        this.activeEditor = editor;
        const report = this.analyzer.analyzeDocument(document);

        // Clear all decorations first
        Object.values(this.decorationTypes).forEach(type => {
            editor.setDecorations(type, []);
        });

        // Add new decorations
        const config = vscode.workspace.getConfiguration('codeComplexity');
        const showInline = config.get<boolean>('showInline', true);

        if (!showInline) {
            return;
        }

        const cyclomaticThreshold = config.get<number>('cyclomaticThreshold', 10);
        const halsteadThreshold = config.get<number>('halsteadEffortThreshold', 300);

        report.functions.forEach(func => {
            const severity = this.getSeverity(func, cyclomaticThreshold, halsteadThreshold);
            const decorationType = this.decorationTypes[severity];

            const range = new vscode.Range(
                new vscode.Position(func.line - 1, 0),
                new vscode.Position(func.line - 1, 1000)
            );

            const decoration: vscode.DecorationOptions = {
                range,
                hoverMessage: this.createHoverMessage(func)
            };

            editor.setDecorations(decorationType, [decoration]);
        });
    }

    private createDecorationTypes(): Record<string, vscode.TextEditorDecorationType> {
        return {
            low: vscode.window.createTextEditorDecorationType({
                gutterIconPath: this.getIconPath('low'),
                overviewRulerColor: 'green',
                overviewRulerLane: vscode.OverviewRulerLane.Right
            }),
            medium: vscode.window.createTextEditorDecorationType({
                gutterIconPath: this.getIconPath('medium'),
                overviewRulerColor: 'yellow',
                overviewRulerLane: vscode.OverviewRulerLane.Right
            }),
            high: vscode.window.createTextEditorDecorationType({
                gutterIconPath: this.getIconPath('high'),
                overviewRulerColor: 'red',
                overviewRulerLane: vscode.OverviewRulerLane.Right,
                backgroundColor: 'rgba(255, 0, 0, 0.1)'
            })
        };
    }

    private getIconPath(severity: string): vscode.Uri {
        // You would provide your own icons for each severity level
        return vscode.Uri.file(
            vscode.Uri.joinPath(vscode.Uri.file(__dirname), `../media/${severity}-icon.svg`).fsPath
        );
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

    private createHoverMessage(func: FunctionComplexity): string {
        return [
            `**${func.name}**`,
            `- Cyclomatic Complexity: ${func.cyclomatic}`,
            `- Halstead Effort: ${func.halsteadEffort.toFixed(2)}`,
            `- Lines of Code: ${func.linesOfCode}`,
            this.getRefactoringSuggestions(func)
        ].join('\n\n');
    }

    private getRefactoringSuggestions(func: FunctionComplexity): string {
        const suggestions = [];
        
        if (func.cyclomatic > 10) {
            suggestions.push("🔹 Consider breaking this function into smaller functions");
        }
        
        if (func.halsteadEffort > 300) {
            suggestions.push("🔹 The logic might be too dense - consider simplifying");
        }
        
        if (func.linesOfCode > 30) {
            suggestions.push("🔹 This function is quite long - can it be split?");
        }

        return suggestions.length > 0 
            ? `**Suggestions:**\n${suggestions.join('\n')}`
            : '✅ This function looks good!';
    }
}