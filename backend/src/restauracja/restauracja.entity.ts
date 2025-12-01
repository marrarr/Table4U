import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { Rezerwacja } from '../rezerwacja/rezerwacja.entity';
import { Uzytkownik } from 'src/uzytkownik/uzytkownik.entity';
import { restauracjaObraz } from './obrazy/restauracjaObraz.entity';

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
    type: 'mediumblob',
  })
  zdjecie: Buffer;

  @OneToMany(() => Rezerwacja, (rezerwacja) => rezerwacja.restauracja)
  rezerwacje: Rezerwacja[];

  @ManyToMany(() => Uzytkownik, uzytkownik => uzytkownik.restauracje, { cascade: true })
  wlasciciele: Uzytkownik[];

  @OneToMany(() => restauracjaObraz, obraz => obraz.restauracja, {
    lazy: true
  })
  obrazy: restauracjaObraz[];
}
