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

	var hm_width = 800, hm_height = 600;
	var left_pad = 40, right_pad = 40, y_pad = 40
	var hm_width = hm_width-(left_pad+right_pad), hm_height = hm_height-2*y_pad;
	d3.select('body').append('svg').attr('width', 1400).attr('height', 800).attr('transform', 'translate(5,5)')
	d3.select('svg').append('g').attr('transform', 'translate('+left_pad+','+(y_pad)+')').attr('id', 'hm').append('rect').attr('width',hm_width).attr('height',hm_height).attr('fill','blue').attr('opacity',0.12)

	opening_move_matrix = {}
	white_move_domain = []
	black_move_domain = []
	for (game of chess_data) {
		//console.log(game.moves[0])
		if (typeof opening_move_matrix[game.moves[0]] === 'undefined') {
			opening_move_matrix[game.moves[0]] = {}
		}
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
	for (white_move in opening_move_matrix) {
		white_move_domain.push(white_move)
		for (black_move in opening_move_matrix[white_move]) {
			opening_move_matrix[white_move][black_move]['val'] /= opening_move_matrix[white_move][black_move]['total_games']
			if (white_move == white_move_domain[0]) {black_move_domain.push(black_move)}
		}
	}

	flattened_move_matrix = white_move_domain.map(d => {white_move = d; return black_move_domain.map(d => {black_move = d; return {white_move:white_move,black_move:black_move,val:opening_move_matrix[white_move][black_move]['val'],games_count:opening_move_matrix[white_move][black_move]['total_games']}})}).flat()

	hm_scale_x = d3.scaleBand()
			.domain(white_move_domain)
			.range([0,hm_width]).paddingInner(0.15).paddingOuter(0.15)

	hm_scale_y = d3.scaleBand()
			.domain(black_move_domain)
			.range([0,hm_height]).paddingInner(0.15).paddingOuter(0.15)

	win_scale = d3.scaleLinear()
			.domain([-1,1])
			.range([20,130])

	count_lum_scale = d3.scaleLog().base(25)
			.domain([1,d3.max(flattened_move_matrix.map(d => d.games_count))])
			.range([85,40])


	hm_squares = d3.select('#hm').selectAll('.hm_squares').data(flattened_move_matrix)


	hm_squares.enter().append('rect')
		.attr('x',d => hm_scale_x(d.white_move))
		.attr('y', d => hm_scale_y(d.black_move))
		.attr('width', hm_scale_x.bandwidth()).attr('height', hm_scale_y.bandwidth())
		.attr('fill', d => d3.lab(win_scale(d.val),0,0))
		.attr('opacity',d => {if (isNaN(d.val)) {return 0} else {return 100}}) 

// Heatmap by game count

/*
	hm_squares.enter().append('rect')
		.attr('x',d => hm_scale_x(d.white_move))
		.attr('y', d => hm_scale_y(d.black_move))
		.attr('width', hm_scale_x.bandwidth()).attr('height', hm_scale_y.bandwidth())
		.attr('fill', d => d3.hcl(152,70,count_lum_scale(d.games_count)))
		.attr('opacity',d => {if (isNaN(d.val) || d.games_count == 0) {return 0} else {return 100}}) */

	d3.select('#hm').append('g')
			.attr('id', 'topaxis')
			.attr('transform', 'translate(0,'+(0)+')')
			.call(d3.axisTop(hm_scale_x))

	d3.select('#hm').append('g')
			.attr('id', 'leftaxis')
			.attr('transform', 'translate(0,'+(0)+')')
			.call(d3.axisLeft(hm_scale_y))

}
