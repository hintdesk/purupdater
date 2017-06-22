import { Injectable } from '@angular/core';
import { Build, BuildDefinition } from '../../models/buildDefinition';
import { Http } from '@angular/http';
import { Observable } from "rxjs/Observable";

@Injectable()
export class BuildRepository {
    builds: BuildDefinition[] = [];

    constructor(private http: Http) {

    }

    getAll(): Observable<BuildDefinition[]> {
        return this.http.get("https://tfs.office.spsnetz.de/tfs/DefaultCollection/Zurich-Weblife20/_apis/build/definitions")
            .map(res => <BuildDefinition[]>res.json().value);
    }

    getPurDirectory(buildDefinition: BuildDefinition): Observable<string> {
        return this.http.get(buildDefinition.url)
            .map(res => {
                var result = undefined;
                var data = res.json();
                if (data) {
                    var build = data.build as Build[];
                    for (let item of build) {
                        result = this.getPurDirectoryByBuild(item)
                        if (result)
                            break;
                    }
                }
                return result;
            });
    }

    getPurDirectoryByBuild(build: Build): string {
        var result: string;
        if (build.enabled && build.inputs.msbuildArgs) {
            var args = build.inputs.msbuildArgs.split("/");
            for (let arg of args) {
                var argKeyValue = arg.split("=");
                if (argKeyValue.length === 2 && argKeyValue[0] === "p:RKRootFolder") {
                    var foundPath = argKeyValue[1].replace(new RegExp("\\\"", "g"), "");
                    var files = fs.readdirSync(foundPath);
                    var folders = [];
                    for (var index = 0; index < files.length; index++) {
                        var checkPath = path.join(foundPath, files[index])
                        if (fs.lstatSync(checkPath).isDirectory()) {
                            folders.push(checkPath);
                        }
                    }


                    if (folders.length == 1)
                        result = folders[0];
                    else
                        throw new Error("getPurDirectoryByBuild: Multiple PUR folders were found");
                    break;
                }
            }
        }
        return result;
    }
}