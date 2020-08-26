
var fileName = 'testFile';

file.initFileCacheManager = function() {
	app.testFileCache = new file.cacheManager(fileName, 1);
}

$(document).ready(function(){
	var $getFilePathBtn = $('#getFilePath');
	var $readFileBtn = $('#readFile');
	var $writeFileBtn = $('#writeFile');
	var $deleteFileBtn = $('#deleteFile');
	var $deleteAllBtn = $('#deleteAll');

	var $outputDiv = $('#output');

	$getFilePathBtn.click(function(){
		$outputDiv.append('<br />');
		$outputDiv.append('===== Cache Path ===== ');
		$outputDiv.append('<br />');
		$outputDiv.append(app.testFileCache.cacheDir);
	});

	$readFileBtn.click(function(){
		var successCallback = function(content) {
			$outputDiv.append('<br />');
			$outputDiv.append('===== Read File Content ===== ');
			$outputDiv.append('<br />');
			$outputDiv.append(content ? content : "File is empty");
		}

		var failureCallback = function() {
			$outputDiv.append('<br />');
			$outputDiv.append('===== Read File Content ===== ');
			$outputDiv.append('<br />');
			$outputDiv.append("Failed to read file. Please refer console for more information.");
		}

		/* Format - buffer / dataURL / plain */
		app.testFileCache.readCacheFile(fileName, "plain", successCallback, failureCallback);
	});

	$writeFileBtn.click(function(){
		var $contentTextEle = $('#contentText');
		var content = $contentTextEle.val();

		if(content) {
			content = content.trim();
		}

		if(!content){
			$outputDiv.append('<br />');
			$outputDiv.append('===== Write File Content ===== ');
			$outputDiv.append('<br />');
			$outputDiv.append("Please enter text to write");

			return;
		} 

		var successCallback = function() {
			$outputDiv.append('<br />');
			$outputDiv.append('===== Write File Content ===== ');
			$outputDiv.append('<br />');
			$outputDiv.append("File cached");

			$contentTextEle.val("");
		}

		var failureCallback = function() {
			$outputDiv.append('<br />');
			$outputDiv.append('===== Write File Content ===== ');
			$outputDiv.append('<br />');
			$outputDiv.append("File could not be cached. Please refer console for more information.");
		}

		app.testFileCache.writeCacheFile(fileName, content, "json", successCallback, failureCallback);
	});

	$deleteFileBtn.click(function(){
		var successCallback = function() {
			$outputDiv.append('<br />');
			$outputDiv.append('===== Delete File ===== ');
			$outputDiv.append('<br />');
			$outputDiv.append("Cache file deleted successfully");
		}

		var failureCallback = function() {
			$outputDiv.append('<br />');
			$outputDiv.append('===== Delete File ===== ');
			$outputDiv.append('<br />');
			$outputDiv.append("Failed to delete cache file. Please refer console for more information.");
		}

		app.testFileCache.deleteCacheFile(fileName, successCallback, failureCallback);
	});

	$deleteAllBtn.click(function(){
		var successCallback = function() {
			$outputDiv.append('<br />');
			$outputDiv.append('===== Delete All ===== ');
			$outputDiv.append('<br />');
			$outputDiv.append("Cache cleared successfully. Re-run or recreate the cache directory.");
		}

		var failureCallback = function() {
			$outputDiv.append('<br />');
			$outputDiv.append('===== Delete File ===== ');
			$outputDiv.append('<br />');
			$outputDiv.append("Failed to clear cache. Please refer console for more information.");
		}

		app.testFileCache.clearCacheDirectory(successCallback, failureCallback);
	});
});