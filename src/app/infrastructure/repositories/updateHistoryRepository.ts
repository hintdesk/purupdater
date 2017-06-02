import { Injectable } from '@angular/core';
import { UpdateHistory } from "../../entities/updateHistory";
import { Database } from "../../entities/database";

@Injectable()
export class UpdateHistoryRepository {
    db: Database;
    connectionString: string;


    getLatest(): UpdateHistory {
        if (this.db.History.Items && this.db.History.Items.length > 0) {
            var sortByDateDesc = this.db.History.Items.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
            return sortByDateDesc[0];
        }
        else
            return undefined;
    }

    save(updateHistory: UpdateHistory) {
        this.db.History.Items.push(updateHistory);          
        fs.writeFileSync(
            this.connectionString,
            JSON.stringify(this.db));
    }

    updateConnectionString(connectionString: string) {
        this.connectionString = connectionString;
        var data = fs.readFileSync(this.connectionString);
        this.db = <Database>JSON.parse(data);
    }
}