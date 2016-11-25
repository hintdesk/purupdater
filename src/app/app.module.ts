import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import './rxjs-extensions';
import { AppComponent } from './app.component';

import { AppContext} from './infrastructure/appContext';
import { AppUtil} from './infrastructure/utils/appUtil';
import { FileUtil} from './infrastructure/utils/fileUtil';
import { PathUtil} from './infrastructure/utils/pathUtil';


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
    AppUtil,
    FileUtil,
    PathUtil
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
