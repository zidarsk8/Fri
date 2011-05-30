$(document).ready(function(){
	$('#fullscreen').click(function(){
		
		$('#lesson05-canvas').addClass('fullscreen');
	});
	
	$(document).keypress(function(e){
	    console.log(e.which, "PRESSED");
		if(e.which == 0 || e.which == 102){
			$('#lesson05-canvas').toggleClass('fullscreen');
		}
		
	});
	
});
