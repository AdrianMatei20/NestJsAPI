import { User } from "src/resources/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Project {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 25 })
    name: string;

    @Column({ length: 500 })
    description: string;

    @Column({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.projects)
    owner: User;

}
