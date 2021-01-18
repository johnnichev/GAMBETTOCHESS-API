import { getConnection } from 'typeorm';
import { Piece } from '../entities/Piece';
import { Match } from '../entities/Match';
import { HttpError } from '../utils/errors';

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

export default new class PiecesController {

	getMoves = async (playerColor: string, secretKey: string, pieceId: string) : Promise<IPosition[]> => {
	
		const findPiece = await piecesRepository.findOne({where: {id: pieceId}, relations: ['match']});
		if(!findPiece) throw new HttpError(404, 'piece not found');
	
		if(secretKey !== findPiece.match.secret_key) throw new HttpError(401, 'invalid credentials');
	
		const playerTurn = findPiece.match.status == 'whitePlay'? 'white' : 'black';
		if(playerColor !== playerTurn) throw new HttpError(403, 'not your turn');
	
		if(playerColor !== findPiece.color) throw new HttpError(403, 'not your piece');
	
		const initialPosition = {
			row: findPiece.row,
			col: findPiece.col,
		};
	
		const match = await matchesRepository.findOne({where: {id: findPiece.match.id}, relations: ['pieces']});
		const pieces = match.pieces;
	
		const moves = this.checkMoves(findPiece.type, playerColor, initialPosition, pieces);
	
		return moves;
	};
	
	postMove = async (playerColor: string, secretKey: string, pieceId: string, row: number, col: number) : Promise<Match> => {
	

		const findPiece = await piecesRepository.findOne({where: {id: pieceId}, relations: ['match']});
		if(!findPiece) throw new HttpError(404, 'piece not found');
	
		if(secretKey !== findPiece.match.secret_key) throw new HttpError(401, 'invalid credentials');
	
		const playerTurn = findPiece.match.status == 'whitePlay'? 'white' : 'black';
		if(playerColor !== playerTurn) throw new HttpError(403, 'not your turn');
	
		if(playerColor !== findPiece.color) throw new HttpError(403, 'not your piece');
	
	
		const match = await matchesRepository.findOne({where: {id: findPiece.match.id}, relations: ['pieces']});
		const pieces = match.pieces;
	
		const initialPosition = {
			row: findPiece.row,
			col: findPiece.col,
		};
	
		const move = {col, row};
		
		const possibleMoves = this.checkMoves(findPiece.type, playerColor, initialPosition, pieces);
		
		const isMovePossible = possibleMoves.some((piece) => piece.col == move.col && piece.row == move.row);
		
		if(!isMovePossible) throw new HttpError(403, 'not a valid move');
	
		const isEnemyInPosition = pieces.find((piece) => piece.col == move.col && piece.row == move.row);
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
		
			return updatedMatch;
		}
	
		throw new HttpError(500, 'please, send this to a developer');
	};
	
	checkMoves = (pieceType: string, playerColor: string, piecePosition: IPosition, pieces: Piece[]): IPosition[] => {
		if(pieceType === 'pawn'){
			return this.checkMovesPawn(playerColor, piecePosition, pieces);
		} else if(pieceType === 'rook'){
			return this.checkMovesXandY(playerColor, piecePosition, pieces);
		} else if(pieceType === 'bishop'){
			return this.checkMovesDiagonals(playerColor, piecePosition, pieces);
		} else if(pieceType === 'queen'){
			return this.checkMovesQueen(playerColor, piecePosition, pieces);
		} else if(pieceType === 'knight'){
			return this.checkMovesKnight(playerColor, piecePosition, pieces);
		} else if(pieceType === 'king'){
			return this.checkMovesKing(playerColor, piecePosition, pieces);
		}
	};
	
	checkMovesDiagonals = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
		const positions = [];
		let col = 0;
		let row = 0;
		let checkedPosition: IPositionData | null;
	
		col = initialPosition.col;
		for(row = initialPosition.row; row > 0; row--){
			if(col <= 0) break;
			col--;
			if(row !== initialPosition.row){
				
				checkedPosition = this.checkCollision(color, {row, col}, pieces);
				
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
				
				checkedPosition = this.checkCollision(color, {row, col}, pieces);
				
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
				
				checkedPosition = this.checkCollision(color, {row, col}, pieces);
				
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
				
				checkedPosition = this.checkCollision(color, {row, col}, pieces);
				
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
	
	checkMovesXandY = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
		const positions = [];
		let col = 0;
		let row = 0;
		let checkedPosition: IPositionData | null;
	
		col = initialPosition.col;
		for(row = initialPosition.row; row < 8; row++){
			if(row !== initialPosition.row){
				
				checkedPosition = this.checkCollision(color, {row, col}, pieces);
				
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
				
				checkedPosition = this.checkCollision(color, {row, col}, pieces);
				
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
				
				checkedPosition = this.checkCollision(color, {row, col}, pieces);
				
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
				
				checkedPosition = this.checkCollision(color, {row, col}, pieces);
				
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
	
	checkMovesQueen = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
		let moves: IPosition[] = [];
		
		const diagonals = this.checkMovesDiagonals(color, initialPosition, pieces);
		const movesXandY = this.checkMovesXandY(color, initialPosition, pieces);
	
		moves = moves.concat(diagonals, movesXandY);
	
		return moves;
	};
	
	checkMovesKnight = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
		const positions = [];
		const col = initialPosition.col;
		const row = initialPosition.row;
		let checkedPosition: IPositionData | null;
	
		checkedPosition = this.checkCollision(color, {col: col+2, row: row+1}, pieces);
		if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col+2, row: row-1}, pieces);
		if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col-2, row: row+1}, pieces);
		if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col-2, row: row-1}, pieces);
		if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col+1, row: row+2}, pieces);
		if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col-1, row: row+2}, pieces);
		if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col+1, row: row-2}, pieces);
		if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);
		
		checkedPosition = this.checkCollision(color, {col: col-1, row: row-2}, pieces);
		if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);
	
		return positions;
	};
	
	checkMovesKing = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
		const positions = [];
		const col = initialPosition.col;
		const row = initialPosition.row;
		let checkedPosition: IPositionData | null;
	
		checkedPosition = this.checkCollision(color, {col: col, row: row+1}, pieces);
		if(checkedPosition && checkedPosition.position.row < 8) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col-1, row: row+1}, pieces);
		if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col+1, row: row+1}, pieces);
		if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row < 8) positions.push(checkedPosition.position);
	
	
		checkedPosition = this.checkCollision(color, {col: col, row: row-1}, pieces);
		if(checkedPosition && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col-1, row: row-1}, pieces);
		if((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col+1, row: row-1}, pieces);
		if((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);
	
	
		checkedPosition = this.checkCollision(color, {col: col+1, row: row}, pieces);
		if(checkedPosition && checkedPosition.position.col < 8) positions.push(checkedPosition.position);
	
		checkedPosition = this.checkCollision(color, {col: col-1, row: row}, pieces);
		if(checkedPosition && checkedPosition.position.col >= 0) positions.push(checkedPosition.position);
	
		return positions;
	};
	
	checkMovesPawn = (color: string, initialPosition: IPosition, pieces: Piece[]): IPosition[] => {
		const positions = [];
		const col = initialPosition.col;
		const row = initialPosition.row;
		let checkedPosition: IPositionData | null;
	
		if(color === 'white'){
			checkedPosition = this.checkCollision(color, {col: col, row: row+1}, pieces);
			if(checkedPosition && checkedPosition.position.row < 8) positions.push(checkedPosition.position);
	
			checkedPosition = this.checkCollision(color, {col: col+1, row: row+1}, pieces);
			if(((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row < 8) && checkedPosition.hit) positions.push(checkedPosition.position);
	
			checkedPosition = this.checkCollision(color, {col: col-1, row: row+1}, pieces);
			if(((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row < 8) && checkedPosition.hit) positions.push(checkedPosition.position);
		} else{
			checkedPosition = this.checkCollision(color, {col: col, row: row-1}, pieces);
			if(checkedPosition && checkedPosition.position.row >= 0) positions.push(checkedPosition.position);
	
			checkedPosition = this.checkCollision(color, {col: col+1, row: row-1}, pieces);
			if(((checkedPosition && checkedPosition.position.col < 8) && checkedPosition.position.row >= 0) && checkedPosition.hit) positions.push(checkedPosition.position);
	
			checkedPosition = this.checkCollision(color, {col: col-1, row: row-1}, pieces);
			if(((checkedPosition && checkedPosition.position.col >= 0) && checkedPosition.position.row >= 0) && checkedPosition.hit) positions.push(checkedPosition.position);
		}
	
		return positions;
	};
	
	checkCollision = (color: string, position: IPosition, pieces: Piece[]): IPositionData | null=> {
		const collision = {
			hit: false,
			isEnemy: false,
		};
	
		const positionData = {
			position,
			hit: false,
		};
		
		pieces.some(piece => {
			if(piece.row === position.row && piece.col === position.col){
				collision.hit = true;
				if(color !== piece.color){
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
//OK