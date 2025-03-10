import { User } from "../../../src/resources/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ResetPassword {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.resetPassword)
    user: User;

    @Column()
    token: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    expiresAt: Date;
    
}