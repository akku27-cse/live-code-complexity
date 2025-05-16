import * as vscode from 'vscode';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { FunctionComplexity, } from './types';

export class ComplexityDecorator {
    private analyzer: ComplexityAnalyzer;
    private decorationTypes: Record<string, vscode.TextEditorDecorationType>;
    private activeEditor?: vscode.TextEditor;

    constructor(analyzer: ComplexityAnalyzer) {
        this.analyzer = analyzer;
        this.decorationTypes = this.createDecorationTypes();
    }

    public async updateDecorations(document: vscode.TextDocument): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return;
        }

        this.activeEditor = editor;
        
        try {
            const report = await this.analyzer.analyzeDocument(document);

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

            report.functions.forEach((func: FunctionComplexity) => {
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
        } catch (error) {
            console.error('Error updating decorations:', error);
        }
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
        return vscode.Uri.file(
            vscode.Uri.joinPath(vscode.Uri.file(__dirname), `../media/${severity}-icon.svg`).fsPath
        );
    }

    private getSeverity(
        func: FunctionComplexity,
        cyclomaticThreshold: number,
        halsteadThreshold: number
    ): 'low' | 'medium' | 'high' {
        // Use default value of 0 if halsteadEffort is undefined
        const effort = func.halsteadEffort ?? 0;
        
        if (func.cyclomatic > cyclomaticThreshold || effort > halsteadThreshold) {
            return 'high';
        }
        if (func.cyclomatic > cyclomaticThreshold * 0.7 || effort > halsteadThreshold * 0.7) {
            return 'medium';
        }
        return 'low';
    }

    private createHoverMessage(func: FunctionComplexity): string {
        // Format metrics with fallbacks for undefined values
        const effortDisplay = func.halsteadEffort?.toFixed(2) ?? 'N/A';
        const locDisplay = func.linesOfCode?.toString() ?? 'N/A';
        
        return [
            `**${func.name}**`,
            `- Cyclomatic Complexity: ${func.cyclomatic}`,
            `- Halstead Effort: ${effortDisplay}`,
            `- Lines of Code: ${locDisplay}`,
            this.getRefactoringSuggestions(func)
        ].join('\n\n');
    }

    private getRefactoringSuggestions(func: FunctionComplexity): string {
        const suggestions: string[] = [];
        
        // Cyclomatic complexity suggestion (always available)
        if (func.cyclomatic > 10) {
            suggestions.push("🔹 Consider breaking this function into smaller functions");
        }
        
        // Halstead effort suggestion (only if available)
        if (func.halsteadEffort !== undefined && func.halsteadEffort > 300) {
            suggestions.push("🔹 The logic might be too dense - consider simplifying");
        }
        
        // Lines of code suggestion (only if available)
        if (func.linesOfCode !== undefined && func.linesOfCode > 30) {
            suggestions.push("🔹 This function is quite long - can it be split?");
        }

        return suggestions.length > 0 
            ? `**Suggestions:**\n${suggestions.join('\n')}`
            : '✅ This function looks good!';
    }

    public dispose(): void {
        Object.values(this.decorationTypes).forEach(type => type.dispose());
    }
}