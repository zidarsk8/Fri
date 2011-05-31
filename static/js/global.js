$(document).ready(function(){
	$('#fullscreen').click(function(){
		
		$('#lesson05-canvas').addClass('fullscreen');
	});
	
	$(document).keypress(function(e){
	    console.log(e.which, "PRESSED");
		if(e.which == 102){
			$('#lesson05-canvas').toggleClass('fullscreen');
		}
		
	});
	
	$('#tag-submit').click(function(){
	   var data = { 'name' : $('#tag-name').val(),
	                'description' : $('#tag-description').val(), 
	                'x' : xPos, 'y' : yPos, 'z': zPos 
	   };
	   
	   $.get('/api/v1/tags/add', data, function(d){
	        $('#tag-name').val("");
	        $('#tag-description').val("")
	   }, "json");
	    
	});
	
});
