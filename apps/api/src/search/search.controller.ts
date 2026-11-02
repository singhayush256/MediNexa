import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async globalSearch(
    @Query('q') query: string,
    @Query('category') category: string | undefined,
    @Request() req: any,
  ) {
    return this.searchService.globalSearch(query, category, req.user);
  }
}
