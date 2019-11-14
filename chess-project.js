function plot_it()  {
	
	chess_data.forEach(d => {
		d.rated = Boolean(d.rated)
		d.turns = +d.turns
		d.white_rating = +d.white_rating
		d.black_rating = +d.black_rating
		d.moves = d.moves.split(" ")
		//if (typeof d.moves[1] === 'undefined') {console.log(d)}
		//console.log(d.winner)
		//d.winner = String(d.winner)
	});

	opening_move_matrix = {}
	for (game of chess_data) {
		//console.log(game.moves[0])
		if (typeof opening_move_matrix[game.moves[0]] === 'undefined') 
			{opening_move_matrix[game.moves[0]] = {}}
	}
	for (move in opening_move_matrix) {
		for (game of chess_data) {
			opening_move_matrix[move][game.moves[1]] = {'val': null, 'total_games': 0}
		}
	}
	for (game of chess_data) {
		if (opening_move_matrix[game.moves[0]][game.moves[1]]['total_games'] == 0) {opening_move_matrix[game.moves[0]][game.moves[1]]['val'] = 0}
		if (game.winner == 'white') {opening_move_matrix[game.moves[0]][game.moves[1]]['val'] += 1}
		else if (game.winner == 'black') {opening_move_matrix[game.moves[0]][game.moves[1]]['val'] -= 1}
		opening_move_matrix[game.moves[0]][game.moves[1]]['total_games'] += 1
	}
	for (move1 in opening_move_matrix) {
		for (move2 in opening_move_matrix[move1]) {
			opening_move_matrix[move1][move2]['val'] /= opening_move_matrix[move1][move2]['total_games']
		
		}
	}
}
