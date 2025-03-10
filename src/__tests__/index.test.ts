import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DB } from '../index';
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

  it('should return collections and collectionRefs', () => {
    const mockSchema = {
      posts: {
        title: 'text',
        content: 'richtext'
      }
    };
    
    const result = DB(mockSchema);
    
    // Verify the result structure
    expect(result).toHaveProperty('collections');
    expect(result).toHaveProperty('collectionRefs');
    
    // Verify the collections are processed
    expect(schemaProcessor.processSchema).toHaveBeenCalledWith(mockSchema);
    
    // Verify the collections array contains the processed collections
    expect(result.collections).toEqual([{
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'content', type: 'richText' }
      ]
    }]);
    
    // Verify the collectionRefs object has the right format
    expect(result.collectionRefs).toHaveProperty('posts');
    expect(result.collectionRefs.posts).toEqual({ collectionName: 'posts' });
  });

  it('should accept additional config options', () => {
    const mockSchema = { posts: { title: 'text' } };
    const additionalConfig = {
      customOption: 'value',
    };
    
    const result = DB(mockSchema, additionalConfig);
    
    // Verify the collections are processed
    expect(schemaProcessor.processSchema).toHaveBeenCalledWith(mockSchema);
    
    // Verify the collections array contains the processed collections
    expect(result.collections).toEqual([{
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'content', type: 'richText' }
      ]
    }]);
  });
});
