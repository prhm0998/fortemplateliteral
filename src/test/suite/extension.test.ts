import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
  // テストが開始されたことをユーザーに知らせる情報メッセージを表示する
  const publisher = "undefined_publisher"; //package.jsonのpublisher 無い場合は "undefined_publisher" 固定文字列が使用される
  const packageName = "fortemplateliteral"; //package.jsonのname nameは小文字限定,
  const extensionId = `${publisher}.${packageName}`; //publisher + "." + name 大文字小文字は区別しないようだ
  const commands = [
    "forTemplateLiteral.cursor",
    "forTemplateLiteral.select",
    "forTemplateLiteral.snippets",
  ];
  vscode.window.showInformationMessage("テストを開始します。");

  //拡張機能がインストールされているか
  test("Extension should be present", () => {
    assert.ok(vscode.extensions.getExtension(extensionId));
  });

  //拡張機能がアクティブにできるか
  test("Should activate the extension", async function () {
    await vscode.extensions.getExtension(extensionId)!.activate();
    assert.ok(true);
  });

  //拡張機能の各コマンドが実行できるか
  commands.forEach((command) => {
    test(`Should execute the command  ${command} `, async function () {
      const result = await vscode.commands.executeCommand(command);
      assert.strictEqual(result, undefined);
    });
  });

  //cursorが実行できるか
  test("convert command should convert cursor text", async function () {
    //新しいエディタを設定
    const newContent = "const name = Alice;";
    const newDocument = await vscode.workspace.openTextDocument({
      content: newContent,
      language: "javascript",
    });
    await vscode.window.showTextDocument(newDocument);
    //カーソル位置を作成して変更
    const selection = new vscode.Selection(0, 13, 0, 13);
    vscode.window.activeTextEditor!.selection = selection;
    //コマンド実行
    await vscode.commands.executeCommand("forTemplateLiteral.cursor");
    //コマンド実行後のテキストを取得
    const resultText = vscode.window.activeTextEditor?.document.getText();
    assert.strictEqual(resultText, "const name = ${Alice};");
  });

  //selectが1つの選択に対し実行できるか
  test("convert command should convert selected a word", async function () {
    //新しいエディタを設定
    const newContent = "const name = Alice;";
    const newDocument = await vscode.workspace.openTextDocument({
      content: newContent,
      language: "javascript",
    });
    await vscode.window.showTextDocument(newDocument);
    //選択状態を作成して変更
    const selection = new vscode.Selection(0, 13, 0, 18);
    vscode.window.activeTextEditor!.selection = selection;
    //コマンド実行
    await vscode.commands.executeCommand("forTemplateLiteral.select");
    //コマンド実行後のテキストを取得
    const resultText = vscode.window.activeTextEditor?.document.getText();
    assert.strictEqual(resultText, "const name = ${Alice};");
  });

  //selectが複数の選択に対し実行できるか
  test("convert command should convert selected multi word", async function () {
    //新しいエディタを設定
    const newContent = `const name = Alice;
const name1 = Alice;
const name12 = Alice;
const name13 = Alice;`;
    const newDocument = await vscode.workspace.openTextDocument({
      content: newContent,
      language: "javascript",
    });
    await vscode.window.showTextDocument(newDocument);
    //選択状態を作成して変更
    const selections = [];
    selections.push(new vscode.Selection(0, 13, 0, 18));
    selections.push(new vscode.Selection(2, 15, 2, 20));
    selections.push(new vscode.Selection(3, 15, 3, 20));
    vscode.window.activeTextEditor!.selections = selections;

    //console.log("選択中の単語");
    //for (const selection of vscode.window.activeTextEditor!.selections) {
    //  console.log(vscode.window.activeTextEditor!.document.getText(selection));
    //}

    //コマンド実行
    await vscode.commands.executeCommand("forTemplateLiteral.select");
    //コマンド実行後のテキストを取得
    const resultText = vscode.window.activeTextEditor?.document.getText();
    assert.strictEqual(
      resultText,
      `const name = \${Alice};
const name1 = Alice;
const name12 = \${Alice};
const name13 = \${Alice};`
    );
  });

  //snippetsが実行できるか
  test("snippets command should insert snippet text", async () => {
    //新しいエディタを設定
    const newContent = "const name = ";
    const newDocument = await vscode.workspace.openTextDocument({
      content: newContent,
      language: "javascript",
    });
    await vscode.window.showTextDocument(newDocument);
    //選択状態を作成する
    const selection = new vscode.Selection(0, 13, 0, 13);
    vscode.window.activeTextEditor!.selection = selection;
    //コマンド実行
    await vscode.commands.executeCommand("forTemplateLiteral.snippets");
    //エディタ上で入力を行う
    await vscode.commands.executeCommand("type", { text: "Alice" });
    //await vscode.commands.executeCommand("tab"); //これはタブキーが入力されるだけなので不可
    await vscode.commands.executeCommand("jumpToNextSnippetPlaceholder"); //次のpladeholderに移動で終点に移動
    await vscode.commands.executeCommand("type", { text: ";" });
    //実行後のテキストを取得
    const resultText = vscode.window.activeTextEditor?.document.getText();
    assert.strictEqual(resultText, "const name = ${Alice};");
  });

  //テストに対するmochaのtimeoutを変えてみるテスト;
  test.skip("check mocha timeout setting", async function () {
    const sleep = (msec: number) =>
      new Promise((resolve) => setTimeout(resolve, msec));
    this.timeout(11000);
    await sleep(10000);
  });
});
