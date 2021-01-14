import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Piece } from '../entities/Piece';
import { Match } from '../entities/Match';

interface IPosition {
	row: number,
	col: number,
}

interface IPositionData {
	position: IPosition,
	hit: boolean,
}

const piecesRepository = getConnection().getRepository(Piece); 
const matchesRepository = getConnection().getRepository(Match); 

export const getMoves = async (request: Request, response: Response) : Promise<Response> => {
	const playerColor = request.header('Player-Color');
	const secretKey = request.header('Secret-Key');
	const pieceId = request.params.id;


	const findPiece = await piecesRepository.findOne({where: {id: pieceId}, relations: ['match']});
	if(!findPiece) return response.status(404).send({error: 'piece not found'});

	if(secretKey !== findPiece.match.secret_key) return response.status(401).send({error: 'invalid credentials'});

	const playerTurn = findPiece.match.status == 'whitePlay'? 'white' : 'black';
	if(playerColor !== playerTurn) return response.status(403).send({error: 'not your turn'});

	if(playerColor !== findPiece.color) return response.status(403).send({error: 'not your piece'});

	const initialPosition = {
		row: findPiece.row,
		col: findPiece.col,
	};

	const match = await matchesRepository.findOne({where: {id: findPiece.match.id}, relations: ['pieces']});
	const pieces = match.pieces;

	const moves = checkMoves(findPiece.type, playerColor, initialPosition, pieces);

	return response.status(200).send(moves);
};



export const postMove = async (request: Request, response: Response) : Promise<Response> => {
	const playerColor = request.header('Player-Color');
	const secretKey = request.header('Secret-Key');
	const pieceId = request.params.id;
	const { row, col } = request.body;


	const findPiece = await piecesRepository.findOne({where: {id: pieceId}, relations: ['match']});
	if(!findPiece) return response.status(404).send({error: 'piece not found'});

	if(secretKey !== findPiece.match.secret_key) return response.status(401).send({error: 'invalid credentials'});

	const playerTurn = findPiece.match.status == 'whitePlay'? 'white' : 'black';
	if(playerColor !== playerTurn) return response.status(403).send({error: 'not your turn'});

	if(playerColor !== findPiece.color) return response.status(403).send({error: 'not your piece'});


	const match = await matchesRepository.findOne({where: {id: findPiece.match.id}, relations: ['pieces']});
	const pieces = match.pieces;

	const initialPosition = {
		row: findPiece.row,
		col: findPiece.col,
	};


	const move = {col, row};
	
	const possibleMoves = checkMoves(findPiece.type, playerColor, initialPosition, pieces);
	
	const isMovePossible = possibleMoves.some((element) => element.col == move.col && element.row == move.row);
	
	if(!isMovePossible) return response.status(403).send({error: 'not a valid move'});

	const isEnemyInPosition = pieces.find((element) => element.col == move.col && element.row == move.row);
	if(isEnemyInPosition){
		await piecesRepository.createQueryBuilder()
			.delete()
			.from(Piece)
			.where('id = :id', { id: isEnemyInPosition.id })
			.execute();
	}

	const updatePiecePosition = await piecesRepository.createQueryBuilder()
		.update(Piece)
		.set({ col: col, row: row })
		.where('id = :id', { id: pieceId })
		.execute();
	
	if(updatePiecePosition){
		let newStatus: string;
		if(playerColor === 'white'){
			newStatus = 'blackPlay';
		} else{
			newStatus = 'whitePlay';
		}
		
		await matchesRepository.createQueryBuilder()
			.update(Match)
			.set({ status: newStatus})
			.where('id = :id', { id: findPiece.match_id })
			.execute();
		const updatedMatch = await matchesRepository.findOne({where: {id: findPiece.match.id}, relations: ['pieces']});
	
		return response.status(201).send(updatedMatch);
	}

	return response.status(500).send({error: 'please send this to a developer'});
};

const checkMoves = (pieceType: string, playerColor: string, piecePosition: IPosition, pieces: Piece[]): IPosition[] => {
	if(pieceType === 'pawn'){
		return checkMovesPawn(playerColor, piecePosition, pieces);
	} else if(pieceType === 'rook'){
		return checkMovesXandY(playerColor, piecePosition, pieces);
	} else if(pieceType === 'bishop'){
		return checkMovesDiagonals(playerColor, piecePosition, pieces);
	} else if(pieceType === 'queen'){
		return checkMovesQueen(playerColor, piecePosition, pieces);
	} else if(pieceType === 'knight'){
		return checkMovesKnight(playerColor, piecePosition, pieces);
	} else if(pieceType === 'king'){
		return checkMovesKing(playerColor, piecePosition, pieces);
	}
};

