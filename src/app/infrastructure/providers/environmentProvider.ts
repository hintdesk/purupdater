import { Injectable } from '@angular/core';
import { ConstantValues } from "../../models/constantValues";
import { Database } from "../../entities/database";

// https://nodejs.org/docs/latest/api/fs.html

@Injectable()
export class EnvironmentProvider {
    private tempFolder: string = path.join(os.tmpdir(), "PurUpdater");
    database: string = undefined;

    ensureTempFolder(): string {
        if (!fs.existsSync(this.tempFolder))
            fs.mkdirSync(this.tempFolder);
        return this.tempFolder;
    }

    ensureDatabase(purDir: string): string {
        this.database = path.join(purDir, ConstantValues.DatabaseFileName);
        if (!fs.existsSync(this.database)) {
            var db = new Database();
            fs.writeFileSync(
                this.database,
                JSON.stringify(db));
        }
        return this.database;
    }
}