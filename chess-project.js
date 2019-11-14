function plot_it()  {
	
	chess_data.forEach(d => {
		d.rated = Boolean(d.rated)
		d.turns = +d.turns
		d.white_rating = +d.white_rating
		d.black_rating = + d.black_rating
		d.moves = d.moves.split(" ")
	});

}
