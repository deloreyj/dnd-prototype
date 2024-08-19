import { jest, describe, expect, test, beforeEach } from '@jest/globals';

// Mock the cloudflare:workers module as a virtual module
jest.mock('cloudflare:workers', () => {
  return {
    DurableObject: class {},
    WorkerEntrypoint: class {},
  };
}, { virtual: true });

import { Character } from './index'; // Adjust the path
import DNDPartyWorker from './index';
import { Env } from './index';
import { Ability, AbilityIndex, SkillIndex, SkillNameToStatNameMap, SkillProficiencySet, StatIndex, StatName } from './charactertypes';

describe('Character Class', () => {
  let character: Character;

  beforeEach(() => {
    const ctx = {} as DurableObjectState; // Mock DurableObjectState
    const env: Env = {
      CHARACTERS: {
        idFromName: jest.fn(() => ({
          toString: () => 'mock-id',
          equals: jest.fn(() => true),
        })),
        get: jest.fn(() => ({
          __DURABLE_OBJECT_BRAND: undefined as never, // This is the branding property
          fetch: jest.fn(() => Promise.resolve(new Response('Character Response'))),
          initialize: jest.fn(),
          name: Promise.resolve('Mock Character'),
          alignment: Promise.resolve('Lawful Good'),
          stats: {
            str: { raw: 10, bonus: 0 },
            dex: { raw: 12, bonus: 1 },
            con: { raw: 14, bonus: 2 },
            int: { raw: 8, bonus: -1 },
            wis: { raw: 10, bonus: 0 },
            cha: { raw: 15, bonus: 2 },
          } as StatIndex,
          backStory: Promise.resolve('Test backstory'),
          abilities: Promise.resolve({}),
          hitPoints: Promise.resolve(50),
          movementSpeed: Promise.resolve(30),
          takeDamage: jest.fn(),
          heal: jest.fn(),
          move: jest.fn(),
          addAbility: jest.fn(),
          removeAbility: jest.fn(),
          updateStats: jest.fn(),
        }) as unknown as DurableObjectStub<Character>),
        newUniqueId: jest.fn(() => ({
          toString: () => 'mock-new-unique-id',
          equals: jest.fn(() => true),
        })),
        idFromString: jest.fn(() => ({
          toString: () => 'mock-id-from-string',
          equals: jest.fn(() => true),
        })),
        jurisdiction: jest.fn(() => ({
          idFromName: jest.fn(() => ({
            toString: () => 'mock-jurisdiction-id',
            equals: jest.fn(() => true),
          })),
          get: jest.fn(),
        }) as unknown as DurableObjectNamespace<Character>),
      },
    };

    character = new Character(ctx, env);
  });

  test('should initialize with provided values', () => {
    character.initialize('Test Character', 'Neutral Good', {}, 'Test backstory', {}, 50, 30);
    expect(character.name).toBe('Test Character');
    expect(character.alignment).toBe('Neutral Good');
    expect(character.backStory).toBe('Test backstory');
    expect(character.hitPoints).toBe(50);
    expect(character.movementSpeed).toBe(30);
  });

  test('should take damage correctly', () => {
    character.hitPoints = 50;
    character.takeDamage(10);
    expect(character.hitPoints).toBe(40);
  });

  test('should heal correctly', () => {
    character.hitPoints = 40;
    character.heal(10);
    expect(character.hitPoints).toBe(50);
  });

  test('should add and remove abilities', () => {
    const ability = { name: 'Fireball', description: 'Throws a fireball', usesLeft: 3, effect: 'Burns enemy' };
    character.addAbility(ability);
    expect(character.abilities['Fireball']).toEqual(ability);
    
    character.removeAbility('Fireball');
    expect(character.abilities['Fireball']).toBeUndefined();
  });

  test('should move correctly and log the movement', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    character.movementSpeed = 30;
    character.name = 'Test Character';
    character.move(10);
    expect(consoleSpy).toHaveBeenCalledWith('Test Character moves 10 units at a speed of 30.');
  });
});

