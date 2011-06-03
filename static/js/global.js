$(document).ready(function(){
    prevent_default = true;
	
	$('#fullscreen').click(function(){
		$('#fri_walker_canvas').addClass('fullscreen');
	});
	
	$(document).keydown(function(e){
	    if(prevent_default && e.which != 116){ //116 == F5
	        e.preventDefault();    
	    }
		if(e.which == 102){
			$('#fri_walker_canvas').toggleClass('fullscreen');
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
	                'x' : xPos, 
					'y' : yPos, 
					'z': zPos 
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
	    var data = {'name':$('#tag-search').val()}
	    
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
	
var tooltip = $('<div></div>')
      .text('Your message here')
      .css({
            position: 'absolute',
            display: 'none',
            border: '1px solid black',
            background: 'blue',
            color: 'white'
      });
$('tag-submit').mouseenter(function(){
      tooltip
            .css({
                  top: $(this).position().top,
                  left: $(this).position().left
            })
            .fadeIn('slow');
})
.mouseleave(function(){
      tooltip.fadeOut('slow');
});


});
