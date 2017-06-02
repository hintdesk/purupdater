
import { AppContext } from './infrastructure/appContext';
import { Component, NgZone, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Build, BuildDefinition } from './models/buildDefinition';
import 'rxjs/add/operator/toPromise';
import { ConstantValues } from "./models/constantValues";
import { UpdateHistory } from "./entities/updateHistory";
var app = <Electron.App>electron.remote.app;
// https://angular.io/docs/ts/latest/api/
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
    lastUpdateHistory: UpdateHistory;
    percentage: number = 0;
    purDirectory: string;
    selectedBuild: BuildDefinition;
    selectedPurFile: string;
    tempFolder: string;



    constructor(
        private appContext: AppContext,
        private http: Http,
        private ngZone: NgZone) {

    }

    ngOnInit() {
        this.tempFolder = this.appContext.Provider.Enviroment.ensureTempFolder();
        this.appContext.Repository.Build.getAll()
            .subscribe(
            res => this.builds = res,
            err => this.error = "getBuildDefinitions:" + err
            );
    }


    onSelectedBuildChanged($event) {
        this.error = undefined;
        this.appContext.Repository.Build.getPurDirectory(this.selectedBuild)
            .subscribe(
            res => {
                this.purDirectory = res;
                // var testDestPath = "C:\\Temp\\PurDE";
                // this.purDirectory = testDestPath;
                var db = this.appContext.Provider.Enviroment.ensureDatabase(this.purDirectory);
                this.appContext.Repository.UpdateConnectionString(db);
                this.lastUpdateHistory = this.appContext.Repository.UpdateHistory.getLatest();

            },
            err => {
                this.error = "onSelectedBuildChanged:" + err;
                this.purDirectory = undefined;
            }
            )
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

        // // // var testSourcePath = "C:\\Temp\\rtimepur_20161124_IQ17_TST9.zip";
        var testSourcePath = "O:\\Kunden\\Zurich\\Software\\PuR\\DE-2017_07\\rtimepur_20170601_IIIQ17_TST10.zip";
        this.selectedPurFile = testSourcePath;

        if (!this.validate())
            return;

        this.unpack();

        

    }

    unpack(){
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
                try {
                    this.appContext.Util.File.copyMultiples(this.backUpFiles, this.tempFolder, this.purDirectory);
                    var updateHistory = new UpdateHistory();
                    updateHistory.Date = new Date();
                    updateHistory.FileName = path.basename(this.selectedPurFile);
                    updateHistory.User = os.userInfo().username;
                    this.appContext.Repository.UpdateHistory.save(updateHistory);
                    this.isDone = true;
                    this.isExtracting = false;
                    this.currentStatus = undefined;
                }
                catch (ex) {
                    this.error = "copyBackupFilesToPurFolder: " + ex;
                }
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

    validate(): boolean {
        this.currentStatus = "Check if PUR directory exists";
        if (!fs.existsSync(this.purDirectory)) {
            this.error = "update:PUR directory not found: " + this.purDirectory;
            return false;
        }

        this.currentStatus = "Check if new PUR zip file exists";
        if (!fs.existsSync(this.selectedPurFile)) {
            this.error = "update:PUR file not found: " + this.selectedPurFile;
            return false;
        }

        this.currentStatus = "Backup " + this.backUpFiles.join(",");
        try {
            this.appContext.Util.File.copyMultiples(this.backUpFiles, this.purDirectory, this.tempFolder);
        }
        catch (ex) {
            this.error = "copyBackupFilesToTempFolder: " + ex;
            return false;
        }

        this.currentStatus = "Delete old PUR files";
        try {
            fs.removeSync(this.purDirectory);
        }
        catch (ex) {
            console.log(ex);
        }

        this.currentStatus = "Check PUR directory if not exists";
        if (!fs.existsSync(this.purDirectory))
            fs.mkdirSync(this.purDirectory);

        return true;
    }

}
