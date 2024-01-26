import {
    Body,
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { BidService } from '../services/bid.service';
import { BidDto, CreateBidDto } from '@libs/dto';
import { ApiAuthGuard, SerializeInterceptor, User } from '@libs/common';
import { IUserPayload } from '@libs/util/jwt';

@ApiTags('Auction-bid')
@Controller('auction')
export class BidController {
    constructor(private readonly bidService: BidService) {}

    @ApiOperation({ summary: '상품 입찰' })
    @ApiCreatedResponse({ description: '상품 입찰 완료', type: BidDto })
    @ApiBearerAuth('bearerAuth')
    @UseGuards(ApiAuthGuard)
    @UseInterceptors(new SerializeInterceptor(BidDto))
    @Post('bid')
    async postBid(
        @User() user: IUserPayload,
        @Body() createBidDto: CreateBidDto,
    ) {
        return await this.bidService.placeBid(user.id, createBidDto);
    }
}
