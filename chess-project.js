function plot_it()  {
	
	chess_data.forEach(d => {
		d.rated = Boolean(d.rated)
		d.turns = +d.turns
		d.white_rating = +d.white_rating
		d.black_rating = + d.black_rating
		d.moves = d.moves.split(" ")
	});

	opening_move_matrix = {}
	for game in chess_data {
		game.moves[0]
	}
	{
		similarity_matrix.push([])
		for (j = 0; j < sentence.length; j++)
		{
			dot_product = 0
			for (dimension of lstm_states)
			{
				dot_product += dimension[i]*dimension[j]
			}
			similarity_matrix[i].push(dot_product)
		}
	}

}