const checkMovesDiagonals = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
	const positions = [];
	let col = 0;
	let row = 0;
	let checkedPosition: IPositionData | null;

	col = initialPosition.col;
	for(row = initialPosition.row; row > 0; row--){
		if(col <= 0) break;
		col--;
		if(row !== initialPosition.row){
			
			checkedPosition = checkCollision(color, {row, col}, pieces);
			
			if(checkedPosition){
				if(checkedPosition.hit){
					positions.push(checkedPosition.position);
					break;
				}else{
					positions.push(checkedPosition.position);
				}
			}else{
				break;
			}
		}
	}

	col = initialPosition.col;
	for(row = initialPosition.row; row < 8; row++){
		if(col > 7) break;
		col++;
		if(row !== initialPosition.row){
			
			checkedPosition = checkCollision(color, {row, col}, pieces);
			
			if(checkedPosition){
				if(checkedPosition.hit){
					positions.push(checkedPosition.position);
					break;
				}else{
					positions.push(checkedPosition.position);
				}
			}else{
				break;
			}
		}
	}

	col = initialPosition.col;
	for(row = initialPosition.row; row < 8; row++){
		if(col <= 0) break;
		col--;
		if(row !== initialPosition.row){
			
			checkedPosition = checkCollision(color, {row, col}, pieces);
			
			if(checkedPosition){
				if(checkedPosition.hit){
					positions.push(checkedPosition.position);
					break;
				}else{
					positions.push(checkedPosition.position);
				}
			}else{
				break;
			}
		}
	}

	col = initialPosition.col;
	for(row = initialPosition.row; row > 0; row--){
		if(col > 7) break;
		col++;
		if(row !== initialPosition.row){
			
			checkedPosition = checkCollision(color, {row, col}, pieces);
			
			if(checkedPosition){
				if(checkedPosition.hit){
					positions.push(checkedPosition.position);
					break;
				}else{
					positions.push(checkedPosition.position);
				}
			}else{
				break;
			}
		}
	}
	return positions;
};

const checkMovesXandY = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
	const positions = [];
	let col = 0;
	let row = 0;
	let checkedPosition: IPositionData | null;

	col = initialPosition.col;
	for(row = initialPosition.row; row < 8; row++){
		if(row !== initialPosition.row){
			
			checkedPosition = checkCollision(color, {row, col}, pieces);
			
			if(checkedPosition){
				if(checkedPosition.hit){
					positions.push(checkedPosition.position);
					break;
				}else{
					positions.push(checkedPosition.position);
				}
			}else{
				break;
			}
		}
	}

	col = initialPosition.col;
	for(row = initialPosition.row; row > 0; row--){
		if(row !== initialPosition.row){
			
			checkedPosition = checkCollision(color, {row, col}, pieces);
			
			if(checkedPosition){
				if(checkedPosition.hit){
					positions.push(checkedPosition.position);
					break;
				}else{
					positions.push(checkedPosition.position);
				}
			}else{
				break;
			}
		}
	}

	row = initialPosition.row;
	for(col = initialPosition.col; col < 8; col++){
		if(col !== initialPosition.col){
			
			checkedPosition = checkCollision(color, {row, col}, pieces);
			
			if(checkedPosition){
				if(checkedPosition.hit){
					positions.push(checkedPosition.position);
					break;
				}else{
					positions.push(checkedPosition.position);
				}
			}else{
				break;
			}
		}
	}

	row = initialPosition.row;
	for(col = initialPosition.col; col > 0; col--){
		if(col !== initialPosition.col){
			
			checkedPosition = checkCollision(color, {row, col}, pieces);
			
			if(checkedPosition){
				if(checkedPosition.hit){
					positions.push(checkedPosition.position);
					break;
				}else{
					positions.push(checkedPosition.position);
				}
			}else{
				break;
			}
		}
	}

	return positions;
};

const checkMovesQueen = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
	let moves: IPosition[] = [];
	
	const diagonals = checkMovesDiagonals(color, initialPosition, pieces);
	const movesXandY = checkMovesXandY(color, initialPosition, pieces);

	moves = moves.concat(diagonals, movesXandY);

	return moves;
};

const checkMovesKnight = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
	const positions = [];
	const col = initialPosition.col;
	const row = initialPosition.row;
	let checkedPosition: IPositionData | null;

	checkedPosition = checkCollision(color, {col: col+2, row: row+1}, pieces);
	if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col+2, row: row-1}, pieces);
	if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col-2, row: row+1}, pieces);
	if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col-2, row: row-1}, pieces);
	if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col+1, row: row+2}, pieces);
	if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col-1, row: row+2}, pieces);
	if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col+1, row: row-2}, pieces);
	if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);
	
	checkedPosition = checkCollision(color, {col: col-1, row: row-2}, pieces);
	if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);

	return positions;
};

