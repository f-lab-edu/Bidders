import {
    ApiAuthGuard,
    HttpExceptionFilter,
    SerializeInterceptor,
} from '@libs/common';
import {
    Body,
    Controller,
    Get,
    Post,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { AuctionItemService } from '../services/auction-item.service';
import { AuctionItemDto, CreateAuctionItemDto } from '@libs/dto';
import { User } from '@libs/common/decorators';
import { IUserPayload } from '@libs/util/jwt';

@ApiTags('Auction-item')
@Controller('auction')
@UseFilters(HttpExceptionFilter)
export class AuctionItemController {
    constructor(private readonly auctionItemService: AuctionItemService) {}

    @ApiOperation({ summary: '경매 상품 등록' })
    @ApiCreatedResponse({ description: '상품 등록 완료', type: AuctionItemDto })
    @ApiBearerAuth('bearerAuth')
    @UseGuards(ApiAuthGuard)
    @UseInterceptors(new SerializeInterceptor(AuctionItemDto))
    @Post('item')
    async createItem(
        @User() user: IUserPayload,
        @Body() createAuctionItemDto: CreateAuctionItemDto,
    ) {
        return this.auctionItemService.createItem(
            user.id,
            createAuctionItemDto,
        );
    }
}
