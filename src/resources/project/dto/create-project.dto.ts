import { ApiProperty } from "@nestjs/swagger";

export class CreateProjectDto {

    @ApiProperty({type: String, description: 'Project\'s name.', example: 'Test'})
    name: string;

    @ApiProperty({type: String, description: 'Project\'s description.', example: 'This is a test project.'})
    description: string;

}
