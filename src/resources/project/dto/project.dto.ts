import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "src/resources/user/dto/user.dto";
  
export class ProjectDto {

    @ApiProperty({type: String, description: 'Project\'s id.', example: '08c71152-c552-42e7-b094-f510ff44e9cb'})
    readonly id: string;

    @ApiProperty({type: String, description: 'Project\'s name.', example: 'Lorem ipsum'})
    readonly name: string;

    @ApiProperty({type: String, description: 'Project\'s description.', example: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.'})
    readonly description: string;

    @ApiProperty({type: Date, description: 'Project\'s creation date.', example: '1999-09-23T00:00:00.000Z'})
    readonly createdAt: Date;

    @ApiProperty({type: UserDto, description: 'Project\'s owner.', example: {id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8', firstname: 'Adrian', lastname: 'Matei', email: 'adrian.matei@fakemail.com'}})
    readonly owner: UserDto;

}
