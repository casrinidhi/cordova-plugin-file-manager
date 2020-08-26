var file = {};

(function() {
    
    file.cacheManager = function(cacheDir, cacheLimit) {
        this.cacheDir = cordova.file.cacheDirectory + cacheDir + "/";
        this.cacheLimit = cacheLimit;

        this.createDirectory(cacheDir);
    };

    file.cacheManager.prototype.createDirectory = function(cacheDir) {
        console.log("Create directory. Cache directory path: " + this.cacheDir);

        function failureCallback() {
            console.log("Creating directory failed");
        }

        function successCallback(dirEntry) {
            dirEntry.getDirectory(cacheDir, {
                create: true
            }, function(subDirEntry) {
                console.log("Directory created");
            });
        }

        window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, successCallback, failureCallback);
    };

    file.cacheManager.prototype.checkIfFileExists = function(fileName, createIfDoesntExist, successCallback, failureCallback) {
        console.log("Check if file exists:  " + this.cacheDir + fileName);

        var that = this;

        function fileExists(fileEntry) {
            console.log("Cache File exists: " + fileEntry.toURL());
            successCallback(fileEntry);
        }

        function fileDoesNotExists() {
            if (createIfDoesntExist) {
                console.log("Cache file does not exists. Creating file: " + fileName);
                that.createCacheFile(fileName, successCallback, failureCallback);
            } else {
                console.log("Cache file does not exist");
                failureCallback();
            }
        }

        window.resolveLocalFileSystemURL(this.cacheDir + fileName, fileExists, fileDoesNotExists);
    };

    file.cacheManager.prototype.createCacheFile = function(fileName, successCallback, failureCallback) {
    	console.log("Create file: " + fileName);
        var that = this;

        function fileExists(dirEntry) {
            dirEntry.getFile(fileName, {
                create: true,
                exclusive: false
            }, successCallback, failureCallback);
            that.checkCacheLimit(dirEntry);
        }

        function fileDoesNotExists() {
            failureCallback();
        }

        window.resolveLocalFileSystemURL(this.cacheDir, fileExists, fileDoesNotExists);
    };

    file.cacheManager.prototype.directoryCount = function(dirEntry, successCallback, failureCallback) {
        var directoryReader = dirEntry.createReader();
        directoryReader.readEntries(successCallback, failureCallback);
    };

    file.cacheManager.prototype.checkCacheLimit = function(dirEntry) {
        var that = this;

        var deleteFile = function(file) {
            that.deleteFile(file);
        }

        function successCallback(fileEntries) {
            if (fileEntries.length > that.cacheLimit) {
                that.oldestFile(fileEntries, deleteFile, failureCallback);
            }
        }

        function failureCallback() {
            console.log("Failed to check cache limit");
        }

        this.directoryCount(dirEntry, successCallback, failureCallback);
    };

    file.cacheManager.prototype.oldestFile = function(fileEntries, successCallback, failureCallback) {
        var oldestIndex = -1;
        var oldestDateTime = new Date();
        var files = [];

        for (var index = 0; index < fileEntries.length; index++) {
            var fileEntry = fileEntries[index];

            fileEntry.file(function(file) {
                var count = files.length;
                files[count] = file;

                if (files.length == fileEntries.length) {
                    //all files processed
                    for (var j = 0; j < files.length; j++) {
                        var lFile = files[j];
                        var date = new Date(lFile.lastModified);

                        if (date < oldestDateTime) {
                            oldestIndex = j;
                            oldestDateTime = date;
                        }
                    }

                    if (oldestIndex > -1) {
                        successCallback(files[oldestIndex]);
                    }
                }
            });
        }
    };

    file.cacheManager.prototype.readCacheFile = function(fileName, format, successCallback, failureCallback) {
        var fileExists = function(fileEntry) {
            console.log("Read cache File. Cache file path:  " + fileEntry.toURL());

            fileEntry.file(function(file) {
                var reader = new FileReader();

                reader.onloadend = function() {
                    console.log("Cache file successfully read");
                    successCallback(this.result);
                };

                if (format == "dataURL") {
                    reader.readAsDataURL(file);
                } else if (format == "buffer") {
                    reader.readAsArrayBuffer(file);
                } else {
                    reader.readAsText(file);
                }
            }, failureCallback);
        };

        var fileDoesNotExists = function() {
            console.log("Cache file does not exist to read");
            failureCallback();
        };

        this.checkIfFileExists(fileName, false, fileExists, fileDoesNotExists);
    };

    file.cacheManager.prototype.writeCacheFile = function(fileName, content, contentType, successCallback, failureCallback) {
        var fileExists = function(fileEntry) {
            console.log("Read cache File. Cache file path:  " + fileEntry.toURL());

            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function() {
                    console.log("Cache file successfully written");
                    successCallback();
                };

                fileWriter.onerror = function(e) {
                    console.log("Cache file writing failed");
                    failureCallback();
                };

                if (contentType === "json") {
                    var blob = new Blob([JSON.stringify(content)], {
                        type: 'text/plain'
                    });
                    fileWriter.write(blob);
                } else {
                    fileWriter.write(content);
                }
            });
        };

        var fileDoesNotExists = function() {
            console.log("Cache file does not exists");
            failureCallback();
        };

        this.checkIfFileExists(fileName, true, fileExists, fileDoesNotExists);
    };

    file.cacheManager.prototype.deleteCacheFile = function(fileName, successCallback, failureCallback) {
        function fileExists(fileEntry) {
            console.log("Delete cache File. Cache file path:  " + fileEntry.toURL());
            fileEntry.remove();
            successCallback();
        }

        function fileDoesNotExists() {
            console.log("Cache file does not exists");
            failureCallback();
        }

        window.resolveLocalFileSystemURL(this.cacheDir + fileName, fileExists, fileDoesNotExists);
    };

    file.cacheManager.prototype.clearCacheDirectory = function(successCallback, failureCallback) {
        function dirExists(dirEntry) {
            dirEntry.removeRecursively();
            console.log("Cache Directory deleted");
            successCallback();
        }

        function dirDoesNotExists() {
            console.log("Failed to delete cache directory");
            failureCallback();
        }

        window.resolveLocalFileSystemURL(this.cacheDir, dirExists, dirDoesNotExists);
    };
})();