import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserProjectRole } from "./user-project-role.entity";

@Entity()
export class Project {

    @PrimaryGeneratedColumn("uuid")
    readonly id: string;

    @Column({ length: 25 })
    name: string;

    @Column({ length: 500 })
    description: string;

    @Column({ type: 'timestamptz' })
    createdAt: Date;

    @OneToMany(() => UserProjectRole, (userProjectRole) => userProjectRole.project, { cascade: true })
    userProjectRole: UserProjectRole[];

}
