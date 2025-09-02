import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tourisms')
export class Tourism {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address: string;

  @Column({ name: 'province', type: 'varchar', length: 255 })
  province: string;

  @Column({ name: 'region', type: 'varchar', length: 255 })
  region: string;

  @CreateDateColumn({ name: 'created_at' })
  createAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updateAt: Date;
}
