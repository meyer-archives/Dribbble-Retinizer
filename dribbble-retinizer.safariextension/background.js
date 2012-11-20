var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-35325621-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function loadImageIntoCanvas(src, tab) {
	var img = new Image();
	img.onload = function() {
		console.log('Image loaded: '+src);
		var cv1 = document.createElement('canvas');
		var ctx1 = cv1.getContext('2d');

		var cv2 = document.createElement('canvas');
		var ctx2 = cv2.getContext('2d');

		var zoom = 2; // Retinaaaaa!

		cv1.width = img.width;
		cv1.height = img.height;

		cv2.width = img.width * zoom;
		cv2.height = img.height * zoom;

		ctx1.clearRect(0,0,cv1.width,cv1.height);
		ctx1.drawImage(img,0,0,img.width,img.height);

		var imgData = ctx1.getImageData(0,0,img.width,img.height).data;

		ctx2.clearRect(0,0,cv2.width,cv2.height);
		for (var x=0;x<img.width;++x){
			for (var y=0;y<img.height;++y){
				var i = (y*img.width + x)*4;
				var r = imgData[i  ];
				var g = imgData[i+1];
				var b = imgData[i+2];
				var a = imgData[i+3];
				ctx2.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
				ctx2.fillRect(x*zoom,y*zoom,zoom,zoom);
			}
		}

		// TODO: Fix tab switching bug
		if( window.chrome ){
			chrome.tabs.sendRequest(
				tab.id,
				{
					action: "imgData",
					data:   cv2.toDataURL(),
					height: img.height,
					width:  img.width
				}
			);
		} else {
			// TODO: Debug the weirdness that this biz generates.
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(
				"imgData",
				{
					data:   cv2.toDataURL(),
					height: img.height,
					width:  img.width
				}
			);
		}
	};
	img.src = src;
}

if( window.chrome ){
	// Send canvas data back
	chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse){
		if(request.action){
			chrome.tabs.getSelected(null, function(tabs) {
				if (request.action == 'imgUrl') {
					loadImageIntoCanvas(request.imgUrl, tabs);
				}
				// chrome.tabs.sendRequest(tabs.id, { action: "response" });
			});
		}
	});

	// Sync prefs
	chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse) {
			if (request.method == "getPrefs")
				sendResponse({prefs: localStorage});
			else
				sendResponse({});
	});
} else {
	safari.application.addEventListener(
		"message",
		function(e) {
			console.log(e);
			if (e.name == "imgUrl") {
				loadImageIntoCanvas( e.message.imgUrl, e );
			}
		},
		false
	);
	
	// TODO: Sync prefs for Safari
}