$(document).ready(function(){
	$('#fullscreen').click(function(){
		
		$('#lesson05-canvas').addClass('fullscreen');
	});
	
	$(document).keypress(function(e){
		if(e.which == 0){
			$('#lesson05-canvas').removeClass('fullscreen');
		}
		
	});
	
});