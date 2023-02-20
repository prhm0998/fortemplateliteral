import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  //cursorConvert
  let disposableCursor = vscode.commands.registerCommand(
    "forTemplateLiteral.cursor",
    async () => {
      //選択状態を解除する
      await vscode.commands.executeCommand("cancelSelection");
      //カーソル位置の単語を選択する
      await vscode.commands.executeCommand(
        "editor.action.addSelectionToNextFindMatch"
      );
      //選択した単語を変換する
      await vscode.commands.executeCommand("forTemplateLiteral.select");
      //
      //todo: restore original selections
      // 多分, 難しいのでやらない
      //
    }
  );
  context.subscriptions.push(disposableCursor);

  //selectConvert
  let disposableSelect = vscode.commands.registerCommand(
    "forTemplateLiteral.select",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selections = editor.selections;
        for (const selection of selections) {
          const text = editor.document.getText(selection); //実行時の選択テキスト
          const newText = `\${${text}}`;
          // 元々選択してあるテキストを置き換える
          await editor.edit((editBuilder) => {
            editBuilder.replace(selection, newText);
          });
        }
        await vscode.commands.executeCommand("cursorRight");
      }
    }
  );
  context.subscriptions.push(disposableSelect);

  //snippets
  let disposableSnippets = vscode.commands.registerCommand(
    "forTemplateLiteral.snippets",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.insertSnippet(
          new vscode.SnippetString("${$1}"),
          editor.selection.active
        );
      }
    }
  );
  context.subscriptions.push(disposableSnippets);
}

// This method is called when your extension is deactivated
export function deactivate() {}
