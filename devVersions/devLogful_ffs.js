//for some fucked up reason chrome wouldn't let me inject this script if it contained words 'script' or 'inject' in its name (and it'd blame some extension, even if I had every other extension but this one deleted)

//I've tried, I've really tried to set up a port connection, but chrome's bullshit of not telling or explaining how their own shit works and making people guess and keep looking up problem after problem on Stack is just not worth the time to write it properly. Thus, I prefer to just send message events and filter them out on my own rather than waste time on their out-dated and lacking documentation.
//var port = chrome.runtime.connect();
// var port = chrome.runtime.connect({name: "injectedScript"}); //looks like chrome started requiring it at some point, but they never bothered to update the documentation? it also has to be an object and not a string (despite there being an overload accepting string only), cause it starts failing in dumb ways

window.addEventListener("message", function(event) {
	console.log("FFS_addEventListener_message");
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
		console.log(player.getVolume());
		  
		console.log("Injected script received: " + event.data.text + " (New volume value: " + player.getVolume() + ")");
		//port.postMessage(event.data.text);
		// port.postMessage({message: player.getVolume()});
		window.postMessage({ type: "FROM_INJECTED_SCRIPT", text: player.volume }); //so, why not player.getVolume()? as it turns out, youtube artificially limits the max volume on some louder videos, which can be discovered if you check HTML5's volume, as youtube's video api rounds it using their relative scale. player.volume may result in undefined, but it's fine, cause showToast checks for that and retrieves volume on its own
	}
}, false);


// chrome.runtime.onConnect.addListener(function(port) {
	// if (port.type && (port.type == "FROM_CONTENT_SCRIPT")) {
		// let player = document.querySelector('ytd-player').getPlayer();
		// var currentVolume = player.getVolume();
		// let step = 5;
		// if (port.text === "+")
			// if (currentVolume >= (100 - step))
				// player.setVolume(100);
			// else
				// player.setVolume(currentVolume + step);//volume up by step%
		// else if (port.text === "-")
			// if (currentVolume <= (0 + step))
				// player.setVolume(0);
			// else
				// player.setVolume(currentVolume - step);//volume down by step%
			
		// // port.postMessage({message: player.getVolume()});
		// port.postMessage(player.getVolume());
	// }
// }, false);