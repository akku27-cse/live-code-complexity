import * as vscode from 'vscode';
import escomplex from 'typhonjs-escomplex';

import * as radon from 'radon-js';
import { ComplexityReport, FunctionComplexity } from './types';

export class ComplexityAnalyzer {
    private cache: Map<string, ComplexityReport> = new Map();
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public analyzeDocument(document: vscode.TextDocument): ComplexityReport {
        const cachedReport = this.cache.get(document.uri.toString());
        if (cachedReport) {
            return cachedReport;
        }

        const text = document.getText();
        let report: ComplexityReport;

        try {
            switch (document.languageId) {
                case 'javascript':
                case 'typescript':
                    report = this.analyzeJavaScript(text);
                    break;
                case 'python':
                    report = this.analyzePython(text);
                    break;
                case 'java':
                    // Java analysis would go here
                    report = this.createEmptyReport();
                    break;
                default:
                    report = this.createEmptyReport();
            }
        } catch (error) {
            this.outputChannel.appendLine(`Analysis error: ${error}`);
            report = this.createEmptyReport();
        }

        this.cache.set(document.uri.toString(), report);
        return report;
    }

    private analyzeJavaScript(code: string): ComplexityReport {
       const report = escomplex.analyzeModule(code);

        
        const functions: FunctionComplexity[] = report.methods.map(method=> ({
            name: method.name,
            line: method.lineStart,
            cyclomatic: method.cyclomatic,
            halsteadDifficulty: method.halstead.difficulty,
            halsteadEffort: method.halstead.effort,
            linesOfCode: method.sloc.logical
        }));

        return {
            functions,
            averageCyclomatic: report.cyclomatic,
            averageHalsteadEffort: report.halstead.effort,
            fileComplexity: report.maintainability
        };
    }

    private analyzePython(code: string): ComplexityReport {
        const analysis = radon.analyze(code);
        
        const functions: FunctionComplexity[] = analysis.functions.map(func => ({
            name: func.name,
            line: func.lineno,
            cyclomatic: func.complexity,
            halsteadDifficulty: func.halstead.difficulty,
            halsteadEffort: func.halstead.effort,
            linesOfCode: func.loc
        }));

        return {
            functions,
            averageCyclomatic: analysis.complexity.cyclomatic,
            averageHalsteadEffort: analysis.complexity.halstead_effort,
            fileComplexity: analysis.maintainability
        };
    }

    public getFileComplexity(document: vscode.TextDocument): number {
        const report = this.analyzeDocument(document);
        return report.fileComplexity;
    }

    public getFunctionAtPosition(document: vscode.TextDocument, position: vscode.Position): FunctionComplexity | undefined {
        const report = this.analyzeDocument(document);
        return report.functions.find(func => 
            func.line === position.line + 1
        );
    }

    public generateReport(): void {
        // Implementation for generating a full project report
        this.outputChannel.show();
        this.outputChannel.appendLine('Generating complexity report...');
    }

    private createEmptyReport(): ComplexityReport {
        return {
            functions: [],
            averageCyclomatic: 0,
            averageHalsteadEffort: 0,
            fileComplexity: 0
        };
    }
}