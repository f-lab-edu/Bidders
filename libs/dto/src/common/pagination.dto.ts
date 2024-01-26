import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
    @ApiPropertyOptional({
        required: false,
        name: 'pageSize',
        type: Number,
        description: '한페이지에 보여줄 개수 default: 10',
    })
    @IsPositive()
    @IsInt()
    @IsOptional()
    readonly pageSize: number = 10;

    @ApiPropertyOptional({
        required: false,
        name: 'page',
        type: Number,
        description: '페이지 번호 default: 1',
    })
    @IsPositive()
    @IsInt()
    @IsOptional()
    readonly page: number = 1;

    @IsPositive()
    @IsInt()
    @IsOptional()
    get take() {
        return this.pageSize;
    }

    @IsInt()
    @IsOptional()
    get skip() {
        return ((this.page ?? 1) - 1) * this.pageSize;
    }

    get defaultPageSize() {
        return 10;
    }

    get defaultPage() {
        return 1;
    }
}
