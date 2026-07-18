import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import { ReserveConcertDto } from '../common/dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';

@Controller('reservations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @Roles(UserRole.USER)
  reserve(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReserveConcertDto,
  ) {
    return this.reservationsService.reserve(user, dto.concertId);
  }

  @Delete(':id')
  @Roles(UserRole.USER)
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reservationsService.cancel(user, id);
  }

  @Get('my')
  @Roles(UserRole.USER)
  myHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.findMyHistory(user);
  }

  @Get('audit')
  @Roles(UserRole.ADMIN)
  auditTrail() {
    return this.reservationsService.findAllForAudit();
  }
}
