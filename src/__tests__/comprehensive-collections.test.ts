import { describe, it, expect } from 'vitest';
import { DB } from '../index';

describe('Comprehensive Collection Tests', () => {
  describe('Multiple Collections with Various Relationships', () => {
    it('should handle a complex schema with multiple collections and relationship types', () => {
      const schema = {
        posts: {
          title: 'text',
          content: 'richtext',
          status: 'Draft | Published | Archived',
          author: 'users',
          categories: 'categories[]',
          tags: 'tags[]',
          relatedPosts: 'posts[]'
        },
        users: {
          name: 'text',
          email: 'email',
          role: 'Admin | Editor | Author | Viewer',
          bio: 'richtext',
          authoredPosts: '<-posts.author',
          favoriteCategories: 'categories[]'
        },
        categories: {
          name: 'text',
          description: 'textarea',
          parent: 'categories',
          posts: '<-posts.categories',
          subcategories: '<-categories.parent'
        },
        tags: {
          name: 'text',
          posts: '<-posts.tags'
        },
        comments: {
          content: 'richtext',
          author: 'users',
          post: 'posts',
          parent: 'comments',
          replies: '<-comments.parent'
        },
        media: {
          title: 'text',
          file: 'text', // Simplified for testing
          alt: 'text',
          posts: '<-posts.media'
        }
      };
      
      const result = DB(schema);
      
      // Verify all collections exist
      expect(result.collections).toHaveLength(6);
      
      // Verify collection slugs
      const collectionSlugs = result.collections.map((c: any) => c.slug);
      expect(collectionSlugs).toContain('posts');
      expect(collectionSlugs).toContain('users');
      expect(collectionSlugs).toContain('categories');
      expect(collectionSlugs).toContain('tags');
      expect(collectionSlugs).toContain('comments');
      expect(collectionSlugs).toContain('media');
      
      // Verify collection references
      expect(result.collectionRefs).toHaveProperty('posts');
      expect(result.collectionRefs).toHaveProperty('users');
      expect(result.collectionRefs).toHaveProperty('categories');
      expect(result.collectionRefs).toHaveProperty('tags');
      expect(result.collectionRefs).toHaveProperty('comments');
      expect(result.collectionRefs).toHaveProperty('media');
      
      // Check self-referential relationships
      const postsCollection = result.collections.find((c: any) => c.slug === 'posts');
      const relatedPostsField = postsCollection?.fields.find((f: any) => f.name === 'relatedPosts') as any;
      expect(relatedPostsField?.type).toBe('relationship');
      expect(relatedPostsField?.relationTo).toBe('posts');
      expect(relatedPostsField?.hasMany).toBe(true);
      
      const categoriesCollection = result.collections.find((c: any) => c.slug === 'categories');
      const parentCategoryField = categoriesCollection?.fields.find((f: any) => f.name === 'parent') as any;
      expect(parentCategoryField?.type).toBe('relationship');
      expect(parentCategoryField?.relationTo).toBe('categories');
      expect(parentCategoryField?.hasMany).toBeUndefined();
      
      const commentsCollection = result.collections.find((c: any) => c.slug === 'comments');
      const parentCommentField = commentsCollection?.fields.find((f: any) => f.name === 'parent') as any;
      expect(parentCommentField?.type).toBe('relationship');
      expect(parentCommentField?.relationTo).toBe('comments');
      expect(parentCommentField?.hasMany).toBeUndefined();
    });
  });

  describe('Circular References', () => {
    it('should handle circular references between collections', () => {
      const schema = {
        products: {
          name: 'text',
          category: 'categories',
          relatedProducts: 'products[]'
        },
        categories: {
          name: 'text',
          parentCategory: 'categories',
          products: '<-products.category'
        },
        orders: {
          orderNumber: 'text',
          customer: 'customers',
          products: 'products[]'
        },
        customers: {
          name: 'text',
          email: 'email',
          orders: '<-orders.customer',
          favoriteProducts: 'products[]'
        }
      };
      
      const result = DB(schema);
      
      // Verify all collections exist
      expect(result.collections).toHaveLength(4);
      
      // Check circular references
      const productsCollection = result.collections.find((c: any) => c.slug === 'products');
      const relatedProductsField = productsCollection?.fields.find((f: any) => f.name === 'relatedProducts') as any;
      expect(relatedProductsField?.type).toBe('relationship');
      expect(relatedProductsField?.relationTo).toBe('products');
      expect(relatedProductsField?.hasMany).toBe(true);
      
      const categoriesCollection = result.collections.find((c: any) => c.slug === 'categories');
      const parentCategoryField = categoriesCollection?.fields.find((f: any) => f.name === 'parentCategory') as any;
      expect(parentCategoryField?.type).toBe('relationship');
      expect(parentCategoryField?.relationTo).toBe('categories');
      expect(parentCategoryField?.hasMany).toBeUndefined();
      
      // Check cross-collection relationships
      const categoryField = productsCollection?.fields.find((f: any) => f.name === 'category') as any;
      expect(categoryField?.type).toBe('relationship');
      expect(categoryField?.relationTo).toBe('categories');
      
      const ordersCollection = result.collections.find((c: any) => c.slug === 'orders');
      const customerField = ordersCollection?.fields.find((f: any) => f.name === 'customer') as any;
      expect(customerField?.type).toBe('relationship');
      expect(customerField?.relationTo).toBe('customers');
      
      const productsField = ordersCollection?.fields.find((f: any) => f.name === 'products') as any;
      expect(productsField?.type).toBe('relationship');
      expect(productsField?.relationTo).toBe('products');
      expect(productsField?.hasMany).toBe(true);
      
      const customersCollection = result.collections.find((c: any) => c.slug === 'customers');
      const favoriteProductsField = customersCollection?.fields.find((f: any) => f.name === 'favoriteProducts') as any;
      expect(favoriteProductsField?.type).toBe('relationship');
      expect(favoriteProductsField?.relationTo).toBe('products');
      expect(favoriteProductsField?.hasMany).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle collections with no fields', () => {
      const schema = {
        emptyCollection: {}
      };
      
      const result = DB(schema);
      
      // Verify the collection exists
      expect(result.collections).toHaveLength(1);
      const collection = result.collections[0];
      expect(collection.slug).toBe('emptyCollection');
      expect(collection.fields).toHaveLength(0);
    });
    
    it('should handle collections with only join fields', () => {
      const schema = {
        posts: {
          title: 'text',
          author: 'users'
        },
        users: {
          name: 'text'
        },
        joinOnly: {
          userPosts: '<-posts.author'
        }
      };
      
      const result = DB(schema);
      
      // Verify all collections exist
      expect(result.collections).toHaveLength(3);
      
      // Find the joinOnly collection
      const joinOnlyCollection = result.collections.find((c: any) => c.slug === 'joinOnly');
      expect(joinOnlyCollection).toBeDefined();
      
      // The join field should be removed from the collection
      expect(joinOnlyCollection?.fields).toHaveLength(0);
      
      // But the collection should still exist
      expect(result.collectionRefs).toHaveProperty('joinOnly');
    });
    
    it('should handle collections with only relationship fields', () => {
      const schema = {
        users: {
          name: 'text'
        },
        relOnly: {
          user: 'users',
          users: 'users[]'
        }
      };
      
      const result = DB(schema);
      
      // Verify all collections exist
      expect(result.collections).toHaveLength(2);
      
      // Find the relOnly collection
      const relOnlyCollection = result.collections.find((c: any) => c.slug === 'relOnly');
      expect(relOnlyCollection).toBeDefined();
      
      // Check the relationship fields
      expect(relOnlyCollection?.fields).toHaveLength(2);
      
      const userField = relOnlyCollection?.fields.find((f: any) => f.name === 'user') as any;
      expect(userField?.type).toBe('relationship');
      expect(userField?.relationTo).toBe('users');
      expect(userField?.hasMany).toBeUndefined();
      
      const usersField = relOnlyCollection?.fields.find((f: any) => f.name === 'users') as any;
      expect(usersField?.type).toBe('relationship');
      expect(usersField?.relationTo).toBe('users');
      expect(usersField?.hasMany).toBe(true);
    });
  });
});
