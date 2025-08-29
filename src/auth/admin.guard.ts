import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // 1. ดึงข้อมูล request จาก context
    const request = context.switchToHttp().getRequest();
    
    // 2. ดึงข้อมูล user ที่ถูกแนบมาจาก JwtAuthGuard
    const user: User = request.user;

    // 3. ตรวจสอบว่ามีข้อมูล user และ role เป็น ADMIN หรือไม่
    if (user && user.role === UserRole.ADMIN) {
      return true; // ถ้าใช่, อนุญาตให้ผ่าน
    }

    // 4. ถ้าไม่ใช่, ปฏิเสธการเข้าถึงพร้อมแจ้ง Error
    throw new ForbiddenException('Admin access required');
  }
}