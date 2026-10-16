import { ApiProperty } from "@nestjs/swagger";
import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateLabelDto {

    @ApiProperty({ type: String, description: 'Label\'s name.', example: 'frontend', required: false })
    @Field({ nullable: true })
    name?: string;

    @ApiProperty({ type: String, description: 'Label\'s color (hex).', example: '#3b82f6', required: false })
    @Field({ nullable: true })
    color?: string;

}
