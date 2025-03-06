import { Config as PayloadConfig } from 'payload/config';
import { Field, CollectionConfig } from 'payload/types';

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

// Database configuration options
export interface DBConfig {
  type: 'mongodb' | 'postgres' | 'sqlite' | 'rest';
  uri: string;
}

// Additional configuration options
export interface AdditionalConfig extends Partial<PayloadConfig> {
  database?: DBConfig;
}

// Result of the DB function - now just returns configuration
export interface PayloadDBResult {
  config: PayloadConfig; // The complete Payload config
  collections: Record<string, { collectionName: string }>; // Simple reference to collection names
  getConfig: () => PayloadConfig; // Helper to get the config
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
