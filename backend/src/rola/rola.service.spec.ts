// backend/src/rola/rola.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './rola.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rola } from './rola.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * Testy jednostkowe dla RoleService
 * Testują funkcjonalności zarządzania rolami użytkowników w systemie
 */
describe('RoleService', () => {
  let service: RoleService;
  let repository: Repository<Rola>;

  // Mock (atrapa) repozytorium TypeORM - symuluje operacje na bazie danych
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  // Przed każdym testem tworzymy świeżą instancję modułu testowego
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Rola), // Token do wstrzykiwania repozytorium
          useValue: mockRepository, // Używamy mocka zamiast prawdziwego repozytorium
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    repository = module.get<Repository<Rola>>(getRepositoryToken(Rola));
  });

  // Po każdym teście czyścimy wszystkie mocki
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Sprawdza pobieranie wszystkich ról
   * Testuje scenariusz: administrator pobiera listę wszystkich ról w systemie
   * Oczekiwany rezultat: zwrócona pełna lista ról (np. admin, user, owner)
   */
  it('should return all role', async () => {
    // Przygotowanie danych testowych - lista dostępnych ról w systemie
    const mockRole = [
      { rola_id: 1, nazwa: 'user' },
      { rola_id: 2, nazwa: 'owner' },
      { rola_id: 3, nazwa: 'admin' },
    ];

    // Konfiguracja mocka - co ma zwrócić repozytorium
    mockRepository.find.mockResolvedValue(mockRole);

    // Wywołanie testowanej metody
    const result = await service.findAll();

    // Asercje - sprawdzamy czy:
    // 1. Repozytorium zostało wywołane
    expect(mockRepository.find).toHaveBeenCalled();
    // 2. Zwrócona lista jest zgodna z oczekiwaniami
    expect(result).toEqual(mockRole);
    // 3. Lista zawiera wszystkie role (3 elementy)
    expect(result).toHaveLength(3);
  });

  /**
   * Test 2: Sprawdza pobieranie pojedynczej roli po ID
   * Testuje scenariusz: system sprawdza uprawnienia użytkownika na podstawie ID roli
   * Oczekiwany rezultat: zwrócona konkretna rola z danymi
   */
  it('should return a single rola by id', async () => {
    // Przygotowanie danych testowych - rola administratora
    const mockRola = { rola_id: 1, nazwa: 'admin' };

    // Konfiguracja mocka
    mockRepository.findOne.mockResolvedValue(mockRola);

    // Wywołanie testowanej metody
    const result = await service.findOne(1);

    // Asercje - sprawdzamy czy:
    // 1. Zapytanie zawiera właściwy warunek (szukanie po ID)
    expect(mockRepository.findOne).toHaveBeenCalledWith({ 
      where: { rola_id: 1 } 
    });
    // 2. Zwrócona rola ma poprawne dane
    expect(result).toEqual(mockRola);
    expect(result.nazwa).toBe('admin');
  });
});