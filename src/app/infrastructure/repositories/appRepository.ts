import { Injectable } from '@angular/core';
import { BuildRepository } from "./buildRepository";
import { UpdateHistoryRepository } from "./updateHistoryRepository";


@Injectable()
export class AppRepository {
    constructor(
        private buildRepository: BuildRepository,
        private updateHistoryRepository: UpdateHistoryRepository
    ) {

    }

    get Build(): BuildRepository {
        return this.buildRepository;
    }

    get UpdateHistory():UpdateHistoryRepository {
        return this.updateHistoryRepository;
    }

    UpdateConnectionString(connectionString:string){
        this.updateHistoryRepository.updateConnectionString(connectionString);
    }

}