describe('DNDPartyWorker Class', () => {
  let worker: DNDPartyWorker;
  let mockEnv: Env;
  let mockCtx: ExecutionContext;

  beforeEach(() => {
    // Mock ExecutionContext
    mockCtx = {
      passThroughOnException: jest.fn(),
      waitUntil: jest.fn(),
    } as unknown as ExecutionContext;

    // Mock Env with CHARACTERS
    mockEnv = {
      CHARACTERS: {
        idFromName: jest.fn(() => ({
          toString: () => 'mock-id',
          equals: jest.fn(() => true),
        })),
        get: jest.fn(() => ({
          __DURABLE_OBJECT_BRAND: undefined as never, // This is the branding property
          fetch: jest.fn(() => Promise.resolve(new Response('Character Response'))),
          initialize: jest.fn(),
          name: 'Mock Character',
          alignment: Promise.resolve('Lawful Good'),
          stats: {
            str: { raw: 10, bonus: 0 },
            dex: { raw: 12, bonus: 1 },
            con: { raw: 14, bonus: 2 },
            int: { raw: 8, bonus: -1 },
            wis: { raw: 10, bonus: 0 },
            cha: { raw: 15, bonus: 2 },
          } as StatIndex,
          backStory: Promise.resolve('Test backstory'),
          abilities: Promise.resolve({}),
          hitPoints: Promise.resolve(50),
          movementSpeed: Promise.resolve(30),
          takeDamage: jest.fn(),
          heal: jest.fn(),
          move: jest.fn(),
          addAbility: jest.fn(),
          removeAbility: jest.fn(),
          updateStats: jest.fn(),
        }) as unknown as DurableObjectStub<Character>),
        newUniqueId: jest.fn(() => ({
          toString: () => 'mock-new-unique-id',
          equals: jest.fn(() => true),
        })),
        idFromString: jest.fn(() => ({
          toString: () => 'mock-id-from-string',
          equals: jest.fn(() => true),
        })),
        jurisdiction: jest.fn(() => ({
          idFromName: jest.fn(() => ({
            toString: () => 'mock-jurisdiction-id',
            equals: jest.fn(() => true),
          })),
          get: jest.fn(),
        }) as unknown as DurableObjectNamespace<Character>),
      },
    };

    // Instantiate the DNDPartyWorker with the mock context and environment
    worker = new DNDPartyWorker(mockCtx, mockEnv);
  });

  test('should return character data on fetch', async () => {
    const request = new Request('https://example.com/?name=TestCharacter');
    const response = await worker.fetch(request);

    // Check that CHARACTERS.idFromName and CHARACTERS.get were called
    expect(mockEnv.CHARACTERS.idFromName).toHaveBeenCalledWith('TestCharacter');
    expect(mockEnv.CHARACTERS.get).toHaveBeenCalled();

    // Check the response
    expect(response).toBeInstanceOf(Response);
    expect(await response.text()).toBe('Mock Character');
  });

  test('should create a character successfully', async () => {
    const characterData = {
      name: 'TestCharacter',
      alignment: 'Neutral Good',
      stats: { str: { raw: 10, bonus: 0 } },
      backStory: 'Test backstory',
      abilities: {},
      hitPoints: 50,
      movementSpeed: 30,
    };

    const request = new Request('https://example.com/create', {
      method: 'POST',
      body: JSON.stringify(characterData),
    });

    const mockResponse = await worker.createCharacter(request);

    // Ensure that idFromName and get were called
    expect(mockEnv.CHARACTERS.idFromName).toHaveBeenCalledWith('TestCharacter');
    expect(mockEnv.CHARACTERS.get).toHaveBeenCalled();
    expect(mockResponse.status).toBe(201);
  });

  test('should return 400 if character name is missing in fetch', async () => {
    const request = new Request('https://example.com/');
    const response = await worker.fetch(request);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Character name is required');
  });
});
