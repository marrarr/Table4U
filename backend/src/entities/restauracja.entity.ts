import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rezerwacja } from './rezerwacja.entity';

@Entity('restauracja')
export class Restauracja {
  @PrimaryGeneratedColumn()
  restauracja_id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  nazwa: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  adres: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  nr_kontaktowy: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column({
    nullable: true,
    type: 'bytea',
  })
  zdjecie: Blob;

  @OneToMany(() => Rezerwacja, (rezerwacja) => rezerwacja.restauracja)
  rezerwacje: Rezerwacja[];
}
