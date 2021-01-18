
import 'reflect-metadata';
import 'dotenv/config';
import {createConnection} from 'typeorm';
import config from './ormconfig';

createConnection(config).then(async () => {
	console.log(('Connected to the database!'));
	import('./server');
}).catch(error => {
	console.log(error);
});