import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/resources/user/entities/user.entity";
import { Project } from "./project.entity";
import { ProjectRole } from "../enums/project-role";

@Entity()
export class UserProjectRole {

    @PrimaryGeneratedColumn("uuid")
    readonly id: string;

    @ManyToOne(() => User, (user) => user.userProjectRole, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Project, (project) => project.userProjectRole, { onDelete: 'CASCADE' })
    project: Project;

    @Column({ type: 'enum', enum: ProjectRole, default: ProjectRole.MEMBER })
    projectRole: ProjectRole;

    @Column({ type: 'timestamptz' })
    createdAt: Date;

}
