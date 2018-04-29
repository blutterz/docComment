import * as ts from "typescript";

interface FileLanguageInfo {
    readonly [index: number]: string;
    text: string;
    version: number;
}

export class LanguageServiceHost implements ts.LanguageServiceHost {

    private _files: ts.MapLike<FileLanguageInfo>;

    constructor() {
        this._files = <any>{};
    }

    updateCurrentFile(fileName: string, fileText: string) {
        for (const existingFileName in this._files) {
            delete this._files[existingFileName].text;
        }

        if (this._files[fileName]) {
            this._files[fileName].version++;
            this._files[fileName].text = fileText;
        } else {
            this._files[fileName] = {text: fileText, version: 0 };
        }
    }

    getScriptFileNames() {
        return Object.keys(this._files);
    }

    getScriptVersion(fileName: string) {
        return this._files[fileName] && this._files[fileName].version.toString();
    }

    getScriptSnapshot(fileName: string) {
        return ts.ScriptSnapshot.fromString(this._files[fileName] ? this._files[fileName].text : "");
    }

    getCurrentDirectory(): string {
        return process.cwd();
    }

    getDefaultLibFileName(options: ts.CompilerOptions) {
        return ts.getDefaultLibFilePath(options);
    }

    getCompilationSettings():  ts.CompilerOptions {
        return {
            allowJs: true
        };
    }

    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) {
        if (!this._files[fileName]) {
            return;
        }
        return ts.createSourceFile(fileName, this._files[fileName].text, ts.ScriptTarget.Latest);
    }
}