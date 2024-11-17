import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
    
    @ApiProperty({type: String, description: 'Project\'s name.', example: 'Test'})
    name: string;

    @ApiProperty({type: String, description: 'Project\'s description.', example: 'This is a test project.'})
    description: string;

}
