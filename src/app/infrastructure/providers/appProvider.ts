import { Injectable } from '@angular/core';
import { EnvironmentProvider } from "./environmentProvider";


@Injectable()
export class AppProvider {
    constructor (private folderProvider:EnvironmentProvider){

    }

    get Enviroment():EnvironmentProvider{
        return this.folderProvider;
    }
}