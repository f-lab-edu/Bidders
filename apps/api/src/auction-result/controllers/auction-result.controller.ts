import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuctionResultService } from '../services/auction-result.service';
import { SerializeInterceptor } from '@libs/common';
import { AuctionResultDto, CreateAuctionResultDto } from '@libs/dto';

@ApiTags('Auction-result')
@Controller('auction')
export class AuctionResultController {
    constructor(private readonly auctionResultService: AuctionResultService) {}

    @ApiOperation({ summary: '경매 결과 등록' })
    @ApiCreatedResponse({
        description: '결과 등록 완료',
        type: AuctionResultDto,
    })
    @UseInterceptors(new SerializeInterceptor(AuctionResultDto))
    @Post('result')
    async createResult(@Body() createAuctionResultDto: CreateAuctionResultDto) {
        return await this.auctionResultService.createAuctionResult(
            createAuctionResultDto,
        );
    }
}
