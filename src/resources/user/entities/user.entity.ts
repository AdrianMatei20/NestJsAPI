import { ResetPassword } from "src/auth/reset-password/reset-password.entity";
import { Project } from "src/resources/project/entities/project.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 25 })
    firstname: string;

    @Column({ length: 25 })
    lastname: string;

    @Column({ length: 100 })
    email: string;

    @Column({ length: 100 })
    password: string;

    @Column('boolean', {default: false})
    emailVerified: boolean;

    @OneToMany(() => ResetPassword, (resetPassword) => resetPassword.user)
    resetPassword: ResetPassword[];

    @OneToMany(() => Project, (project) => project.owner)
    projects: Project[];

}
