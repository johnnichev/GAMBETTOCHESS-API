
import 'dotenv/config';
import 'reflect-metadata';
import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const database = process.env.DATABASE_URL;

const config: ConnectionOptions = {
	'type': 'postgres',
	'url': database,
	'synchronize': false,
	'logging': false,
	'namingStrategy': new SnakeNamingStrategy,
	'entities': [
		'src/entities/*.ts',
	],
	'migrations': [
		'src/migration/*.ts',
	],
	'subscribers': [
		'src/subscriber/**/*.ts',
	],
	'extra': {
		ssl: {
			rejectUnauthorized: false,
		},
	},
	'cli': {
		'entitiesDir': 'src/entity',
		'migrationsDir': 'src/migration',
		'subscribersDir': 'src/subscriber',
	}
};

export = config;
