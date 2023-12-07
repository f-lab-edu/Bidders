import {
    Body,
    Controller,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { BidService } from '../services/bid.service';
import { BidDto, CreateBidDto, UpdateBidDto } from '@libs/dto';
import { ApiAuthGuard, SerializeInterceptor, User } from '@libs/common';
import { IUserPayload } from '@libs/util/jwt';

@ApiTags('Bid')
@Controller('bid')
export class BidController {
    constructor(private readonly bidService: BidService) {}

    @ApiOperation({ summary: '상품 입찰' })
    @ApiCreatedResponse({ description: '상품 입찰 완료', type: BidDto })
    @ApiBearerAuth('bearerAuth')
    @UseGuards(ApiAuthGuard)
    @UseInterceptors(new SerializeInterceptor(BidDto))
    @Post()
    async postBid(
        @User() user: IUserPayload,
        @Body() createBidDto: CreateBidDto,
    ) {
        return await this.bidService.placeBid(user.id, createBidDto);
    }

    @ApiOperation({ summary: '상품 입찰가 변경' })
    @ApiCreatedResponse({ description: '상품 입찰가 변경 완료', type: BidDto })
    @ApiBearerAuth('bearerAuth')
    @ApiParam({
        required: true,
        name: 'bidId',
        description: '입찰 id',
    })
    @UseGuards(ApiAuthGuard)
    @UseInterceptors(new SerializeInterceptor(BidDto))
    @Patch(':bidId')
    async patchBid(
        @Param('bidId', ParseIntPipe) bidId: number,
        @User() user: IUserPayload,
        @Body() updateBidDto: UpdateBidDto,
    ) {
        return await this.bidService.updateBid(bidId, user.id, updateBidDto);
    }
}
