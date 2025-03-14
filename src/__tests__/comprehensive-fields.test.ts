import { describe, it, expect } from 'vitest';
import { DB } from '../index';
import { transformField, processFields } from '../utils/fieldTransformer';

describe('Comprehensive Field Type Tests', () => {
  describe('Basic Field Types', () => {
    it('should handle all basic field types correctly', () => {
      const schema = {
        allFields: {
          textField: 'text',
          textareaField: 'textarea',
          richtextField: 'richtext',
          numberField: 'number',
          dateField: 'date',
          emailField: 'email',
          checkboxField: 'checkbox',
          jsonField: 'json'
        }
      };
      
      const result = DB(schema);
      
      // Verify the collection exists
      expect(result.collections).toHaveLength(1);
      const collection = result.collections[0];
      expect(collection.slug).toBe('allFields');
      
      // Verify all fields are processed correctly
      expect(collection.fields).toHaveLength(8);
      
      // Check each field type
      const textField = collection.fields.find((f: any) => f.name === 'textField');
      expect(textField?.type).toBe('text');
      
      const textareaField = collection.fields.find((f: any) => f.name === 'textareaField');
      expect(textareaField?.type).toBe('textarea');
      
      const richtextField = collection.fields.find((f: any) => f.name === 'richtextField');
      expect(richtextField?.type).toBe('richText');
      
      const numberField = collection.fields.find((f: any) => f.name === 'numberField');
      expect(numberField?.type).toBe('number');
      
      const dateField = collection.fields.find((f: any) => f.name === 'dateField');
      expect(dateField?.type).toBe('date');
      
      const emailField = collection.fields.find((f: any) => f.name === 'emailField');
      expect(emailField?.type).toBe('email');
      
      const checkboxField = collection.fields.find((f: any) => f.name === 'checkboxField');
      expect(checkboxField?.type).toBe('checkbox');
      
      const jsonField = collection.fields.find((f: any) => f.name === 'jsonField');
      expect(jsonField?.type).toBe('json');
    });
  });

  describe('Select Field Variations', () => {
    it('should handle select fields with different separator styles', () => {
      const schema = {
        selectFields: {
          withSpaces: 'Option A | Option B | Option C',
          withoutSpaces: 'OptionA|OptionB|OptionC',
          mixedCase: 'CamelCase | snake_case | kebab-case',
          withNumbers: 'Option1 | Option2 | Option3',
          withSpecialChars: 'Option-1 | Option_2 | Option.3'
        }
      };
      
      const result = DB(schema);
      
      // Verify the collection exists
      expect(result.collections).toHaveLength(1);
      const collection = result.collections[0];
      
      // Check each select field
      const withSpaces = collection.fields.find((f: any) => f.name === 'withSpaces') as any;
      expect(withSpaces?.type).toBe('select');
      if (withSpaces?.options) {
        expect(withSpaces.options).toHaveLength(3);
        expect(withSpaces.options[0].label).toBe('Option A');
        expect(withSpaces.options[0].value).toBe('option-a');
      }
      
      const withoutSpaces = collection.fields.find((f: any) => f.name === 'withoutSpaces') as any;
      expect(withoutSpaces?.type).toBe('select');
      if (withoutSpaces?.options) {
        expect(withoutSpaces.options).toHaveLength(3);
      }
      
      const mixedCase = collection.fields.find((f: any) => f.name === 'mixedCase') as any;
      expect(mixedCase?.type).toBe('select');
      if (mixedCase?.options) {
        expect(mixedCase.options).toHaveLength(3);
        expect(mixedCase.options[0].value).toBe('camelcase');
        expect(mixedCase.options[1].value).toBe('snake-case');
        expect(mixedCase.options[2].value).toBe('kebab-case');
      }
      
      const withNumbers = collection.fields.find((f: any) => f.name === 'withNumbers') as any;
      expect(withNumbers?.type).toBe('select');
      if (withNumbers?.options) {
        expect(withNumbers.options).toHaveLength(3);
      }
      
      const withSpecialChars = collection.fields.find((f: any) => f.name === 'withSpecialChars') as any;
      expect(withSpecialChars?.type).toBe('select');
      if (withSpecialChars?.options) {
        expect(withSpecialChars.options).toHaveLength(3);
      }
    });
  });

  describe('Relationship Field Variations', () => {
    it('should handle single and many relationship fields correctly', () => {
      const schema = {
        posts: {
          title: 'text',
          author: 'users',           // Single relationship
          categories: 'categories[]', // Many relationship
          tags: 'tags[]'             // Many relationship to tags
        },
        users: {
          name: 'text'
        },
        categories: {
          name: 'text'
        },
        tags: {
          name: 'text'
        }
      };
      
      const result = DB(schema);
      
      // Verify all collections exist
      expect(result.collections).toHaveLength(4);
      
      // Find the posts collection
      const postsCollection = result.collections.find((c: any) => c.slug === 'posts');
      expect(postsCollection).toBeDefined();
      
      // Check single relationship field
      const authorField = postsCollection?.fields.find((f: any) => f.name === 'author') as any;
      expect(authorField?.type).toBe('relationship');
      expect(authorField?.relationTo).toBe('users');
      expect(authorField?.hasMany).toBeUndefined();
      
      // Check many relationship field
      const categoriesField = postsCollection?.fields.find((f: any) => f.name === 'categories') as any;
      expect(categoriesField?.type).toBe('relationship');
      expect(categoriesField?.relationTo).toBe('categories');
      expect(categoriesField?.hasMany).toBe(true);
      
      // Check tags relationship field
      const tagsField = postsCollection?.fields.find((f: any) => f.name === 'tags') as any;
      expect(tagsField?.type).toBe('relationship');
      expect(tagsField?.relationTo).toBe('tags');
      expect(tagsField?.hasMany).toBe(true);
    });
  });

  describe('Join Field Variations', () => {
    it('should handle join fields with and without specific source fields', () => {
      const schema = {
        posts: {
          title: 'text',
          author: 'users',
          categories: 'categories[]'
        },
        users: {
          name: 'text',
          authoredPosts: '<-posts.author',  // Join with specific source field
          allPosts: '<-posts'               // Join without specific source field
        },
        categories: {
          name: 'text',
          categorizedPosts: '<-posts.categories' // Join with specific source field
        }
      };
      
      const result = DB(schema);
      
      // Verify all collections exist
      expect(result.collections).toHaveLength(3);
      
      // Find the collections
      const postsCollection = result.collections.find((c: any) => c.slug === 'posts');
      const usersCollection = result.collections.find((c: any) => c.slug === 'users');
      const categoriesCollection = result.collections.find((c: any) => c.slug === 'categories');
      
      expect(postsCollection).toBeDefined();
      expect(usersCollection).toBeDefined();
      expect(categoriesCollection).toBeDefined();
      
      // Check that join fields are not directly in the collections
      const authoredPostsField = usersCollection?.fields.find((f: any) => f.name === 'authoredPosts');
      expect(authoredPostsField).toBeUndefined();
      
      const allPostsField = usersCollection?.fields.find((f: any) => f.name === 'allPosts');
      expect(allPostsField).toBeUndefined();
      
      const categorizedPostsField = categoriesCollection?.fields.find((f: any) => f.name === 'categorizedPosts');
      expect(categorizedPostsField).toBeUndefined();
      
      // Check that the source fields have been properly configured
      const authorField = postsCollection?.fields.find((f: any) => f.name === 'author') as any;
      expect(authorField).toBeDefined();
      expect(authorField?.admin?.enableRichText).toBe(true);
      
      // Check that the fields array exists on the source fields
      expect(authorField?.fields).toBeDefined();
      
      // Check that the join fields are properly set up in the source fields
      const authoredPostsJoinField = authorField?.fields.find((f: any) => f.name === 'authoredPosts') as any;
      expect(authoredPostsJoinField).toBeDefined();
      expect(authoredPostsJoinField?.type).toBe('relationship');
      expect(authoredPostsJoinField?.relationTo).toBe('posts');
      expect(authoredPostsJoinField?.hasMany).toBe(true);
      
      const categoriesField = postsCollection?.fields.find((f: any) => f.name === 'categories') as any;
      expect(categoriesField).toBeDefined();
      expect(categoriesField?.admin?.enableRichText).toBe(true);
      
      // Check that the fields array exists on the source fields
      expect(categoriesField?.fields).toBeDefined();
      
      // Check that the join fields are properly set up in the source fields
      const categorizedPostsJoinField = categoriesField?.fields.find((f: any) => f.name === 'categorizedPosts') as any;
      expect(categorizedPostsJoinField).toBeDefined();
      expect(categorizedPostsJoinField?.type).toBe('relationship');
      expect(categorizedPostsJoinField?.relationTo).toBe('posts');
      expect(categorizedPostsJoinField?.hasMany).toBe(true);
    });
  });
});
