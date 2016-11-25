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
  isDone: boolean = false;
  isExtracting: boolean = false;
  percentage: number = 0;
  purDirectory: string;
  selectedBuild: BuildDefinition;
  selectedPurFile: string;
  tempFolder = path.join(os.tmpdir(), "PurUpdater", "BackUp");


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
            this.error = "getPurDirectory: Multiple PUR folders was found";
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

    // var testDestPath = "\\\\build03.office.spsnetz.de\\ReleaseBuilds\\Rechenkerne\\Zurich\\_ForBuild\\Dev Release 2\\Temp";
    // this.purDirectory = testDestPath;
    //var testSourcePath = "C:\\Temp\\rtimepur_20161110_IQ17_TST6.zip";
    //this.selectedPurFile = testSourcePath;

    if (!fs.existsSync(this.purDirectory)) {
      this.error = "update:PUR directory not found: " + this.purDirectory;
      return;
    }

    if (!fs.existsSync(this.selectedPurFile)) {
      this.error = "update:PUR file not found: " + this.selectedPurFile;
      return;
    }

    this.appContext.Util.File.copyMultiples(this.backUpFiles, this.tempFolder, this.purDirectory, (err) => {
      if (err) {
        this.error = "copyBackupFilesToTempFolder: " + err;
        return;
      }
    });

    del.sync([this.purDirectory + "/*"], { force: true });


    var unzipper = new decompresszip(this.selectedPurFile);
    unzipper.on('error', function (err) {
      this.ngZone.run(() => {
        this.isExtracting = false;
        this.error = "decompresszip:error: " + err;
        console.log(err);
      });
    });

    unzipper.on('extract', (log) => {
      this.ngZone.run(() => {

        console.log("Update done...");
        this.isDone = true;
        this.isExtracting = false;
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
      });
    });

    unzipper.extract({ path: this.purDirectory, strip: 1 });

  }

}
