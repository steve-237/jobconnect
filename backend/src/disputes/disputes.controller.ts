import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import {
  CreateDisputeDto,
  RespondDisputeDto,
  ArbitrateDisputeDto,
} from './dto/dispute.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  create(@Body() createDto: CreateDisputeDto, @Request() req: any) {
    return this.disputesService.create(createDto, req.user.userId);
  }

  @Get('my-disputes')
  findAllForUser(@Request() req: any) {
    return this.disputesService.findAllForUser(req.user.userId, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.disputesService.findOne(id, req.user.userId, req.user.role);
  }

  @Post(':id/respond')
  respond(
    @Param('id') id: string,
    @Body() respondDto: RespondDisputeDto,
    @Request() req: any,
  ) {
    return this.disputesService.respond(id, respondDto, req.user.userId);
  }

  @Patch(':id/arbitrate')
  arbitrate(
    @Param('id') id: string,
    @Body() arbitrateDto: ArbitrateDisputeDto,
    @Request() req: any,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        "Seul l'administrateur peut arbitrer un dossier de litige",
      );
    }
    return this.disputesService.arbitrate(id, arbitrateDto);
  }
}
