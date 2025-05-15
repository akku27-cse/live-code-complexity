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
exports.ComplexityHoverProvider = void 0;
const vscode = __importStar(require("vscode"));
class ComplexityHoverProvider {
    constructor(analyzer) {
        this.analyzer = analyzer;
    }
    provideHover(document, position, token) {
        const func = this.analyzer.getFunctionAtPosition(document, position);
        if (!func) {
            return null;
        }
        const config = vscode.workspace.getConfiguration('codeComplexity');
        const cyclomaticThreshold = config.get('cyclomaticThreshold', 10);
        const halsteadThreshold = config.get('halsteadEffortThreshold', 300);
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
    getSeverity(func, cyclomaticThreshold, halsteadThreshold) {
        if (func.cyclomatic > cyclomaticThreshold || func.halsteadEffort > halsteadThreshold) {
            return 'high';
        }
        if (func.cyclomatic > cyclomaticThreshold * 0.7 || func.halsteadEffort > halsteadThreshold * 0.7) {
            return 'medium';
        }
        return 'low';
    }
    getSeverityMark(severity) {
        switch (severity) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            default: return '🟢';
        }
    }
    getRefactoringSuggestions(func) {
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
exports.ComplexityHoverProvider = ComplexityHoverProvider;
