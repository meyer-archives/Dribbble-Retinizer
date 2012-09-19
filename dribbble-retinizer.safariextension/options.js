$(function(){
	// var bkg = chrome.extension.getBackgroundPage();
	console.log(localStorage["retina_by_default"]);

	$("#retina-by-default").prop("checked",localStorage["retina_by_default"]);

	$('#save-button').click(function(){
		$button = $(this);
		localStorage["retina_by_default"] = $("#retina-by-default").prop("checked");

		console.log(localStorage["retina_by_default"]);

		$button.text('Saved!!!!!!!!!!!');

		setTimeout(function() {
			$button.text('Save');
		}, 1000);
	});
});