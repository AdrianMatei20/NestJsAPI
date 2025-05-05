import { Field, InputType } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";

@InputType()
export class CreateProjectDto {

    @ApiProperty({type: String, description: 'Project\'s name.', example: 'Test'})
    @Field()
    name: string;

    @ApiProperty({type: String, description: 'Project\'s description.', example: 'This is a test project.'})
    @Field()
    description: string;

}
