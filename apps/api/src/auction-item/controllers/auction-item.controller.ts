import { ApiAuthGuard, SerializeInterceptor, User } from '@libs/common';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { AuctionItemService } from '../services/auction-item.service';
import {
    AuctionItemBidsDto,
    AuctionItemDto,
    AuctionItemListDto,
    CreateAuctionItemDto,
    UpdateAuctionItemDto,
} from '@libs/dto';
import { IUserPayload } from '@libs/util/jwt';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Auction-item')
@Controller('auction')
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

    @ApiOperation({ summary: '경매 상품 리스트' })
    @ApiOkResponse({ description: '상품 리스트', type: AuctionItemListDto })
    @UseInterceptors(
        CacheInterceptor,
        new SerializeInterceptor(AuctionItemListDto),
    )
    @CacheTTL(300) // ttl: seconds
    @Get('items')
    async getItems() {
        return this.auctionItemService.getItems();
    }

    @ApiOperation({ summary: '상품 조회' })
    @ApiOkResponse({
        description: '입찰 내역과 함께 상품 조회',
        type: AuctionItemBidsDto,
    })
    @ApiParam({
        required: true,
        name: 'itemId',
        description: '상품 id',
    })
    @UseInterceptors(
        CacheInterceptor,
        new SerializeInterceptor(AuctionItemBidsDto),
    )
    @CacheTTL(300)
    @Get('item/:itemId')
    async itemWithBids(@Param('itemId', ParseIntPipe) itemId: number) {
        return await this.auctionItemService.getItemWithBids(itemId);
    }

    @ApiOperation({ summary: '내가 등록한 경매 상품 수정' })
    @ApiOkResponse({ description: '상품 정보 수정 성공', type: AuctionItemDto })
    @ApiBearerAuth('bearerAuth')
    @ApiParam({
        required: true,
        name: 'itemId',
        description: '상품 id',
    })
    @UseGuards(ApiAuthGuard)
    @UseInterceptors(new SerializeInterceptor(AuctionItemDto))
    @Put('item/:itemId')
    async updateMyItem(
        @Param('itemId', ParseIntPipe) itemId: number,
        @User() user: IUserPayload,
        @Body() updateAuctionItemDto: UpdateAuctionItemDto,
    ) {
        return await this.auctionItemService.updateItem(
            itemId,
            user.id,
            updateAuctionItemDto,
        );
    }

    @ApiOperation({ summary: '경매 상품 상태 변경' })
    @ApiOkResponse({ description: '상태 변경 성공', type: AuctionItemDto })
    @ApiParam({
        required: true,
        name: 'itemId',
        description: '상품 id',
    })
    @UseInterceptors(new SerializeInterceptor(AuctionItemDto))
    @Patch('item/:itemId/status')
    async patchStatus(@Param('itemId', ParseIntPipe) itemId: number) {
        return await this.auctionItemService.updateStatus(itemId);
    }

    @ApiOperation({ summary: '경매 상품 찜 수 변경' })
    @ApiOkResponse({ description: '찜 수 변경 성공', type: AuctionItemDto })
    @ApiBearerAuth('bearerAuth')
    @ApiParam({
        required: true,
        name: 'itemId',
        description: '상품 id',
    })
    @UseGuards(ApiAuthGuard)
    @UseInterceptors(new SerializeInterceptor(AuctionItemDto))
    @Patch('item/:itemId/likes')
    async patchLikes(@Param('itemId', ParseIntPipe) itemId: number) {
        return await this.auctionItemService.updateLikes(itemId);
    }

    @ApiOperation({ summary: '경매 상품 삭제' })
    @ApiOkResponse({ description: '상품 삭제 성공시 return true' })
    @ApiBearerAuth('bearerAuth')
    @ApiParam({
        required: true,
        name: 'itemId',
        description: '상품 id',
    })
    @UseGuards(ApiAuthGuard)
    @Delete('item/:itemId')
    async deleteItem(
        @Param('itemId', ParseIntPipe) itemId: number,
        @User() user: IUserPayload,
    ) {
        return await this.auctionItemService.deleteItem(itemId, user.id);
    }
}
