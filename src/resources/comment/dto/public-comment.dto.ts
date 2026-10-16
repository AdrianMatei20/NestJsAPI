import { ApiProperty } from "@nestjs/swagger";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Comment } from "../entities/comment.entity";

@ObjectType()
export class CommentAuthorDto {

    @ApiProperty({ type: String, description: 'User\'s id.', example: 'af7c1fe6-d669-414e-b066-e9733f0de7a8' })
    @Field(() => ID)
    readonly id: string;

    @ApiProperty({ type: String, description: 'User\'s firstname.', example: 'Adrian' })
    @Field()
    readonly firstname: string;

    @ApiProperty({ type: String, description: 'User\'s lastname.', example: 'Matei' })
    @Field()
    readonly lastname: string;

    constructor(user: { id: string; firstname: string; lastname: string }) {
        this.id = user.id;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
    }

}

@ObjectType()
export class PublicCommentDto {

    @ApiProperty({ type: String, description: 'Comment\'s id.', example: '4f2dd5bb-ae60-41ca-9227-0fb3dacebcbe' })
    @Field(() => ID)
    readonly id: string;

    @ApiProperty({ type: String, description: 'Id of the issue this comment belongs to.', example: '0a7d6250-0be5-4036-8f23-33dc1762bed0' })
    @Field(() => ID)
    readonly issueId: string;

    @ApiProperty({ type: String, description: 'Comment\'s body.', example: 'I can reproduce this on iOS 17 Safari.' })
    @Field()
    readonly body: string;

    @ApiProperty({ type: CommentAuthorDto, description: 'User who wrote this comment.', nullable: true })
    @Field(() => CommentAuthorDto, { nullable: true })
    readonly author: CommentAuthorDto | null;

    @ApiProperty({ type: Date, description: 'Comment\'s creation date.' })
    @Field()
    readonly createdAt: Date;

    constructor(comment: Comment) {
        this.id = comment.id;
        this.issueId = comment.issue?.id;
        this.body = comment.body;
        this.author = comment.author ? new CommentAuthorDto(comment.author) : null;
        this.createdAt = comment.createdAt;
    }

}
