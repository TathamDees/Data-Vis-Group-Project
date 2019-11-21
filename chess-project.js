function plot_it()  {


/***********************************************************************************\
|*                                                                                 *|
|*                                      SETUP                                      *|
|*                                                                                 *|	               
\***********************************************************************************/

	chess_data.forEach(d => {
		d.rated = Boolean(d.rated)
		d.turns = +d.turns
		d.white_rating = +d.white_rating
		d.black_rating = +d.black_rating
		d.moves = d.moves.split(" ")
	});

	var hm_width = 800, hm_height = 600;
	var left_pad = 40, right_pad = 40, y_pad = 40
	var hm_width = hm_width-(left_pad+right_pad), hm_height = hm_height-2*y_pad;

	d3.select('body').append('svg')
		.attr('width', 1400).attr('height', 1000)
		.attr('transform', 'translate(0,0)')
		// .append('rect')
		// 	.attr('fill','grey')
		// 	.attr('opacity',0.05)
		// 	.attr('width', 1.5*left_pad+hm_width+2.5*left_pad+hm_height/2.5+left_pad*3)
		// 	.attr('height', y_pad*4+hm_height+y_pad+hm_height/2.5-5)

	bg_color = d3.hcl(250,55,50)
	bg_opacity = 0.18

	BLACK_COLOR = d3.lab(20, 0,0)
	WHITE_COLOR = d3.lab(130,0,0)
	DRAW_COLOR = d3.lab(d3.mean([BLACK_COLOR.l,WHITE_COLOR.l]),0,0)

/***********************************************************************************\
|*                                                                                 *|
|*                                     HEATMAP                                     *|
|*                                                                                 *|	               
\***********************************************************************************/

	d3.select('svg').append('g')
		.attr('transform', 'translate('+left_pad+','+(y_pad)+')')
		.attr('id', 'hm')
		.append('rect')
			.attr('width',hm_width)
			.attr('height',hm_height)
			.attr('fill',bg_color)
			.attr('opacity',bg_opacity)

	/*-------------------------------------------------------------------------*\
	|*                             HEATMAP CONSTANTS                           *|
	\*-------------------------------------------------------------------------*/

	GAME_COUNT_LUM_RANGE  = [85,35]
	WIN_RATIO_COLOR_RANGE = [BLACK_COLOR.l,WHITE_COLOR.l]

 	/*-------------------------------------------------------------------------*\
	|*                            HEATMAP MOVE MATRIX                          *|
	\*-------------------------------------------------------------------------*/

	opening_move_matrix = {}
	white_move_domain = []
	black_move_domain = []

	for (game of chess_data) {
		white_move = game.moves[0], black_move = game.moves[1]

		white_move_domain.push(white_move)
		black_move_domain.push(black_move)

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

	white_move_domain = [...(new Set(white_move_domain))]
	black_move_domain = [...(new Set(black_move_domain))]

	flattened_move_matrix = []
	for (white_move of white_move_domain) {
		for (black_move of black_move_domain) {
			current_moves_info = opening_move_matrix[white_move][black_move]
			if (!(typeof current_moves_info === 'undefined')) {
				flattened_move_matrix.push( {
					white_move:white_move,
					black_move:black_move,
					val:current_moves_info['val'],
					games_count:current_moves_info['total_games'],
					games:current_moves_info['games_list']
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
			.range(WIN_RATIO_COLOR_RANGE)

	win_scale_axis = d3.scaleLinear()
			.domain([-1,1])
			.range([hm_height-1,1])

	count_lum_scale = d3.scaleLog().base(20)
			.domain([1,d3.max(flattened_move_matrix.map(d => d.games_count))]).nice()
			.range(GAME_COUNT_LUM_RANGE)

	count_lum_scale_axis = d3.scaleLog().base(20)
		.domain(count_lum_scale.domain())
		.range([hm_height-1,0])

	/*-------------------------------------------------------------------------*\
	|*                               HEATMAP COLORS                            *|
	\*-------------------------------------------------------------------------*/

	games_count_color = function(games_num) {
		return d3.hcl(170,60,count_lum_scale(games_num))
	}
	games_count_color.mid = function() {return d3.hcl(170,60,d3.mean(count_lum_scale.range()))}
	games_count_color.min = function() {return d3.hcl(170,60,count_lum_scale.range()[0])}
	games_count_color.max = function() {return d3.hcl(170,60,count_lum_scale.range()[1])}

	win_color = function(win_var) {
		return d3.lab(win_scale(win_var),0,0)
	}
	win_color.mid = function() {return d3.lab(d3.mean(win_scale.range()),0,0)}
	win_color.min = function() {return d3.lab((win_scale.range()[0]),0,0)}
	win_color.max = function() {return d3.lab((win_scale.range()[1]),0,0)}

	/*-------------------------------------------------------------------------*\
	|*                              HEATMAP CELLS                              *|
	\*-------------------------------------------------------------------------*/

	hm_squares = d3.select('#hm').selectAll('.hm_squares').data(flattened_move_matrix)

	hm_squares.enter().append('rect')
		.attr('class', 'hm_squares')
		.attr('x',d => hm_scale_x(d.white_move)).attr('width', hm_scale_x.bandwidth())
		.attr('y',d => hm_scale_y(d.black_move)).attr('height',hm_scale_y.bandwidth())
		.attr('fill', d => win_color(d.val))

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
	|*                              HEATMAP TITLE                              *|
	\*-------------------------------------------------------------------------*/




	/*-------------------------------------------------------------------------*\
	|*                           HEATMAP COLOR LEGEND                          *|
	\*-------------------------------------------------------------------------*/

	win_gradient = d3.select('#hm').append('linearGradient')
	            .attr('id', 'win_gradient')
	            .attr('x1', '0%')
	            .attr('y1', '100%')
	            .attr('x2', '0%')
	            .attr('y2', '0%')

	    win_gradient.append('stop')
	            .attr('offset', '0%')
	            .attr('stop-color', win_color.min())
	            .attr('stop-opacity', 1)
	    win_gradient.append('stop')
	            .attr('offset', '100%')
	            .attr('stop-color', win_color.max())
	            .attr('stop-opacity', 1)

	game_count_gradient = d3.select('#hm').append('linearGradient')
	            .attr('id', 'game_count_gradient')
	            .attr('x1', '0%')
	            .attr('y1', '100%')
	            .attr('x2', '0%')
	            .attr('y2', '0%')

	    game_count_gradient.append('stop')
	            .attr('offset', '0%')
	            .attr('stop-color', games_count_color.min())
	            .attr('stop-opacity', 1)
	    game_count_gradient.append('stop')
	            .attr('offset', '100%')
	            .attr('stop-color', games_count_color.max())
	            .attr('stop-opacity', 1)

	d3.select('#hm').append('g')
		.attr('id', 'color_legend_group')
		.attr('transform', 'translate('+(hm_width+left_pad/2)+',0)')
		.append('rect')
			.attr('id', 'color_legend')
			.attr('width', (left_pad))
			.attr('height',(hm_height))
			.attr('fill','url(#win_gradient)')
			//.attr('stroke','blue')

	d3.select('#color_legend_group').append('g')
			.attr('id', 'rightaxis')
			.attr('transform', 'translate('+(y_pad)+',0)')
			.call(d3.axisRight(win_scale_axis).tickFormat(d => {
				if (d == 1) {return "1:0"}
				else if (d == -1) {return "0:1"}
				else if (d == 0) {return "1:1"}
				else {return ""}
			}))

	/*-------------------------------------------------------------------------*\
	|*                           HEATMAP MODE BUTTON                           *|
	\*-------------------------------------------------------------------------*/	
	
	d3.select('#hm').append('polygon')
		.attr('id', 'hm_button')
		.attr('points', (-left_pad-5)+","+(-y_pad-5)+" 10,"+(-y_pad-5)+" "+(-left_pad-5)+",10")
		.attr('fill', games_count_color.mid())

	d3.select('#hm').append('text')
		.attr('id', 'hm_button_label')
		.text('Switch Mode')
		.attr('pointer-events', 'none')
		.attr('x', (0)).attr('y',(-14.5))
		.attr('font-size', 11.8)
		.attr('text-anchor', 'middle')
		.attr('transform', 'rotate(-45)')

	swap_hm = function () {
		hm_squares2 = d3.select('#hm').selectAll('.hm_squares')
		hm_button = d3.select('#hm_button')
		color_legend = d3.select('#color_legend')
		color_legend_axis = d3.select('#color_legend_group').select('#rightaxis')
		if (cur_mode == "wins") {
			hm_squares2.transition().duration(300)
				.attr('fill', d => games_count_color(d.games_count))
			hm_button.transition().duration(300)
				.attr('fill', win_color.mid())
			color_legend
				.attr('fill', d => 'url(#game_count_gradient)')
			color_legend_axis
				.call(d3.axisRight(count_lum_scale_axis))
			cur_mode = "count"
		}
		else if (cur_mode == "count") {
			hm_squares2.transition().duration(300)
				.attr('fill', d => win_color(d.val))
			hm_button.transition().duration(300)
				.attr('fill', games_count_color.mid())
			color_legend
				.attr('fill', d => 'url(#win_gradient)')
			color_legend_axis
				.call(d3.axisRight(win_scale_axis).tickFormat(d => {
					if (d == 1) {return "1:0"}
					else if (d == -1) {return "0:1"}
					else if (d == 0) {return "1:1"}
					else {return ""}
				}))
			cur_mode = "wins"
		}
	}

	hm_button = d3.select('#hm_button')
	hm_button.on('click', swap_hm);


//TO-DO: 
//       -ADD LABELS FOR EVERYTHING RELATED TO THE HEATMAP
//		 -MAKE STUFF HAPPEN WHEN THE HEATMAP CELLS ARE HOVERED OVER

/***********************************************************************************\
|*                                                                                 *|
|*	                                   ELO BARS                                    *|
|*                                                                                 *|	               
\***********************************************************************************/
// alternate elo width : hm_width+left_pad*3+hm_width/2.5
// Cell Selection SVG
	var elo_bars_height = hm_width/2.5//400;
	d3.select('svg').append('g')
		.attr('transform', 'translate('+(left_pad)+','+(y_pad*2+hm_height)+')')
		.attr('id', 'elo_bars')
		.append('rect')
			.attr('width',hm_width+left_pad*1.5)
			.attr('height',elo_bars_height)
			.attr('fill',bg_color)
			.attr('opacity',bg_opacity)

// Cell Selection Scales
	// each scale works the same for white and black players
	// white and black bars side by side in each bucket representing playertime

// FOR BUCKETS, MAKE THEM 100 EACH, MIN IS 701 MAX IS 2700 
//        (I.E. [701-800,801-900,...,2501-2600,2601-2700])

	//band scale for the y axis (ELO buckets)
		// Domain is from min to max ELO divided into segments (determine segments after seeing max & min)
		// Range is from min to max y value (top to bottom of eloBar)

	//linear scale for the x axis (each matchup's ELO distribution)
		// Domain is from 0 to 100% of players in each bucket
		// Range is from min to max x value (left to right of eloBar)


/***********************************************************************************\
|*                                                                                 *|
|*	                                   INFO BOX                                    *|
|*                                                                                 *|	               
\***********************************************************************************/


	var info_box_width = hm_width/2.5//400;
	d3.select('svg').append('g')
		.attr('transform', 'translate('+(1.5*left_pad+hm_width+2.5*left_pad)+','+(y_pad)+')')
		.attr('id', 'info_box')
		.append('rect')
			.attr('width',info_box_width)
			.attr('height',hm_height)
			.attr('fill',bg_color)
			.attr('opacity',bg_opacity)

//TO-DO:
//       -FIGURE OUT WHAT INFO TO INCLUDE
//             (I.E. OPENING NAMES, TOTAL GAMES PLAYED, AVERAGE NUMBER OF MOVE BEFORE END OF GAME, ...?)
//		 -MAKE DICTIONARY TO GET OPENING NAME FROM OPENING_ECO (OR FROM MOVES PLAYED)
//		 -MAKE CHART DISPLAYING RELATIVE BLACK VICTORIES, WHITE VICTORIES, DRAWS (BAR CHART? PIE CHART?)
//       -LABELS AND SUCH


/***********************************************************************************\
|*                                                                                 *|
|*	                                  CHESS BOARD                                  *|
|*                                                                                 *|	               
\***********************************************************************************/


	var chess_board_len = hm_width/2.5//400;
	d3.select('svg').append('g')
		.attr('transform', 'translate('+(1.5*left_pad+hm_width+2.5*left_pad)+','+(y_pad*2+hm_height)+')')
		.attr('id', 'info_box')
		.append('rect')
			.attr('width',chess_board_len)
			.attr('height',chess_board_len)
			.attr('fill',bg_color)
			.attr('opacity',bg_opacity)

//TO-DO: 
//       -MAKE IT LOOK LIKE A CHESS BOARD
//		 -FIGURE OUT HOW TO DISPLAY PIECES
//		 -MAKE WAY FOR PIECES TO MOVE PROPERLY
}

