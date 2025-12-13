// backend/src/restauracja/restauracja.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RestauracjaService } from './restauracja.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restauracja } from './restauracja.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * Testy jednostkowe dla RestauracjaService
 * Testują funkcjonalności zarządzania restauracjami (CRUD + operacje z obrazami)
 */
describe('RestauracjaService', () => {
  let service: RestauracjaService;
  let repository: Repository<Restauracja>;

  // Mock (atrapa) repozytorium TypeORM - symuluje operacje na bazie danych
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  // Mock Query Builder dla zaawansowanych zapytań
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  // Przed każdym testem tworzymy świeżą instancję modułu testowego
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestauracjaService,
        {
          provide: getRepositoryToken(Restauracja), // Token do wstrzykiwania repozytorium
          useValue: mockRepository, // Używamy mocka zamiast prawdziwego repozytorium
        },
      ],
    }).compile();

    service = module.get<RestauracjaService>(RestauracjaService);
    repository = module.get<Repository<Restauracja>>(getRepositoryToken(Restauracja));

    // Konfiguracja Query Builder
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  // Po każdym teście czyścimy wszystkie mocki
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Sprawdza pobieranie wszystkich restauracji
   * Testuje scenariusz: administrator pobiera listę wszystkich restauracji
   * Oczekiwany rezultat: zwrócona lista restauracji z bazy danych
   */
  it('should return all restauracje', async () => {
    // Przygotowanie danych testowych - lista mockowych restauracji
    const mockRestauracje = [
      {
        restauracja_id: 1,
        nazwa: 'Restauracja Test 1',
        adres: 'ul. Testowa 1',
        telefon: '123456789',
        email: 'test1@restaurant.com',
        opis: 'Testowy opis 1',
      },
      {
        restauracja_id: 2,
        nazwa: 'Restauracja Test 2',
        adres: 'ul. Testowa 2',
        telefon: '987654321',
        email: 'test2@restaurant.com',
        opis: 'Testowy opis 2',
      },
    ];

    // Konfiguracja mocka - co ma zwrócić repozytorium
    mockRepository.find.mockResolvedValue(mockRestauracje);

    // Wywołanie testowanej metody
    const result = await service.findAll();

    // Asercje - sprawdzamy czy:
    // 1. Repozytorium zostało wywołane
    expect(mockRepository.find).toHaveBeenCalled();
    // 2. Zwrócona lista jest zgodna z oczekiwaniami
    expect(result).toEqual(mockRestauracje);
    // 3. Lista zawiera odpowiednią liczbę elementów
    expect(result).toHaveLength(2);
  });

  /**
   * Test 2: Sprawdza pobieranie pojedynczej restauracji z obrazami
   * Testuje scenariusz: pobieranie szczegółów restauracji wraz z galerii zdjęć
   * Oczekiwany rezultat: zwrócona restauracja z załadowanymi obrazami
   */
  it('should return a single restauracja with images', async () => {
    // Przygotowanie danych testowych - restauracja z obrazami
    const mockRestauracja = {
      restauracja_id: 1,
      nazwa: 'Restauracja Test',
      adres: 'ul. Testowa 1',
      telefon: '123456789',
      email: 'test@restaurant.com',
      opis: 'Testowy opis',
      obrazy: [
        {
          obraz_id: 1,
          url: 'https://example.com/image1.jpg',
        },
        {
          obraz_id: 2,
          url: 'https://example.com/image2.jpg',
        },
      ],
    };

    // Konfiguracja mocka
    mockRepository.findOne.mockResolvedValue(mockRestauracja);

    // Wywołanie testowanej metody
    const result = await service.findOneWithImages(1);

    // Asercje - sprawdzamy czy:
    // 1. Zapytanie zawiera właściwe warunki i relacje
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { restauracja_id: 1 },
      relations: ['obrazy'],
    });
    // 2. Zwrócona restauracja zawiera wszystkie dane
    expect(result).toEqual(mockRestauracja);
    // 3. Obrazy zostały załadowane (relacja)
    expect(result.obrazy).toBeDefined();
    expect(result.obrazy).toHaveLength(2);
  });
});