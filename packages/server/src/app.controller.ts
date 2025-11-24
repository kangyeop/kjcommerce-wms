import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check API' })
  @ApiResponse({ status: 200, description: 'API 서버가 정상적으로 실행 중입니다.' })
  getHello(): { message: string } {
    return { message: 'KJ Commerce WMS API is running' };
  }
}