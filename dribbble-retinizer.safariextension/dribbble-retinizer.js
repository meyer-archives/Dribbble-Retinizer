if( window.chrome ){
	$('body').addClass('chrome');
	chrome.extension.sendRequest({method: "getPrefs"}, function(response) {
		console.log(response.prefs);
	});
} else {
	// TODO: Safari
}

$(function(){
	var $shotContainer = $('.the-shot .single').addClass('retina-unavailable');
	var $shotImage = $(".the-shot .single-img img").first().addClass('original');
	var retinaShotURL = $('.twotimes').attr('href');

	console.log('Retina shot URL: '+retinaShotURL);

	if( retinaShotURL === undefined )
		return false;

	// We have a retina shot!
	$shotContainer.removeClass('retina-unavailable');

	var img = new Image();
	img.src = retinaShotURL;
	img.onload = function() {

		// Center the background image. Not sure how important this is anymore?
		var bkgOffsetX = img.width/2 < 400 ? Math.ceil((400-img.width/2)/2) : 0;
		var bkgOffsetY = img.height/2 < 300 ? Math.ceil((300-img.height/2)/2) : 0;

		var loupeVisible = false;
		// TODO: Conditional pixel perfect canvas magic for the loupe as well.

		$retinaLoupe = $('<div id="retina-loupe"><div style="background-image:url('+retinaShotURL+');"></div></div>').appendTo($shotContainer);

		// Hide loupe if page is inactive
		function handleVisibilityChange() {
			if (document.webkitHidden) {
				console.log('hide loupe!!');
				$shotContainer.addClass('loupe-hidden');
			} else {
				console.log('show loupe maybe!!');
			}
		}

		document.addEventListener("webkitvisibilitychange", handleVisibilityChange, false);

		$shotContainer.addClass('loupe-hidden').hover(
			function(){
				$(document).bind('mousemove.retinaloupe',function(e){
					var os = $shotContainer.offset();
					var mouseX = e.pageX-os.left;
					var mouseY = e.pageY-os.top;
					if(
						mouseX >= 0 &&
						mouseX <= 440 &&
						mouseY >= 0 &&
						mouseY <= 340
					){
						if (!loupeVisible)
							$shotContainer.removeClass('loupe-hidden');
						loupeVisible = true;

						// We're in bidness
						$retinaLoupe.css({
							left: mouseX,
							top: mouseY
						}).children('div').css({
							backgroundPosition: (75-mouseX*2+40+bkgOffsetX)+'px '+(75-mouseY*2+40+bkgOffsetY)+'px'
						});
					} else {
						if (loupeVisible)
							$shotContainer.addClass('loupe-hidden');
						loupeVisible = false;
					}
				})
			},
			function(){
				// $(document).unbind('mousemove.retinaloupe');
			}
		);

		// Break the loop
		return false;
	}
});