// Type definitions for knex
// Project: https://knexjs.org/

declare module 'knex' {
  import * as Knex from 'knex';
  
  // Re-export the Knex namespace
  export * from 'knex/types';
  
  // Default export for the knex function
  declare function knex<TRecord extends {} = any, TResult = any>(
    config: Knex.Config | string
  ): Knex.Knex<TRecord, TResult>;
  
  export default knex;
}
