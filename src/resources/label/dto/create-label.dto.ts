import { ApiProperty } from "@nestjs/swagger";
import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class CreateLabelDto {

    @ApiProperty({ type: String, description: 'Id of the project this label belongs to.', example: '08c71152-c552-42e7-b094-f510ff44e9cb' })
    @Field(() => ID)
    projectId: string;

    @ApiProperty({ type: String, description: 'Label\'s name.', example: 'frontend' })
    @Field()
    name: string;

    @ApiProperty({ type: String, description: 'Label\'s color (hex).', example: '#3b82f6' })
    @Field()
    color: string;

}
