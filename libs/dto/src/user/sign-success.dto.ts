import { ApiProperty } from '@nestjs/swagger';

export class SignSuccessDto {
    @ApiProperty({ description: 'atk', example: 'asdfasdf.qewiqrfhi.sdfdisfn' })
    atk: string;

    @ApiProperty({
        description: 'rtk',
        example: 'vdvsvse.dfefewwas.dfdfefeww',
    })
    rtk: string;
}
