import './rxjs-extensions';
import { AppComponent } from './app.component';
import { AppContext } from './infrastructure/appContext';
import { AppRepository } from './infrastructure/repositories/appRepository';
import { BuildRepository } from './infrastructure/repositories/buildRepository';
import { AppUtil } from './infrastructure/utils/appUtil';
import { FileUtil } from './infrastructure/utils/fileUtil';
import { PathUtil } from './infrastructure/utils/pathUtil';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { EnvironmentProvider } from "./infrastructure/providers/environmentProvider";
import { AppProvider } from "./infrastructure/providers/appProvider";
import { UpdateHistoryRepository } from "./infrastructure/repositories/updateHistoryRepository";



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    AppContext,

    AppRepository,
    BuildRepository,
    UpdateHistoryRepository,


    AppUtil,
    FileUtil,
    PathUtil,

    AppProvider,
    EnvironmentProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
