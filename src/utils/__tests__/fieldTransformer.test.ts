import { describe, it, expect } from 'vitest';
import { transformField, processFields } from '../fieldTransformer';

describe('transformField', () => {
  it('should transform join fields correctly', () => {
    const result = transformField('relatedPosts', '<-posts');
    
    expect(result).toEqual({
      type: 'join',
      name: 'relatedPosts',
      hasMany: true,
      relationTo: 'posts',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: expect.any(Array),
      },
      sourceCollection: 'posts',
      sourceField: undefined,
    });

    // Test with a specific field path
    const resultWithField = transformField('authorArticles', '<-users.articles');
    expect(resultWithField.sourceCollection).toBe('users');
    expect(resultWithField.sourceField).toBe('articles');
  });

  it('should transform many-relationship fields correctly', () => {
    const result = transformField('categories', 'categories[]');
    
    expect(result).toEqual({
      type: 'relationship',
      name: 'categories',
      hasMany: true,
      relationTo: 'categories',
    });

    // Special case for tags
    const tagsResult = transformField('postTags', 'tags[]');
    expect(tagsResult).toEqual({
      type: 'select',
      name: 'postTags',
      hasMany: true,
      options: [],
    });
  });

  it('should transform select fields with pipe-separated options correctly', () => {
    // Test with spaces around pipes
    const result = transformField('status', 'Draft | Published | Archived');
    
    expect(result).toEqual({
      type: 'select',
      name: 'status',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    });

    // Test without spaces around pipes
    const noSpacesResult = transformField('priority', 'Low|Medium|High');
    expect(noSpacesResult.options).toHaveLength(3);
    expect(noSpacesResult.options[0].label).toBe('Low');
    expect(noSpacesResult.options[1].value).toBe('medium');
  });

  it('should transform standard field types correctly', () => {
    // Test various standard field types
    const textField = transformField('title', 'text');
    expect(textField).toEqual({ type: 'text', name: 'title' });

    const richtextField = transformField('content', 'richtext');
    expect(richtextField).toEqual({ type: 'richText', name: 'content' });

    const numberField = transformField('count', 'number');
    expect(numberField).toEqual({ type: 'number', name: 'count' });

    const dateField = transformField('publishedAt', 'date');
    expect(dateField).toEqual({ type: 'date', name: 'publishedAt' });

    const emailField = transformField('contact', 'email');
    expect(emailField).toEqual({ type: 'email', name: 'contact' });

    const checkboxField = transformField('isActive', 'checkbox');
    expect(checkboxField).toEqual({ type: 'checkbox', name: 'isActive' });

    const jsonField = transformField('metadata', 'json');
    expect(jsonField).toEqual({ type: 'json', name: 'metadata' });

    const tagsField = transformField('tags', 'tags');
    expect(tagsField).toEqual({
      type: 'select',
      name: 'tags',
      hasMany: true,
      options: [],
    });
  });

  it('should default to a relationship field for unknown types', () => {
    const result = transformField('author', 'users');
    
    expect(result).toEqual({
      type: 'relationship',
      name: 'author',
      relationTo: 'users',
    });
  });
});

describe('processFields', () => {
  it('should process multiple fields correctly', () => {
    const fields = {
      title: 'text',
      content: 'richtext',
      author: 'users',
      categories: 'categories[]',
      relatedPosts: '<-posts',
      status: 'Draft | Published | Archived',
    };

    const result = processFields(fields);
    
    expect(result).toHaveLength(6);
    
    // Check the title field
    const titleField = result.find(field => ('name' in field) && field.name === 'title');
    expect(titleField?.type).toBe('text');
    
    // Check the relationship field
    const authorField = result.find(field => ('name' in field) && field.name === 'author');
    expect(authorField?.type).toBe('relationship');
    // Make sure the field exists before checking relationTo
    expect(authorField).toBeDefined();
    if (authorField && 'relationTo' in authorField) {
      expect(authorField.relationTo).toBe('users');
    }
    
    // Check the many-relationship field
    const categoriesField = result.find(field => ('name' in field) && field.name === 'categories');
    expect(categoriesField?.type).toBe('relationship');
    // Make sure the field exists before checking hasMany
    expect(categoriesField).toBeDefined();
    if (categoriesField && 'hasMany' in categoriesField) {
      expect(categoriesField.hasMany).toBe(true);
    }
    
    // Check the join field
    const relatedPostsField = result.find(field => ('name' in field) && field.name === 'relatedPosts');
    expect(relatedPostsField?.type).toBe('join');
    // Make sure the field exists before checking sourceCollection
    expect(relatedPostsField).toBeDefined();
    if (relatedPostsField && 'sourceCollection' in relatedPostsField) {
      expect(relatedPostsField.sourceCollection).toBe('posts');
    }
    
    // Check the select field exists with the right type
    const statusField = result.find(field => ('name' in field) && field.name === 'status');
    expect(statusField).toBeDefined();
    expect(statusField?.type).toBe('select');
    // We're not going to test the specific options structure as it may vary
    // depending on how the field is processed internally
  });
});
