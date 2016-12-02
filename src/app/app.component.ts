import { AppContext } from './infrastructure/appContext';
import { Component, NgZone, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Build, BuildDefinition } from './models/buildDefinition';
import 'rxjs/add/operator/toPromise';
var app = <Electron.App>electron.remote.app;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    backUpFiles = ["bpi.ini", "ZurichPUR.exe", "ZurichPUR.exe.config"];
    builds: BuildDefinition[] = [];
    error: string = "";
    currentStatus: string;
    isDone: boolean = false;
    isExtracting: boolean = false;
    percentage: number = 0;
    purDirectory: string;
    selectedBuild: BuildDefinition;
    selectedPurFile: string;
    tempFolder = path.join(os.tmpdir(), "PurUpdater");


    constructor(
        private appContext: AppContext,
        private http: Http,
        private ngZone: NgZone) {

    }
    createTempFolder() {
        if (!fs.existsSync(this.tempFolder))
            fs.mkdirSync(this.tempFolder);
    }

    getBuildDefinitions() {
        this.http.get("https://tfs.office.spsnetz.de/tfs/DefaultCollection/Zurich-Weblife20/_apis/build/definitions")
            .toPromise()
            .then(reponse => {
                var data = reponse.json();
                if (data) {
                    this.builds = data.value as BuildDefinition[];
                }

            })
            .catch(err => {
                this.error = "getBuildDefinitions:" + err;
            })
    }

    getPurDirectory(build: Build): string {
        var result: string;
        if (build.enabled && build.inputs.msbuildArgs) {
            var args = build.inputs.msbuildArgs.split("/");
            for (let arg of args) {
                var argKeyValue = arg.split("=");
                if (argKeyValue.length === 2 && argKeyValue[0] === "p:RKRootFolder") {
                    var foundPath = argKeyValue[1].replace(new RegExp("\\\"", "g"), "");
                    var files = fs.readdirSync(foundPath);
                    if (files.length == 1)
                        result = path.join(foundPath, files[0]);
                    else
                        this.error = "getPurDirectory: Multiple PUR folders were found";
                    break;
                }
            }
        }
        return result;
    }

    ngOnInit() {
        this.createTempFolder();
        this.getBuildDefinitions();
    }


    onSelectedBuildChanged($event) {
        this.http.get(this.selectedBuild.url)
            .toPromise()
            .then(reponse => {
                var data = reponse.json();
                if (data) {
                    var build = data.build as Build[];
                    for (let item of build) {
                        this.purDirectory = this.getPurDirectory(item)
                        if (this.purDirectory)
                            break;
                    }
                }
            })
            .catch(err => {
                this.error = "onSelectedBuildChanged:" + err;
            })
    }

    onSelectedFileChange($event) {
        var files = $event.srcElement.files;
        if (files.length > 0)
            this.selectedPurFile = files[0].path;
    }

    update() {
        this.error = "";
        this.isExtracting = true;
        this.isDone = false;
        this.percentage = 0;

        // var testDestPath = "\\\\build03.office.spsnetz.de\\ReleaseBuilds\\Rechenkerne\\Zurich\\_ForBuild\\Dev Release 2\\Temp";
        // // // var testDestPath = "C:\\Temp\\PurDE";
        // this.purDirectory = testDestPath;
        // // // var testSourcePath = "C:\\Temp\\rtimepur_20161124_IQ17_TST9.zip";
        // var testSourcePath = "O:\\Kunden\\Zurich\\Software\\PuR\\rtimepur_20161124_IQ17_TST9.zip";
        // this.selectedPurFile = testSourcePath;

        this.currentStatus = "Check if PUR directory exists";
        if (!fs.existsSync(this.purDirectory)) {
            this.error = "update:PUR directory not found: " + this.purDirectory;
            return;
        }

        this.currentStatus = "Check if new PUR zip file exists";
        if (!fs.existsSync(this.selectedPurFile)) {
            this.error = "update:PUR file not found: " + this.selectedPurFile;
            return;
        }

        this.currentStatus = "Backup " + this.backUpFiles.join(",");
        this.appContext.Util.File.copyMultiples(this.backUpFiles, this.purDirectory, this.tempFolder, (err) => {
            if (err) {
                this.error = "copyBackupFilesToTempFolder: " + err;
                return;
            }
        });

        if (this.error)
            return;

        this.currentStatus = "Delete old PUR files";
        try {
            fs.removeSync(this.purDirectory);
        }
        catch (ex) {
            console.log(ex);
        }

        // del.sync([this.purDirectory + "/*"], { force: true });

        //    try {
        //        this.appContext.Util.File.removeFolder(this.appContext.Util.File, this.purDirectory);
        //    }
        //    catch (ex){
        //        console.log(ex);
        //    }



        if (!fs.existsSync(this.purDirectory))
            fs.mkdirSync(this.purDirectory);


        var unzipper = new decompresszip(this.selectedPurFile);
        unzipper.on('error', function (err) {
            console.log(err);
            this.ngZone.run(() => {
                this.isExtracting = false;
                this.error = "decompresszip:error: " + err;
            });
        });

        unzipper.on('extract', (log) => {
            console.log("Update done...");
            this.ngZone.run(() => {
                this.isDone = true;
                this.isExtracting = false;
                this.currentStatus = undefined;
                this.appContext.Util.File.copyMultiples(this.backUpFiles, this.tempFolder, this.purDirectory, (err) => {
                    if (err) {
                        this.error = "copyBackupFilesToPurFolder: " + err;
                        console.log(err);
                        return;
                    }
                });

            });
        });

        unzipper.on('progress', (fileIndex, fileCount) => {
            this.ngZone.run(() => {
                this.percentage = Math.floor(((fileIndex * 100) / fileCount));
                this.currentStatus = "Current file index " + fileIndex + "/" + fileCount;
                // console.log(fileIndex + "/" + fileCount);
            });
        });

        unzipper.extract({ path: this.purDirectory, strip: 1 });

    }

}
