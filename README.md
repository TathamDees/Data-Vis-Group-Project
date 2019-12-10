# Data-Vis-Group-Project
This project asks the question: what choices can chess players make to maximize their chance to win a chess game? 

To answer this question, we designed a data visualization that would allow users to study various opening chess moves and see likelihood of winning with respect to factors such as ELO (Player) ratings, chess color and win percentages.

The chess data was collected from over 20,000 chess games from LiChess, source: https://www.kaggle.com/datasnaek/chess

## Interactivity

The main way of interacting with our visualization is through the heatmap.

The user can hover over individual squares of the heatmap to select them, which will adjust the other visualizations (the info box, chess board, and ELO bar chart) to match the subset of data associated with the selected square.  In addition, the user may click on a square to "lock it in", which essentially disables the hover interaction while leaving the square selected, allowing the user to freely move their mouse without changing any of the other visualizations.  To return to the normal mode of hover interactivity, simply click on the selected square a second time.

In addition to the above, the user can press the "Switch Mode" button in the upper left to swap the heatmap coloring between a visualization of the number of games, and the outcomes of the games.


