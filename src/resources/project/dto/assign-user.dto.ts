import { User } from "src/resources/user/entities/user.entity";
import { Project } from "../../project/entities/project.entity";
import { ProjectRole } from "../enums/project-role";

export class AssignUserDto {
    
    user: User;

    project: Project;

    projectRole: ProjectRole;

    createdAt: Date;

}
