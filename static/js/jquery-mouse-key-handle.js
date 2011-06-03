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
    
	$(document).keydown(function(event) {
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
	  console.log("mouseDown");
	});
	
	$(document).mouseup(function (event) {
	  console.log("mouseUp");
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