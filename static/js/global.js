$(document).ready(function(){
	$('#fullscreen').click(function(){
		
		$('#lesson05-canvas').addClass('fullscreen');
	});
	prevent_default = true;
	$(document).keydown(function(e){
	    //console.log(e.which, "PRESSED");
	    
	    if(prevent_default && e.which != 116){ //116 == F5
	        e.preventDefault();    
	        
	    }
	    else return;
	    
		if(e.which == 102){
			$('#lesson05-canvas').toggleClass('fullscreen');
		}
		
	});
	$('input').blur(function(){
        prevent_default = true;
    }).focus(function() {                
        prevent_default = false;
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
	        //console.log(d);
	        $.each(d, function(i, e){
	            var position = "["+e.x+","+e.y+","+e.z+"]"
	            $('#tag-list').append('<li class="tagy" xyz = "'+position+'" id = "tag-'+ e.name +'">' + e.name + '</li>');
	        });
	        
	        $('.tagy').click(function(e){
	            starPosition =  $.parseJSON($(e.currentTarget).attr('xyz'));
	        });
	    });
	}
	getTags();
	
});
