//for some fucked up reason chrome wouldn't let me inject this script if it contained words 'script' or 'inject' in its name (and it'd blame some extension, even if I had every other extension but this one deleted)

window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window)
		return;

	if (event.data.type && (event.data.type == "FROM_CONTENT_SCRIPT")) {
		let player = document.querySelector('ytd-player').getPlayer();
		var currentVolume = player.getVolume();
		let step = 5;
		if (event.data.text === "+")
			if (currentVolume >= (100 - step))
				player.setVolume(100);
			else
				player.setVolume(currentVolume + step);//volume up by step%
		else if (event.data.text === "-")
			if (currentVolume <= (0 + step))
				player.setVolume(0);
			else
				player.setVolume(currentVolume - step);//volume down by step%
			
		window.postMessage({ type: "FROM_INJECTED_SCRIPT", text: player.volume }); //so, why not player.getVolume()? as it turns out, youtube artificially limits the max volume on some louder videos, which can be discovered if you check HTML5's volume, as youtube's video api rounds it using their relative scale. player.volume may result in undefined, but it's fine, cause showToast checks for that and retrieves volume on its own
	}
}, false);