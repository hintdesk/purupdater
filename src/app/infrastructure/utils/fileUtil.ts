import { Injectable } from '@angular/core';

@Injectable()
export class FileUtil {
    copy(source: string, dest: string) {

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
            if (err)
                throw err;
        }
    }


    copyMultiples(files: string[], sourceDir: string, destDir: string) {
        if (!fs.existsSync(sourceDir))
            throw new Error(`FileUtil:copyMultiples: Source ${sourceDir} not found`);

        if (!fs.existsSync(destDir))
            throw new Error(`FileUtil:copyMultiples: Destination ${destDir} not found`);


        for (let file of files) {
            var sourceFile = path.join(sourceDir, file);
            if (!fs.existsSync(sourceFile)) {
                throw new Error(`FileUtil:copyMultiples: File ${sourceFile} not found`);
            }
            else {
                var destFile = path.join(destDir, file)
                this.copy(sourceFile, destFile);
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