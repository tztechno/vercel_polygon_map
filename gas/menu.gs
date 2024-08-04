function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('カスタムメニュー')
      .addItem('uploadToGitHub', 'uploadToGitHub')
      .addItem('downloadFromGitHub', 'downloadFromGitHub')
      .addToUi();
}
