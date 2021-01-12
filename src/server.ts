import express from 'express';
import 'reflect-metadata';
import routes from './routes';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());
app.use(routes);

	
app.listen(port, () => {
	console.log(`Server is listening on port ${port}.`);
});