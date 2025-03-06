import { describe, it, expect, vi } from 'vitest';
import { processSchema } from '../schemaProcessor';
import * as fieldTransformer from '../fieldTransformer';

// Mock the processFields function to isolate tests
vi.mock('../fieldTransformer', () => ({
  processFields: vi.fn((fields) => {
    // Return simplified mock fields for testing
    return Object.entries(fields).map(([name, type]) => {
      // Simulate different field types for testing
      if (typeof type === 'string' && type.startsWith('<-')) {
        const sourceCollection = type.substring(2);
        return {
          name,
          type: 'join',
          sourceCollection,
          relationTo: sourceCollection,
        };
      } else if (typeof type === 'string' && type === 'users') {
        return {
          name,
          type: 'relationship',
          relationTo: 'users',
        };
      } else {
        return { name, type };
      }
    });
  }),
}));

describe('processSchema', () => {
  it('should create collection configs with the correct structure', () => {
    const mockSchema = {
      posts: {
        title: 'text',
        content: 'richtext',
      },
      users: {
        name: 'text',
        email: 'email',
      },
    };

    const result = processSchema(mockSchema);

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('posts');
    expect(result[1].slug).toBe('users');
    expect(fieldTransformer.processFields).toHaveBeenCalledTimes(2);
  });

  it('should process join fields correctly', () => {
    // Create a schema with join fields to test the relationship setup
    const mockSchema = {
      posts: {
        title: 'text',
        content: 'richtext',
        author: 'users', // Regular relationship field
      },
      users: {
        name: 'text',
        userPosts: '<-posts', // Join field pointing back to posts
      },
    };

    const result = processSchema(mockSchema);

    // We should still have two collections
    expect(result).toHaveLength(2);

    // Get the posts and users collections
    const postsCollection = result.find(c => c.slug === 'posts');
    const usersCollection = result.find(c => c.slug === 'users');

    expect(postsCollection).toBeDefined();
    expect(usersCollection).toBeDefined();

    // The author field in posts should still exist
    const authorField = postsCollection?.fields.find((f: any) => f.name === 'author');
    expect(authorField).toBeDefined();
    expect(authorField?.type).toBe('relationship');

    // The userPosts field in users should be removed since it's a join field
    const userPostsField = usersCollection?.fields.find((f: any) => f.name === 'userPosts');
    expect(userPostsField).toBeUndefined();
    
    // Instead, the author field should have additional configuration
    expect(authorField?.fields).toBeDefined();
    const relatedField = authorField?.fields?.find((f: any) => f.name === 'userPosts');
    expect(relatedField).toBeDefined();
    expect(relatedField?.type).toBe('relationship');
    expect(relatedField?.hasMany).toBe(true);
  });

  it('should handle schemas with multiple collections and relationships', () => {
    const mockSchema = {
      posts: {
        title: 'text',
        author: 'users',
      },
      users: {
        name: 'text',
        authoredPosts: '<-posts',
      },
      comments: {
        content: 'text',
        post: 'posts',
        commenter: 'users',
      },
    };

    const result = processSchema(mockSchema);

    expect(result).toHaveLength(3);
    expect(result.map(c => c.slug)).toEqual(['posts', 'users', 'comments']);

    // Verify fields are processed correctly
    // The processFields could be called multiple times in actual implementation
    // What's important is that it was called at least once for each collection
    expect(fieldTransformer.processFields).toHaveBeenCalledWith(mockSchema.posts);
    expect(fieldTransformer.processFields).toHaveBeenCalledWith(mockSchema.users);
    expect(fieldTransformer.processFields).toHaveBeenCalledWith(mockSchema.comments);
  });
});
