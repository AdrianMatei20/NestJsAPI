import { ApiProperty } from "@nestjs/swagger";
import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class CreateCommentDto {

    @ApiProperty({ type: String, description: 'Id of the issue this comment belongs to.', example: '0a7d6250-0be5-4036-8f23-33dc1762bed0' })
    @Field(() => ID)
    issueId: string;

    @ApiProperty({ type: String, description: 'Comment\'s body.', example: 'I can reproduce this on iOS 17 Safari.' })
    @Field()
    body: string;

}
