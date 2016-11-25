import { Injectable } from '@angular/core';

@Injectable()
export class PathUtil {
   combine(...paths:string[]):string {
        if (paths.length==0)
            return undefined;
        if (paths.length==1)
            return paths[0];

        var result = paths[0];
        if (!result.endsWith("\\"))
            result += "\\";

        for (var index=1;index<paths.length;index++){
            var path = paths[index];
             if (path[index].startsWith("\\"))
                path = path.substring(1,path.length-1);
            result += path;
            if (!result.endsWith("\\"))
            result += "\\";
        }
        return result;        
    }

}