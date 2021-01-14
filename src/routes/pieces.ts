import { Router } from 'express';

import { movesMiddleware, movementFormatMiddleware } from '../middlewares/piecesMiddlewares';
import { getMoves, postMove } from '../controllers/piecesController';

const pieces = Router();

pieces.get('/:id/moves', movesMiddleware, getMoves);
pieces.post('/:id/moves', movesMiddleware, movementFormatMiddleware, postMove);

export default pieces;