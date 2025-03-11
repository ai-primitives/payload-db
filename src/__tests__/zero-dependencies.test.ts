import { describe, it, expect } from 'vitest';
import { DB } from '../index';

describe('Zero Dependencies', () => {
  it('should return collections without requiring payload as a runtime dependency', () => {
    const schema = {
      posts: {
        title: 'text',
        content: 'richtext',
        author: 'users',
        tags: 'tags[]'
      },
      users: {
        name: 'text',
        email: 'email',
        role: 'admin | editor | viewer'
      }
    };
    
    const result = DB(schema);
    
    // Verify the result structure
    expect(result).toHaveProperty('collections');
    expect(result).toHaveProperty('collectionRefs');
    
    // Verify collections array contains the expected collections
    expect(result.collections.length).toBe(2);
    
    // Check that the posts collection has the right fields
    const postsCollection = result.collections.find((c: any) => c.slug === 'posts');
    expect(postsCollection).toBeDefined();
    expect(postsCollection?.fields.length).toBeGreaterThanOrEqual(4);
    
    // Check that the users collection has the right fields
    const usersCollection = result.collections.find((c: any) => c.slug === 'users');
    expect(usersCollection).toBeDefined();
    expect(usersCollection?.fields.length).toBeGreaterThanOrEqual(3);
    
    // Verify the collectionRefs object has the right format
    expect(result.collectionRefs).toHaveProperty('posts');
    expect(result.collectionRefs).toHaveProperty('users');
    expect(result.collectionRefs.posts).toEqual({ collectionName: 'posts' });
    expect(result.collectionRefs.users).toEqual({ collectionName: 'users' });
  });
  
  it('should handle complex schema with relationships', () => {
    const schema = {
      products: {
        name: 'text',
        price: 'number',
        category: 'categories',
        tags: 'tags[]'
      },
      categories: {
        name: 'text',
        description: 'richtext',
        products: '<-products'
      }
    };
    
    const result = DB(schema);
    
    // Verify the collections array contains the expected collections
    expect(result.collections.length).toBe(2);
    
    // Check that the products collection has the right fields
    const productsCollection = result.collections.find((c: any) => c.slug === 'products');
    expect(productsCollection).toBeDefined();
    
    // Check that the categories collection has the right fields
    const categoriesCollection = result.collections.find((c: any) => c.slug === 'categories');
    expect(categoriesCollection).toBeDefined();
    
    // Verify the collectionRefs object has the right format
    expect(result.collectionRefs).toHaveProperty('products');
    expect(result.collectionRefs).toHaveProperty('categories');
  });
});