const checkMovesKing = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
	const positions = [];
	const col = initialPosition.col;
	const row = initialPosition.row;
	let checkedPosition: IPositionData | null;

	checkedPosition = checkCollision(color, {col: col, row: row+1}, pieces);
	if(checkedPosition && checkedPosition.position.row < 8) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col-1, row: row+1}, pieces);
	if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col+1, row: row+1}, pieces);
	if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);


	checkedPosition = checkCollision(color, {col: col, row: row-1}, pieces);
	if(checkedPosition && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col-1, row: row-1}, pieces);
	if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col+1, row: row-1}, pieces);
	if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);


	checkedPosition = checkCollision(color, {col: col+1, row: row}, pieces);
	if(checkedPosition && checkedPosition.position.col < 8) positions.push(checkedPosition.position);

	checkedPosition = checkCollision(color, {col: col-1, row: row}, pieces);
	if(checkedPosition && checkedPosition.position.col >= 0) positions.push(checkedPosition.position);

	return positions;
};

const checkMovesPawn = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
	const positions = [];
	const col = initialPosition.col;
	const row = initialPosition.row;
	let checkedPosition: IPositionData | null;

	if(color === 'white'){
		checkedPosition = checkCollision(color, {col: col, row: row+1}, pieces);
		if(checkedPosition && checkedPosition.position.row < 8) positions.push(checkedPosition.position);

		checkedPosition = checkCollision(color, {col: col+1, row: row+1}, pieces);
		if(((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row < 8) && checkedPosition.hit) positions.push(checkedPosition.position);

		checkedPosition = checkCollision(color, {col: col-1, row: row+1}, pieces);
		if(((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row < 8) && checkedPosition.hit) positions.push(checkedPosition.position);
	} else{
		checkedPosition = checkCollision(color, {col: col, row: row-1}, pieces);
		if(checkedPosition && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);

		checkedPosition = checkCollision(color, {col: col+1, row: row-1}, pieces);
		if(((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row >= 0) && checkedPosition.hit) positions.push(checkedPosition.position);

		checkedPosition = checkCollision(color, {col: col-1, row: row-1}, pieces);
		if(((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row >= 0) && checkedPosition.hit) positions.push(checkedPosition.position);
	}

	return positions;
};

const checkCollision = (color: string, position: IPosition, pieces: Piece[]): IPositionData | null=> {
	const collision = {
		hit: false,
		isEnemy: false,
	};

	const positionData = {
		position,
		hit: false,
	};
	
	pieces.some(element => {
		if(element.row === position.row && element.col === position.col){
			collision.hit = true;
			if(color !== element.color){
				collision.isEnemy = true;
				return true;
			}
			return true;
		}
	});

	if(collision.hit){
		positionData.hit = true;
		if(collision.isEnemy){
			return positionData;
		}else{
			return null;
		}
	}else{
		return positionData;
	}

};

// rook: vai somando e subtraindo na vertical para y e na horizontal para x
// CHECK MOVES X AND Y 
//OK

// bishop: soma row e coluna ou subtrai escolhendo o sentido da diagonal
// CHECK MOVES DIAGONALS 
//OK

// queen: soma de bishop e rook
// CHECK MOVES X AND Y AND DIAGONALS
//OK

// knight: apenas 8 posicoes possiveis, SOMA ou SUBTRAI 2 em X OU em Y e em seguida SOMA ou SUBTRAI 1 em X ou em Y (contrario da primeira direcao)
// CHECK MOVES KNIGHT
//OK

// king: apenas espaços vizinhos
// CHECK MOVES KING
//OK

// pawn: soma 1 em y caso seja branca e subtrai caso seja preta, checa as diagonais proximas na direcao positiva do movimento checando se pode comer as pecas, branco e esteja na row 1 = pode andar 2 casas somando na vertical, preta e row 6 pode andar 2 casas subtraindo na vertical. 
// CHECK MOVES 




// const checkStraightLine = (color: string, pieces: Piece[], pieceCol: number, pieceRow: number, direction: string): IPosition[] => {
// 	const positions = [];
// 	let collision: ICollision;
// 	const col = 0;
// 	const row = 0;
// 	let baseDirection = 0;
// 	let line = 0;
// 	let positionNow = {row, col};

// 	if(direction === 'vertical'){
// 		baseDirection = pieceCol;
// 	}else{
// 		baseDirection = pieceRow;
// 	}
	
// 	for(line = baseDirection; line < 8; line++){
// 		if(direction === 'vertical'){
// 			positionNow = {row: line, col: pieceCol};
// 		} else{
// 			positionNow = {row: pieceRow, col: line};
// 		}

// 		if(line !== baseDirection){
			
// 			collision = checkCollision(color, positionNow, pieces);
			
// 			if(collision.hit){
// 				if(collision.isEnemy){
// 					positions.push(positionNow);
// 					break;
// 				}
// 				break;
// 			} else{
// 				positions.push(positionNow);
// 				break;
// 			}
// 		}
// 	}
	
// 	//faço um foreach que só faz algo quando o index for igual a posicao que eu quero

// 	return positions;
// };