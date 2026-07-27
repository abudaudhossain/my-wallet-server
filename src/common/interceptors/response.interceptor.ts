import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ApiResponse } from "../interfaces/api-response.interface";
import { Reflector } from "@nestjs/core";
import { map, Observable, tap } from "rxjs";
import { DEFAULT_RESPONSE_MESSAGE, RESPONSE_MESSAGE } from "../constants";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    constructor(private reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> | Promise<Observable<ApiResponse<T>>> {
        const request = context.switchToHttp().getRequest();
        console.log("request")
        const message = this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) || DEFAULT_RESPONSE_MESSAGE;

        return next.handle().pipe(
    
            map((data) => ({
                success: true,
                message,
                data,
                timestamp: new Date().toISOString(),
                path: request.url
            }))
        )
    }
}