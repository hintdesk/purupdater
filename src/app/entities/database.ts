import { HistoryTable } from "./history.table";

export class Database {
    constructor(){
        this.History = new HistoryTable();
    }
    History:HistoryTable
}