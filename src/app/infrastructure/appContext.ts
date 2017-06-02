import { AppProvider } from './providers/appProvider';
import { Injectable } from '@angular/core';
import { AppUtil } from './utils/appUtil';
import { AppRepository } from "./repositories/appRepository";

@Injectable()
export class AppContext {
    constructor(
        private appProvider: AppProvider,
        private appRepository: AppRepository,
        private appUtil: AppUtil
    ) {

    }
    get Provider(): AppProvider {
        return this.appProvider;
    }
    
    get Repository(): AppRepository {
        return this.appRepository;
    }
    get Util(): AppUtil {
        return this.appUtil;
    }
} 