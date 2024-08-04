function downloadFromGitHub() {
  var github_url = "https://raw.githubusercontent.com/tztechno/vercel_polygon_map/main/public/Progress.csv";
  var csv = UrlFetchApp.fetch(github_url).getContentText();
  var data = Utilities.parseCsv(csv);
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("pulldown");
  
  // 進捗値のある行を抽出（1行目はカラム名なので除外）
  var progressRows = data.slice(1).filter(function(row) {
    return row[1] && row[1].trim(); // 進捗値が存在する行をフィルタリング
  });

  // シートの4列目から6列目の2行目以降を消去
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) { // 2行目以降にデータが存在する場合
    sheet.getRange(2, 4, lastRow - 1, 3).clearContent(); // 4列目から6列目まで
  }
  
  // 1列目と2列目にデータを設定（進捗値のある行だけ）
  if (progressRows.length > 0) {
    // 2行目以降にデータを設定（カラム名は1行目に保持）
    sheet.getRange(2, 1, progressRows.length, 2).setValues(progressRows);
  }

  // プルダウンのオプション
  var pulldownOptions = ["散布前", "散布中", "散布済み", "散布中止"];
  
  // 2列目のprogress値に基づいて3列目のプルダウンを設定
  for (var i = 2; i <= progressRows.length + 1; i++) {
    var progressValue = progressRows[i - 2][1]; // 2列目の値
    var pulldownCell = sheet.getRange(i, 3);
    
    // プルダウンの選択肢を設定
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(pulldownOptions).build();
    pulldownCell.setDataValidation(rule);
    
    // progress値に基づいてプルダウンの値を選択
    var selectedOption = getPulldownOption(progressValue);
    pulldownCell.setValue(selectedOption);
  }
}

// progress値に基づいてプルダウンのオプションを選択する関数
function getPulldownOption(progressValue) {
  switch(parseInt(progressValue)) {
    case 0:
      return "散布前";
    case 1:
      return "散布中";
    case 2:
      return "散布済み";
    case 3:
      return "散布中止";
    default:
      return "散布中止"; // デフォルト値または不正な値の場合
  }
}


