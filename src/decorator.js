"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexityDecorator = void 0;
const vscode = __importStar(require("vscode"));
class ComplexityDecorator {
    constructor(analyzer) {
        this.analyzer = analyzer;
        this.decorationTypes = this.createDecorationTypes();
    }
    updateDecorations(document) {
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
        const showInline = config.get('showInline', true);
        if (!showInline) {
            return;
        }
        const cyclomaticThreshold = config.get('cyclomaticThreshold', 10);
        const halsteadThreshold = config.get('halsteadEffortThreshold', 300);
        report.functions.forEach(func => {
            const severity = this.getSeverity(func, cyclomaticThreshold, halsteadThreshold);
            const decorationType = this.decorationTypes[severity];
            const range = new vscode.Range(new vscode.Position(func.line - 1, 0), new vscode.Position(func.line - 1, 1000));
            const decoration = {
                range,
                hoverMessage: this.createHoverMessage(func)
            };
            editor.setDecorations(decorationType, [decoration]);
        });
    }
    createDecorationTypes() {
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
    getIconPath(severity) {
        // You would provide your own icons for each severity level
        return vscode.Uri.file(vscode.Uri.joinPath(vscode.Uri.file(__dirname), `../media/${severity}-icon.svg`).fsPath);
    }
    getSeverity(func, cyclomaticThreshold, halsteadThreshold) {
        if (func.cyclomatic > cyclomaticThreshold || func.halsteadEffort > halsteadThreshold) {
            return 'high';
        }
        if (func.cyclomatic > cyclomaticThreshold * 0.7 || func.halsteadEffort > halsteadThreshold * 0.7) {
            return 'medium';
        }
        return 'low';
    }
    createHoverMessage(func) {
        return [
            `**${func.name}**`,
            `- Cyclomatic Complexity: ${func.cyclomatic}`,
            `- Halstead Effort: ${func.halsteadEffort.toFixed(2)}`,
            `- Lines of Code: ${func.linesOfCode}`,
            this.getRefactoringSuggestions(func)
        ].join('\n\n');
    }
    getRefactoringSuggestions(func) {
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
exports.ComplexityDecorator = ComplexityDecorator;
