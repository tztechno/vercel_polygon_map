function onEdit(e) {

  if (!e || !e.range) {
    console.log("Invalid edit event");
    return;
  }

  var range = e.range;
  var sheet = range.getSheet();
  
  // チェックボックスに関連する行と列のチェック
  if (sheet.getName() == "pulldown") {
    var row = range.getRow();
    var column = range.getColumn();
    
    
    // その他の処理
    if (column == 3) { // 既存の処理を維持
      var userEmail = Session.getActiveUser().getEmail(); // 現在のユーザーのメールアドレスを取得
      var date = new Date();
      var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd"); // 日付フォーマット
      var formattedTime = Utilities.formatDate(date, Session.getScriptTimeZone(), "HH:mm:ss"); // 時間フォーマット
      
      // 編集されたセルの値を取得し、マッピングして数値に変換
      var selectedValue = range.getValue();
      var mapping = {
        "散布前": 0,
        "散布中": 1,
        "散布済み": 2,
        "散布中止": 3
      };
      var mappedValue = mapping[selectedValue] !== undefined ? mapping[selectedValue] : "";
      
      // 値を設定
      sheet.getRange(row, 2).setValue(mappedValue); // 2列目にマッピングされた数値を設定
      sheet.getRange(row, 4).setValue(userEmail); // 4列目にユーザーのメールアドレスを設定
      sheet.getRange(row, 5).setValue(formattedDate); // 5列目に日付を設定
      sheet.getRange(row, 6).setValue(formattedTime); // 6列目に時間を設定
    }
  }

}
