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

	d3.select('body').append('svg')
		.attr('width', 1400).attr('height', 800)
		.attr('transform', 'translate(5,5)')

	d3.select('svg').append('g')
		.attr('transform', 'translate('+left_pad+','+(y_pad)+')')
		.attr('id', 'hm')
		.append('rect')
			.attr('width',hm_width)
			.attr('height',hm_height)
			.attr('fill','blue')
			.attr('opacity',0.12)


/***********************************************************************************\
|*                                                                                 *|
|*                                     HEATMAP                                     *|
|*                                                                                 *|	               
\***********************************************************************************/


 	/*-------------------------------------------------------------------------*\
	|*                            HEATMAP MOVE MATRIX                          *|
	\*-------------------------------------------------------------------------*/

	opening_move_matrix = {}
	white_move_domain = new Set()
	black_move_domain = new Set()

	for (game of chess_data) {
		//console.log(game.moves[0])
		white_move = game.moves[0], black_move = game.moves[1]
		white_move_domain.add(game.moves[0])
		black_move_domain.add(game.moves[1])
		if (typeof opening_move_matrix[white_move] === 'undefined') {
			opening_move_matrix[white_move] = {}
		}
		if (typeof opening_move_matrix[white_move][black_move] === 'undefined') {
			opening_move_matrix[white_move][black_move] = {
				'val': 0, 
				'total_games': 0, 
				'games_list': []
			}
		}
		opening_move_matrix[white_move][black_move]['total_games'] += 1
		opening_move_matrix[white_move][black_move]['games_list'].push(game)
		if (game.winner == 'white') {
			opening_move_matrix[white_move][black_move]['val'] += 1
		}
		else if (game.winner == 'black') {
			opening_move_matrix[white_move][black_move]['val'] -= 1
		}
	}

	for (white_move in opening_move_matrix) {
		for (black_move in opening_move_matrix[white_move]) {
			opening_move_matrix[white_move][black_move]['val'] /= opening_move_matrix[white_move][black_move]['total_games']
		}
	}
	
	white_move_domain = [...white_move_domain]
	black_move_domain = [...black_move_domain]

	flattened_move_matrix = []
	for (white_move of white_move_domain) {
		for (black_move of black_move_domain)
		{
			if (!(typeof opening_move_matrix[white_move][black_move] === 'undefined'))
			{
				flattened_move_matrix.push( {
					white_move:white_move,
					black_move:black_move,
					val:opening_move_matrix[white_move][black_move]['val'],
					games_count:opening_move_matrix[white_move][black_move]['total_games'],
					games:opening_move_matrix[white_move][black_move]['games_list']
				} )
			}
		}
	}

	/*-------------------------------------------------------------------------*\
	|*                               HEATMAP SCALES                            *|
	\*-------------------------------------------------------------------------*/

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
			.range([90,40])

	/*-------------------------------------------------------------------------*\
	|*                              HEATMAP CELLS                              *|
	\*-------------------------------------------------------------------------*/

	hm_squares = d3.select('#hm').selectAll('.hm_squares').data(flattened_move_matrix)

	hm_squares.enter().append('rect')
		.attr('class', 'hm_squares')
		.attr('x',d => hm_scale_x(d.white_move))
		.attr('y', d => hm_scale_y(d.black_move))
		.attr('width', hm_scale_x.bandwidth()).attr('height', hm_scale_y.bandwidth())
		.attr('fill', d => d3.lab(win_scale(d.val),0,0))

	cur_mode = "wins"


	/*-------------------------------------------------------------------------*\
	|*                              HEATMAP  AXES                              *|
	\*-------------------------------------------------------------------------*/

	d3.select('#hm').append('g')
			.attr('id', 'topaxis')
			.attr('transform', 'translate(0,'+(0)+')')
			.call(d3.axisTop(hm_scale_x))

	d3.select('#hm').append('g')
			.attr('id', 'leftaxis')
			.attr('transform', 'translate(0,'+(0)+')')
			.call(d3.axisLeft(hm_scale_y))

	/*-------------------------------------------------------------------------*\
	|*                           HEATMAP MODE BUTTON                           *|
	\*-------------------------------------------------------------------------*/

	d3.select('#hm').append('rect')
		.attr('id', 'hm_button')
		.attr('x', -40)
		.attr('y', -40)
		.attr('width', 30).attr('height',30)
		.attr('fill', d => d3.hcl(165,70,60))

	swap_hm = function () {
		hm_squares2 = d3.select('#hm').selectAll('.hm_squares')
		hm_button = d3.select('#hm_button')
		if (cur_mode == "wins") {
			hm_squares2.transition().duration(300)
				.attr('fill', d => d3.hcl(165,70,count_lum_scale(d.games_count)))
			hm_button.transition().duration(300)
				.attr('fill', d => d3.lab(win_scale(0),0,0))
			cur_mode = "count"
		}
		else if (cur_mode == "count") {
			hm_squares2.transition().duration(300)
				.attr('fill', d => d3.lab(win_scale(d.val),0,0))
			hm_button.transition().duration(300)
				.attr('fill', d => d3.hcl(165,70,60))
			cur_mode = "wins"
		}
	}

	hm_button = d3.select('#hm_button')
	hm_button.on('click', swap_hm);


/***********************************************************************************\
|*                                                                                 *|
|*	                                   ELO BARS                                    *|
|*                                                                                 *|	               
\***********************************************************************************/



// Cell Selection SVG
	var eloBar_width = 400;
	d3.select('svg').append('g').attr('transform', 'translate('+(1.5*left_pad+hm_width)+','+(y_pad)+')').attr('id', 'barELO').append('rect').attr('width',eloBar_width).attr('height',hm_height).attr('fill','blue').attr('opacity',0.15)

// Cell Selection Scales
	// each scale works the same for white and black players
	// white and black bars side by side in each bucket representing playertime

	//band scale for the y axis (ELO buckets)
		// Domain is from min to max ELO divided into segments (determine segments after seeing max & min)
		// Range is from min to max y value (top to bottom of eloBar)

	//linear scale for the x axis (each matchup's ELO distribution)
		// Domain is from 0 to 100% of players in each bucket
		// Range is from min to max x value (left to right of eloBar)

}

