import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Rola } from '../rola/rola.entity';
import { Rezerwacja } from '../rezerwacja/rezerwacja.entity';
import { Restauracja } from '../restauracja/restauracja.entity';

@Entity('uzytkownik')
export class Uzytkownik {
  @PrimaryGeneratedColumn()
  uzytkownik_id: number;

  @Column({ type: 'varchar', length: 100 })
  imie: string;

  @Column({ type: 'varchar', length: 100 })
  nazwisko: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  telefon: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  login: string;

  @Column({ type: 'varchar', length: 255 })
  haslo: string;

  @Column({ name: 'rola_id' })
  rola_id: number;

  @Column({type: 'boolean'})
  confirmed: boolean;

  @ManyToOne(() => Rola, rola => rola.uzytkownik)
  @JoinColumn({ name: 'rola_id' })
  rola: Rola;

  @OneToMany(() => Rezerwacja, rezerwacja => rezerwacja.uzytkownik)
  rezerwacje: Rezerwacja[];

  @ManyToMany(() => Restauracja, restauracja => restauracja.wlasciciele)
  @JoinTable({
    name: 'uzytkownik_restauracja',
    joinColumn: { name: 'uzytkownik_id', referencedColumnName: 'uzytkownik_id' },
    inverseJoinColumn: { name: 'restauracja_id', referencedColumnName: 'restauracja_id' },
  })
  restauracje: Restauracja[];
}
