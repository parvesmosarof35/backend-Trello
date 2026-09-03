import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      service: 'Mini Trello Backend API',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: ['/api/auth/register', '/api/auth/login'],
        users: ['/api/users/me', '/api/users/search'],
        boards: ['/api/boards', '/api/boards/:id'],
        members: ['/api/boards/:boardId/members'],
        columns: ['/api/boards/:boardId/columns'],
        tasks: ['/api/columns/:columnId/tasks', '/api/tasks/:id/move'],
      },
    };
  }
}
