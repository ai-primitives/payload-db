import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DB, configureDatabase } from '../index';
import * as schemaProcessor from '../utils/schemaProcessor';

// Mock dependencies
vi.mock('../utils/schemaProcessor', () => ({
  processSchema: vi.fn(),
}));

describe('DB function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementation for processSchema
    vi.mocked(schemaProcessor.processSchema).mockReturnValue([{
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'content', type: 'richText' }
      ]
    }]);
  });

  it('should create a valid PayloadDBResult', () => {
    const mockSchema = {
      posts: {
        title: 'text',
        content: 'richtext'
      }
    };
    
    // Create a mock database adapter
    const mockDbAdapter = {} as any;
    
    const result = DB(mockSchema, mockDbAdapter);
    
    // Verify the result structure
    expect(result).toHaveProperty('config');
    expect(result).toHaveProperty('collections');
    expect(result).toHaveProperty('getConfig');
    
    // Verify the collections are processed
    expect(schemaProcessor.processSchema).toHaveBeenCalledWith(mockSchema);
    
    // Verify the collections object has the right format
    expect(result.collections).toHaveProperty('posts');
    expect(result.collections.posts).toEqual({ collectionName: 'posts' });
    
    // Verify the config is properly generated
    expect(result.config.collections).toEqual([{
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'content', type: 'richText' }
      ]
    }]);
    
    // Verify getConfig returns the same config
    expect(result.getConfig()).toBe(result.config);
  });

  it('should merge additional config options', () => {
    const mockSchema = { posts: { title: 'text' } };
    const mockDbAdapter = {} as any;
    const additionalConfig = {
      serverURL: 'http://localhost:3000',
      admin: {
        user: 'admin',
      },
    };
    
    const result = DB(mockSchema, mockDbAdapter, additionalConfig);
    
    // Verify the additional config is merged
    expect(result.config).toHaveProperty('serverURL', 'http://localhost:3000');
    expect(result.config).toHaveProperty('admin');
    expect(result.config.admin).toHaveProperty('user', 'admin');
  });
});

describe('configureDatabase', () => {
  it('should configure MongoDB correctly', () => {
    const config = configureDatabase({
      type: 'mongodb',
      uri: 'mongodb://localhost:27017/test'
    });
    
    expect(config).toEqual({
      adapter: 'mongoose',
      url: 'mongodb://localhost:27017/test'
    });
  });

  it('should configure Postgres correctly', () => {
    const config = configureDatabase({
      type: 'postgres',
      uri: 'postgres://user:pass@localhost:5432/dbname'
    });
    
    expect(config).toEqual({
      adapter: 'postgres',
      url: 'postgres://user:pass@localhost:5432/dbname'
    });
  });

  it('should configure SQLite correctly', () => {
    const config = configureDatabase({
      type: 'sqlite',
      uri: 'file:./mydb.sqlite'
    });
    
    expect(config).toEqual({
      adapter: 'sqlite',
      url: 'file:./mydb.sqlite'
    });
  });

  it('should configure REST adapter correctly', () => {
    const config = configureDatabase({
      type: 'rest',
      uri: 'https://api.example.com/v1'
    });
    
    expect(config).toEqual({
      adapter: 'rest',
      url: 'https://api.example.com/v1'
    });
  });

  it('should throw an error for unsupported database types', () => {
    expect(() => {
      configureDatabase({ 
        type: 'unsupported' as any, 
        uri: 'invalid://connection' 
      });
    }).toThrow('Unsupported database type: unsupported');
  });
});
