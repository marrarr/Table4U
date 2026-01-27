import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rezerwacja } from '../rezerwacja/rezerwacja.entity';
import { Restauracja } from '../restauracja/restauracja.entity';

@Entity('stolik')
export class Stolik {
  @PrimaryGeneratedColumn()
  stolik_id: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  numer_stolika: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  ilosc_miejsc: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  lokalizacja: string;


  @Column()
  pozycjaX_UI: number;

  @Column()
  pozycjaY_UI: number;

  @ManyToOne(() => Restauracja, (restauracja) => restauracja.stoliki, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restauracja_id' })
  restauracja: Restauracja;

  @Column()
  restauracja_id: number;
}
