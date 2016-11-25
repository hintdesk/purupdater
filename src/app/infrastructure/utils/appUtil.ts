import { Injectable } from '@angular/core';

import { FileUtil } from './fileUtil';
import { PathUtil } from './pathUtil';

@Injectable()
export class AppUtil {
    private file:FileUtil;
    private path:PathUtil;

    constructor()
    {
        this.file = new FileUtil();
        this.path = new PathUtil();
    }
    
    get File():FileUtil{
        return this.file;
    }

    
    get Path():PathUtil{
        return this.path;
    }
}