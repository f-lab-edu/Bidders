import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAuctionResultDto {
    @ApiProperty({ required: true, description: '상품 id', example: 10 })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    item_id: number;

    @ApiProperty({
        required: true,
        description: '사용자 id',
        example: 'qwer-asdf-zxcv',
    })
    @IsString()
    @IsNotEmpty()
    user_id: string;
}
