import { Router } from 'express';
import matchesRouter from './matches';
import piecesRouter from './pieces';

const routes = Router();

routes.use('/matches', matchesRouter);
routes.use('/pieces', piecesRouter);
export default routes;