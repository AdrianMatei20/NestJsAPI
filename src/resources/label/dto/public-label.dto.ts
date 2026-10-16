import { ApiProperty } from "@nestjs/swagger";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Label } from "../entities/label.entity";

@ObjectType()
export class PublicLabelDto {

    @ApiProperty({ type: String, description: 'Label\'s id.', example: '3b0872df-d47a-48f4-964e-b6a099964ee7' })
    @Field(() => ID)
    readonly id: string;

    @ApiProperty({ type: String, description: 'Id of the project this label belongs to.', example: '08c71152-c552-42e7-b094-f510ff44e9cb' })
    @Field(() => ID)
    readonly projectId: string;

    @ApiProperty({ type: String, description: 'Label\'s name.', example: 'frontend' })
    @Field()
    readonly name: string;

    @ApiProperty({ type: String, description: 'Label\'s color (hex).', example: '#3b82f6' })
    @Field()
    readonly color: string;

    @ApiProperty({ type: Date, description: 'Label\'s creation date.' })
    @Field()
    readonly createdAt: Date;

    constructor(label: Label) {
        this.id = label.id;
        this.projectId = label.project?.id;
        this.name = label.name;
        this.color = label.color;
        this.createdAt = label.createdAt;
    }

}
