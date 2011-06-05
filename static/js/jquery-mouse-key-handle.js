$(document).ready(function(){
	
    var prevent_default = true;
	var lastMouseX;
	var lastMouseY;
	
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
    
	$(document).keydown(function(event) {
//		console.log(event.keyCode);
		if(prevent_default){
			currentlyPressedKeys[event.keyCode] = true;
		}
	});

	$(document).keyup(function(event) {
		if(prevent_default){
			currentlyPressedKeys[event.keyCode] = false;
		}
	});

	$("#fri_walker_canvas").mousedown(function (event) {
	  mouseDown = true;
	  lastMouseX = event.clientX;
	  lastMouseY = event.clientY;
	});
	
	$(document).mouseup(function (event) {
	  mouseDown = false;
	});
	
	$(document).mousemove(function(event) {
	  if (!mouseDown) {
		  return;
	  }
	  var newX = event.clientX;
	  var newY = event.clientY;
	  var deltaX = newX - lastMouseX
	  var deltaY = newY - lastMouseY;
	  lastMouseX = newX
	  lastMouseY = newY;
	  pitch -= deltaY / 3
	  yaw -= deltaX / 3
	});
	
});