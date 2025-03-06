import { BaseDatabaseAdapter } from 'payload/dist/database/types';
import { SimpleSchema, AdditionalConfig, DBConfig, PayloadDBResult } from './types/index';
import { processSchema } from './utils/schemaProcessor';

// Only dependency is payload
import { Config as PayloadConfig } from 'payload/config';

/**
 * Create a Payload CMS configuration from a simplified schema
 * 
 * @param schema The simplified schema definition
 * @param config Additional Payload CMS configuration options
 * @returns Payload configuration that can be used with Payload CMS
 */
export const DB = (schema: SimpleSchema, db: BaseDatabaseAdapter, config: AdditionalConfig = {}): PayloadDBResult => {
  // Process the schema into Payload CMS collection configurations
  const collections = processSchema(schema);
  
  // Configure Payload CMS
  const payloadConfig = {
    collections,
    db: ({ payload }) => db,
    ...config,
  } as PayloadConfig;
  
  // Create a simple configuration wrapper that can be used with Payload
  return {
    config: payloadConfig,
    collections: Object.keys(schema).reduce((acc, collectionName) => {
      acc[collectionName] = { collectionName };
      return acc;
    }, {} as Record<string, { collectionName: string }>),
    getConfig: () => payloadConfig,
  };
};

/**
 * Helper to configure a database adapter
 * 
 * @param config Database configuration options
 * @returns Database configuration object for Payload CMS
 */
export const configureDatabase = (config: DBConfig) => {
  const { type, uri } = config;
  
  // Configure based on database type
  switch (type) {
    case 'mongodb':
      return {
        adapter: 'mongoose',
        url: uri,
      };
    case 'postgres':
      return {
        adapter: 'postgres',
        url: uri,
      };
    case 'sqlite':
      return {
        adapter: 'sqlite',
        url: uri,
      };
    case 'rest':
      return {
        adapter: 'rest',
        url: uri,
      };
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
};

// Export types
export * from './types/index';
