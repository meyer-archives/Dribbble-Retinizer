if( window.chrome ){
	$('body').addClass('chrome');
	chrome.extension.sendRequest({method: "getPrefs"}, function(response) {
		console.log(response.prefs);
	});
} else {
	// TODO: Safari
}


$(function(){

	// Only add the loupe if this changes
	var oldDevicePixelRatio = 2;

	console.log('Check DPR');
	var checkDevicePixelRatioInterval = window.setInterval(function(){
		if( window.devicePixelRatio > oldDevicePixelRatio ){
			$(document).trigger('devicePixelRatioChange', ['retinaEnable']);
			console.log('devicePixelRatioChange retinaEnable');
		}
		if( window.devicePixelRatio < oldDevicePixelRatio ){
			$(document).trigger('devicePixelRatioChange', ['retinaDisable']);
			console.log('devicePixelRatioChange retinaDisable');
		}
		oldDevicePixelRatio = window.devicePixelRatio;
	},500); // check every half-second

	// These classes are misleading. Need to work
	var $shotContainer = $('.the-shot .single').addClass('retina-unavailable retina-off');

	// Base URL for shot images
	var $shotImage = $(".the-shot .single-img img").first().addClass('original');
	var shotImageURL = $shotImage.attr('src');
	var retinaShotVisible = false;

	if( window.chrome ){
		chrome.extension.sendRequest({"action": "imgUrl", "imgUrl": shotImageURL });

		// Pixel perfection babaaay
		chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
			if( request.action && request.action == 'imgData' ){
				$shotContainer.find('.single-img').append(
					// '<div class="crisp-shot">'+
						'<img class="crisp" src="' +
						request.data + '" height="' +
						request.height + '" width="' +
						request.width + '">'
					// +'</div>'
				);
			}
		});
	} else {
		// TODO: This needs to be fixed.
		safari.self.tab.dispatchMessage('imgUrl',{
			"imgUrl": shotImageURL
		});

		safari.self.addEventListener("message",function(e){
			if (e.name == "imgData"){
				$shotContainer.find('.single-img').append(
					// '<div class="crisp-shot">'+
						'<img class="crisp" src="' +
						e.message.data + '" height="' +
						e.message.height + '" width="' +
						e.message.width + '">'
					// +'</div>'
				);
			}
		},false);
	}

	// Check for attachments
	var $attachmentList = $shotContainer.find('.attachments ul li a');

	if ( $attachmentList.length ){
		// Add the retina toggle button
		$('<a class="toggle-2x real-deal" href="#">@2x</a>').appendTo($shotContainer.append(
			'<span class="toggle-2x fake" href="#">@2x</span>'
		)).click(
			function(){
				// 1x --> 2x
				if( retinaShotVisible ){
					$(document).trigger('hideRetinaShot');
				} else {
					$(document).trigger('showRetinaShot');
				}
				// retinaShotVisible = !retinaShotVisible;
				return false;
			}
		)

		// http://dribbble.s3.amazonaws.com/users/2014/screenshots/711633/styles02.png

		var index = shotImageURL.lastIndexOf("/");
		var baseImageURL = shotImageURL.substr(0,index+1);
		// http://dribbble.s3.amazonaws.com/users/2014/screenshots/711633/

		// We'll get this in the for loop
		var attachmentID = false;

		var shotName = shotImageURL.substr(index+1);
		// styles02.png

		// Dribbble crunches @ into _
		var shotName2x = shotName.slice(0, -4) + '_2x' + shotName.substr(-4);
		// styles02_2x.png

		$attachmentList.each(function(i){
			var $a = $(this);
			if ( !attachmentID )
				attachmentID = $a.attr('href').substr( $a.attr('href').lastIndexOf("/") + 1);

			if( $a.text() == shotName2x ){
				// We have a retina shot!
				console.log('We have a retina shot!');
				$shotContainer.removeClass('retina-unavailable');

				// This is kind of a nasty hack but whatever.
				var retinaShotURL = baseImageURL + 'attachments/' + attachmentID + '/' + shotName2x;

				var loupeVisible = false;
				// TODO: Conditional pixel perfect canvas magic for the loupe as well.
				$retinaLoupe = $('<div id="retina-loupe"><div style="background-image:url('+retinaShotURL+');"></div></div>').appendTo($shotContainer);//.hide();

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
									backgroundPosition: (75-mouseX*2+40)+'px '+(75-mouseY*2+40)+'px'
								});
							} else {
								if (loupeVisible)
									$shotContainer.addClass('loupe-hidden');
								loupeVisible = false;
							}
						})
					},
					function(){
						$(document).unbind('mousemove.retinaloupe');
					}
				);

				$(document).bind('devicePixelRatioChange', function(e,what){
					if(what == 'retinaDisable'){
						// Show dat loupe
						$(document).trigger('hideRetinaShot');
					}
					if(what == 'retinaEnable'){
						// Hide dat loupe
						$(document).trigger('showRetinaShot');
					}
				});

				// Add the retina image + container
				$shotContainer
					.children('.single-grid')
					.append(
						'<div class="retina-shot">'+
							'<img src="'+
							retinaShotURL+'" width="'+
							$shotImage.width()+'" height="'+
							$shotImage.height()+'">'+
						'</div>'
					);

				$(document)
				.bind('hideRetinaShot',function(){
					$shotContainer.removeClass('retina-on').addClass('retina-off');
					retinaShotVisible = false;
					// $shotImage.attr('src',shotImageURL);
				})
				.bind('showRetinaShot',function(){
					$shotContainer.removeClass('retina-off').addClass('retina-on');
					retinaShotVisible = true;
					// $shotImage.attr('src',attachmentURL);
				});

				if( !retinaShotVisible && window.devicePixelRatio == 2 ){
					$(document).trigger('showRetinaShot');
				}

				// Break the loop
				return false;
			}
		});
	}
});
