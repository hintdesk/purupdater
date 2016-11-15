export class BuildDefinition {
    build:Build[];
    id:number;
    name:string;
    url:string;
}

export class Build {
    enabled:boolean;
    inputs:Input;
}

export class Input {
    msbuildArgs:string;
}