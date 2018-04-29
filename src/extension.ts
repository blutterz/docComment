'use strict';
import * as vscode from "vscode";
import * as path from "path";
import { Documenter } from "./documenter";

const languages = [
    "javascript",
    "typescript",
    "vue",
    "javascriptreact",
    "typescriptreact",
    "php"
];

let documenter: Documenter;

function lazyInitializeDocumenter() {
    documenter || (documenter = new Documenter());
}

function languageIsSupported(document: vscode.TextDocument) {
    return (languages.findIndex( l => document.languageId === l) !== -1 || path.extname(document.fileName) === '');
}

function verifyLanguageSupport(document: vscode.TextDocument, commandName: string) {
    if (!languageIsSupported(document)) {
        vscode.window.showWarningMessage(`Sorry! '${commandName}' currently only supports JavaScript and TypeScript.`);
        return false;
    }

    return true;
}

function runCommand(commandName: string, document: vscode.TextDocument, implFunc: () => void) {
    if (!verifyLanguageSupport(document, commandName)) {
        return;
    }

    try {
        lazyInitializeDocumenter();
        implFunc();
    } catch (e) {
        debugger;
        console.error(e);
    }
}

class DocThisCompletionItem extends vscode.CompletionItem {

    constructor(document: vscode.TextDocument, position: vscode.Position) {
        super("/** Document Comment */", vscode.CompletionItemKind.Snippet);

        this.insertText = "";
        this.sortText = '\0';

        const line = document.lineAt(position.line).text;
        const prefix = line.slice(0, position.character).match(/\/\**\s*$/);
        const suffix = line.slice(position.character).match(/^\s*\**\//);
        const start = position.translate(0, prefix ? -prefix[0].length : 0);
        this.range = new vscode.Range(
            start,
            position.translate(0, suffix ? suffix[0].length : 0));

        this.command = {
            title: "docComment",
            command: "extension.docComment",
            arguments: [true]
        };

    }
}

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(languages,
        {
            provideCompletionItems: (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) => {
                const line = document.lineAt(position.line).text;
                const prefix = line.slice(0, position.character);

                if (prefix.match(/^\s*$|\/\*\*\s*$|^\s*\/\*\*+\s*$/)) {
                    return [new DocThisCompletionItem(document, position)];
                }

                return;
            }
        }, "/", "*"));

    context.subscriptions.push(vscode.commands.registerCommand("extension.docComment", (forCompletion: boolean) => {
        const commandName = "sampleDoc";
        runCommand(commandName, vscode.window.activeTextEditor!.document, () => {
            documenter.documentThis(vscode.window.activeTextEditor!, commandName, forCompletion);
        });
    }));

    context.subscriptions.push(vscode.commands.registerCommand("extension.traceTypeScriptSyntaxNode", () => {
        const commandName = "Trace TypeScript Syntax Node";
        runCommand(commandName, vscode.window.activeTextEditor!.document, () => {
            documenter.traceNode(vscode.window.activeTextEditor!);
        });
    }));

}

export function deactivate() {
}