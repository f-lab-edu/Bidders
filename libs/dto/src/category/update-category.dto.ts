import { PickType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PickType(CreateCategoryDto, [
    'c_code',
    'c_name',
] as const) {}
