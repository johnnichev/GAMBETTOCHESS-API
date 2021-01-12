import { Router } from 'express';

import { getMovesMiddleware, postMoveMiddleware } from '../middlewares/piecesMiddlewares';
import { getMoves, postMove } from '../controllers/piecesController';

const pieces = Router();

pieces.get('/:id/moves', getMovesMiddleware, getMoves);
pieces.post('/:id/moves', postMoveMiddleware, postMove);

export default pieces;