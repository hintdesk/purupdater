import { Injectable } from '@angular/core';

import { AppUtil } from './utils/appUtil';

@Injectable()
export class AppContext {
    private appUtil: AppUtil;
    constructor(){
        this.appUtil = new AppUtil();
    }
    get Util(): AppUtil {
        return this.appUtil;
    }
} 