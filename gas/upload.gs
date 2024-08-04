function uploadToGitHub() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("pulldown");
  var data = sheet.getRange(1, 1, sheet.getLastRow(), 2).getValues();
  var csv = data.map(row => row.join(',')).join('\n');
  
  var github_token = "xxx"; //available until 2024-08-04
  var repo_owner = "tztechno";
  var repo_name = "vercel_polygon_map";
  var file_path = "public/Progress.csv";
  var api_url = 'https://api.github.com/repos/' + repo_owner + '/' + repo_name + '/contents/' + file_path;
  
  var headers = {
    "Authorization": "token " + github_token,
    "Content-Type": "application/json"
  };
  
  var file_content = Utilities.base64Encode(csv);
  
  try {
    // Get the current file SHA to update the file
    var response = UrlFetchApp.fetch(api_url, {
      "method": "get",
      "headers": headers
    });
    
    var file_data = JSON.parse(response.getContentText());
    var sha = file_data.sha;

    var payload = {
      "message": "Update progress.csv",
      "content": file_content,
      "sha": sha
    };
    
    var options = {
      "method": "put",
      "headers": headers,
      "payload": JSON.stringify(payload)
    };
    
    var updateResponse = UrlFetchApp.fetch(api_url, options);
    Logger.log(updateResponse.getContentText());
  } catch (e) {
    Logger.log(e.toString());
    Logger.log(e.message);
    Logger.log(e.stack);
    if (e.response) {
      Logger.log(e.response.getContentText()); // エラーレスポンスの内容をログに記録
    }
  }
}
