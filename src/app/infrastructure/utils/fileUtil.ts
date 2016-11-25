import { Injectable } from '@angular/core';

@Injectable()
export class FileUtil {
    copy(source: string, dest: string, callback) {
        var isCallbackCalled = false;

        var readStream = fs.createReadStream(source);
        readStream.on("error", function (err) {
            done(err);
        })

        var writeStream = fs.createWriteStream(dest);
        writeStream.on("error", function (err) {
            done(err);
        });

        readStream.pipe(writeStream);

        function done(err) {
            if (!isCallbackCalled) {
                callback(err);
                isCallbackCalled = true;
            }
        }
    }

    copyMultiples(files: string[], sourceDir:string, destDir: string, callback) {
        if (!fs.existsSync(sourceDir)){
            callback(`FileUtil:copyMultiples: Source ${sourceDir} not found`);
            return;
        }

        if (!fs.existsSync(destDir)){
            callback(`FileUtil:copyMultiples: Destination ${destDir} not found`);
            return;
        }

        for (let file of files) {
            var sourceFile = path.join(sourceDir,file);
            if (!fs.existsSync(sourceFile)) {
                callback(`FileUtil:copyMultiples: File ${sourceFile} not found`);
                continue;                
            }
            else {
                var destFile = path.join(destDir,file)
                this.copy(sourceFile,destFile,callback);
            }
        }
    }

    removeFolder(fileUtil: FileUtil, folderPath: string) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach(function (file, index) {
                var curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    fileUtil.removeFolder(fileUtil, curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folderPath);
        }
    };

}