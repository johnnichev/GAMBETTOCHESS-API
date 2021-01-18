import matchesController from '../controllers/matchesController';

import { mocked } from 'ts-jest/utils';

import { Match } from '../entities/Match';

import { Piece } from '../entities/Piece';

describe('CREATE Match', async () => {
	test('should return a piece', async () => {
		// Arrange

		const piece = await matchesController.createPiece(2, 1, 'a', 'b');

		// Act
        

		// Assert
		

	});
});