import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Build, BuildDefinition } from './models/buildDefinition';

import 'rxjs/add/operator/toPromise';

declare var fs:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works!';
  builds: BuildDefinition[] = [];
  purDirectory: string;
  selectedBuild: BuildDefinition;

  constructor(private http: Http) {

  }

  getPurDirectory(build: Build): string {
    var result:string;
    if (build.enabled && build.inputs.msbuildArgs) {
      var args = build.inputs.msbuildArgs.split(" ");
      for (let arg of args) {
        var argKeyValue = arg.split("=");
        if (argKeyValue.length === 2 && argKeyValue[0] === "/p:RKRootFolder") {
          result = argKeyValue[1].replace(new RegExp("\\\"", "g"), "");
          break;
        }
      }
    }
    return result;
  }

  ngOnInit() {
    this.http.get("https://tfs.office.spsnetz.de/tfs/DefaultCollection/Zurich-Weblife20/_apis/build/definitions")
      .toPromise()
      .then(reponse => {
        var data = reponse.json();
        if (data) {
          this.builds = data.value as BuildDefinition[];
        }

      })
      .catch(error => {
        console.log(error);
      })
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
      .catch(error => {
        console.log(error);
      })
  }

  onSelectedFileChange($event){
    var files = $event.srcElement.files;
    console.log(files);
  }

  update(){
    // var fs = require('fs');
    // console.log(fs);
    
    fs.readFile("C:\\Temp\\hihi.txt",'utf-8',function(err,data){
      if(err){
              alert("An error ocurred reading the file :" + err.message);
              return;
          }
          // Change how to handle the file content
          console.log("The file content is : " + data);
    });
  }
}
