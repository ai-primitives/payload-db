// Import types from payload only for type checking, not for runtime
import type { Field, CollectionConfig } from 'payload/types';

// Simplified field type strings that users will use
export type SimpleFieldType =
  | 'text'
  | 'richtext'
  | 'number'
  | 'date'
  | 'email'
  | 'checkbox'
  | 'json'
  | 'tags'
  | 'tags[]'
  | string; // For relationships, select options with pipe separators ('Option1 | Option2 | Option3'), or '<-posts'

// Simple schema definition interface
export interface SimpleSchema {
  [collectionName: string]: {
    [fieldName: string]: SimpleFieldType;
  };
}

// Additional configuration options (no longer extends PayloadConfig)
export interface AdditionalConfig {
  [key: string]: any;
}

// Internal types used for transformation
export interface FieldDefinition {
  type: string;
  name: string;
  hasMany?: boolean;
  relationTo?: string | string[];
  reverseRelation?: boolean;
  sourceField?: string;
  // Additional field properties
  [key: string]: any;
}

export interface ProcessedCollection {
  slug: string;
  fields: Field[];
  // Potential additional properties
  [key: string]: any;
}
