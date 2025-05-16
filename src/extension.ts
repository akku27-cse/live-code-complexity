import * as vscode from 'vscode';
import { ComplexityAnalyzer } from './complexityAnalyzer';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('Code Complexity', { log: true });
    const analyzer = new ComplexityAnalyzer(outputChannel);

    // Show welcome message
    outputChannel.appendLine('Live Code Complexity Visualizer initialized');
    vscode.window.showInformationMessage('Code Complexity Visualizer is active!');

    // Register document handler
    vscode.workspace.onDidChangeTextDocument(async (event) => {
        try {
            const report = await analyzer.analyzeDocument(event.document);
            outputChannel.appendLine(`Analysis complete for ${event.document.fileName}`);
            // Process report here
        } catch (error) {
            outputChannel.appendLine(`Document analysis error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    // Initial analysis of active document
    if (vscode.window.activeTextEditor) {
        analyzer.analyzeDocument(vscode.window.activeTextEditor.document)
            .then(report => {
                outputChannel.appendLine('Initial analysis complete');
            })
            .catch(error => {
                outputChannel.appendLine(`Initial analysis error: ${error instanceof Error ? error.message : String(error)}`);
            });
    }
}

export function deactivate() {}