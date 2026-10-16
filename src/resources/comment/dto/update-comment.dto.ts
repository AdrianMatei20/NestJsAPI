import { ApiProperty } from "@nestjs/swagger";
import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateCommentDto {

    @ApiProperty({ type: String, description: 'Comment\'s body.', example: 'I can reproduce this on iOS 17 Safari.' })
    @Field()
    body: string;

}
