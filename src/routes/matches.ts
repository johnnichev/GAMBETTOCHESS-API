import { Router } from 'express';
import { postMatchMiddleware, getMatchMiddleware } from '../middlewares/matchesMiddlewares';
import { postMatch, getMatch } from '../controllers/matchesController';

const matches = Router();

matches.post('/', postMatchMiddleware, postMatch);
matches.get('/:id', getMatchMiddleware, getMatch);

export default matches;