import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Piece } from '../entities/Piece';
import { Match } from '../entities/Match';

interface IPosition {
	row: number,
	col: number,
}

interface ICollision {
	hit: boolean,
	isEnemy?: boolean,
}

const piecesRepository = getConnection().getRepository(Piece); 
const matchesRepository = getConnection().getRepository(Match); 

export const getMoves = async (request: Request, response: Response) : Promise<Response> => {
	const playerColor = request.header('Player-Color');
	const secretKey = request.header('Secret-Key');
	const pieceId = request.params.id;


	const findPiece = await piecesRepository.findOne({where: {id: pieceId}, relations: ['match']});
	if(!findPiece) return response.status(404).send({error: 'piece not found'});

	if(secretKey !== findPiece.match.secret_key) return response.status(422).send({error: 'invalid credentials'});

	const playerTurn = findPiece.match.status == 'whitePlay'? 'white' : 'black';
	if(playerColor !== playerTurn) return response.status(403).send({error: 'not your turn'});

	if(playerColor !== findPiece.color) return response.status(403).send({error: 'not your piece'});

	const initialPosition = {
		row: findPiece.row,
		col: findPiece.col,
	};

	const match = await matchesRepository.findOne({where: {id: findPiece.match.id}, relations: ['pieces']});
	const pieces = match.pieces;
	
	// const moves = checkMovesXandY(playerColor, initialPosition, pieces);
	const moves = checkMovesDiagonals(playerColor, initialPosition, pieces);
	return response.status(200).send(moves);
};

export const postMove = async (request: Request, response: Response) : Promise<Response> => {
	return response.status(200).send('ok!');
};

const checkMovesDiagonals = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
	const positions = [];
	let collision: ICollision;
	let col = 0;
	let row = 0;

	col = initialPosition.col;
	for(row = initialPosition.row; row >= 0; row--){
		if(col <= 0) break;
		col--;
		if(row !== initialPosition.row){
			collision = checkCollision(color, {row, col}, pieces);
			
			if(collision.hit){
				if(collision.isEnemy){
					positions.push({row, col});
					break;
				}
				break;
			} else{
				positions.push({row, col});
				break;
			}
		}
	}

	col = initialPosition.col;
	for(row = initialPosition.row; row < 8; row++){
		if(col > 7) break;
		col++;
		if(row !== initialPosition.row){
			collision = checkCollision(color, {row, col}, pieces);
			
			if(collision.hit){
				if(collision.isEnemy){
					positions.push({row, col});
					break;
				}
				break;
			} else{
				positions.push({row, col});
				break;
			}
		}
	}

	col = initialPosition.col;
	for(row = initialPosition.row; row < 8; row++){
		if(col <= 0) break;
		col--;
		if(row !== initialPosition.row){
			collision = checkCollision(color, {row, col}, pieces);
			
			if(collision.hit){
				if(collision.isEnemy){
					positions.push({row, col});
					break;
				}
				break;
			} else{
				positions.push({row, col});
				break;
			}
		}
	}

	col = initialPosition.col;
	for(row = initialPosition.row; row >= 0; row--){
		if(col > 7) break;
		col++;
		if(row !== initialPosition.row){
			collision = checkCollision(color, {row, col}, pieces);
			
			if(collision.hit){
				if(collision.isEnemy){
					positions.push({row, col});
					break;
				}
				break;
			} else{
				positions.push({row, col});
				break;
			}
		}
	}
	return positions;
};

const checkMovesXandY = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
	const positions = [];
	let collision: ICollision;
	let col = 0;
	let row = 0;

	col = initialPosition.col;
	for(row = 0; row < 8; row++){
		if(row !== initialPosition.row){
			
			collision = checkCollision(color, {row, col}, pieces);
			
			if(collision.hit){
				if(collision.isEnemy){
					positions.push({row, col});
					break;
				}
				break;
			} else{
				positions.push({row, col});
				break;
			}
		}
	}

	row = initialPosition.row;
	for(col = 0; col < 8; col++){
		if(col !== initialPosition.col){
			
			collision = checkCollision(color, {row, col}, pieces);
			
			if(collision.hit){
				
				if(collision.isEnemy){
					positions.push({row, col});
					break;
				}
				break;
			} else{
				positions.push({row, col});
				break;
			}
		}
	}

	return positions;
};

const checkMovesQueen = () => {
	let moves: IPosition[] = [];
	
	const diagonals = checkMovesDiagonals();
	const movesXandY = checkMovesXandY();

	moves = moves.concat(diagonals, movesXandY);
	// CRIACAO QUEEN
};

const checkCollision = (color: string, position: IPosition, pieces: Piece[]): ICollision => {
	const collision = {
		hit: false,
		isEnemy: false,
	};
	
	pieces.forEach(element => {
		if(element.row === position.row && element.col === position.col){
			
			collision.hit = true;
			if(color !== element.color){
				collision.isEnemy = true;
			}
		}
	});
	
	return collision;
};

// rook: vai somando e subtraindo na vertical para y e na horizontal para x
// CHECK MOVES X AND Y
 
// bishop: soma row e coluna ou subtrai escolhendo o sentido da diagonal
// CHECK MOVES DIAGONALS

// queen: soma de bishop e rook
// CHECK MOVES X AND Y AND DIAGONALS

// knight: apenas 8 posicoes possiveis, soma 2 em x ou em y e logo em seguida subtrai em x ou em y (contrario da primeira direcao)
// CHECK MOVES KNIGHT

// king: apenas espaços vizinhos
// CHECK MOVES KING

// pawn: soma 1 em y caso seja branca e subtrai caso seja preta, checa as diagonais proximas na direcao positiva do movimento checando se pode comer as pecas, branco e esteja na row 1 = pode andar 2 casas somando na vertical, preta e row 6 pode andar 2 casas subtraindo na vertical. 
// CHECK MOVES 



