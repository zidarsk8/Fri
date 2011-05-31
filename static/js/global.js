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
	        $('#tag-description').val("");
	        getTags();
	   }, "json");
	    
	});
	
	$('#tag-search').keyup(function(){
	    
	    getTags();
	});   
	
	function getTags(){	    
	    data = {'name':$('#tag-search').val()}
	    
	    $.get('/api/v1/tags/list',data, function(d){
	        $('#tag-list').html("");
	        console.log(d);
	        $.each(d, function(i, e){
	            $('#tag-list').append('<li>' + e.name + '</li>');
	        });
	    });
	}
	getTags();
	
});
