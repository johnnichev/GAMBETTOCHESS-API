import { Router } from 'express';
import { getMatchMiddleware } from '../middlewares/matchesMiddlewares';
import { postMatch, getMatch } from '../controllers/matchesController';

const matches = Router();

matches.post('/', postMatch);
matches.get('/:id', getMatchMiddleware, getMatch);

export default matches;