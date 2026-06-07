import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, user } = req;

    // Only log state-changing requests (POST, PATCH, PUT, DELETE)
    const isStateChanging = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap(async () => {
        if (isStateChanging && user) {
          try {
            await this.dataSource.query(
              `INSERT INTO system_logs (user_id, action_type, target_entity, payload)
               VALUES ($1, $2, $3, $4)`,
              [user.sub, method, url, JSON.stringify(body)]
            );
          } catch (error) {
            console.error('AuditLogInterceptor failed to save log:', error);
          }
        }
      })
    );
  }
}
