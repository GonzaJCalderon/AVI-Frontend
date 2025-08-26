import { Strategy } from "passport-jwt";
import { DatabaseService } from "../../database/database.service";
declare const RefreshTokenStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    validate(req: any, payload: any): Promise<{
        id: any;
        email: any;
        rol: any;
        nombre: any;
    }>;
}
export {};
