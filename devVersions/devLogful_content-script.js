let settings = {
    "triggerTop": 10,
    "triggerLeft": 5,
    "triggerRight": 5,
    "triggerBottom": 50,

    "hotkey": null,
    "useHotkey": false
}
let areControlsHidden = false;
let hasExtensionBeenBootstrapped = false;

let statTopHeight = 0;
let statBotHeight = 0;

let timeoutFunc; //need global var to know if a toast timer has already been created and fired (as to kill it and create anew)

let i = 0;

const isHover = e => e.parentElement.querySelector(':hover') === e;    

// browser.storage.local.get(settings).then(function(res) {
    // for (let value in res) {
        // settings[value] = res[value] || settings[value];
    // }
// });

// browser.storage.onChanged.addListener(function(changes) {
    // for (let value in changes) {
        // settings[value] = changes[value].newValue;
    // }
// });

function getPlayerElement(getDirect) {
	if (i > 8 && i < 11)
		console.log("getPlayerElement");
	// if (getDirect === true)
		// return document.getElementsByTagName("ytd-player")[0].getPlayer(); //document.getElementsByClassName("video-stream")
    for (let player of document.getElementsByTagName("video")) {
        if (player.offsetParent != null) {
			if (getDirect === true)
				return player;
			else
				return player.parentElement.parentElement; //player.parentElement.parentElement.wrappedJSObject;
        }
    }

    return null;
}

function getPlayerBottomElement() {
	return document.getElementsByClassName('ytp-chrome-bottom')[0];
}

function getPlayerTopElement() {
	return document.getElementsByClassName('ytp-title')[0];
}

function isFullscreen() {
	if (i > 8 && i < 11)
		console.log(`isFullscreen [docFS:${document.fullscreen}, docFsElem:${document.fullscreenElement}]`);
    return !!document.fullscreenElement; //why not just document.fullscreen?
}

function hideControls(hideCursor) {
	console.log("hideControls");
    let player = getPlayerElement(); //player.clientHeight clientWidth offsetHeight offsetWidth scrollHeight scrollWidth          onkeypress onfullscreenchange onfullscreenerror
	let htmlElemBottom = getPlayerBottomElement();
	//debugger;
	htmlElemBottom.setAttribute("hidden", "true");
	let htmlElemTop = getPlayerTopElement();
	htmlElemTop.setAttribute("hidden", "true");

    if (player) {
        //player.hideControls();
		if (!hideCursor)
			player.style.cursor = "none";
		//player.controls = 0;
        areControlsHidden = true;
    }
}

function showControls() {
	console.log("showControls");
    let player = getPlayerElement();
	let htmlElemBottom = getPlayerBottomElement(); //from chrome errors logs it seems this not always returns the element?
	//debugger;
	htmlElemBottom.removeAttribute("hidden"); //for some reason it only sets it to false instead of removing
	let htmlElemTop = getPlayerTopElement();
	htmlElemTop.removeAttribute("hidden");

    if (player) {
        //player.showControls();
        player.style.cursor = "";
		//player.controls = 1;
        areControlsHidden = false;
    }
}

function onFullscreenChanged() { //consider adding check if video player is present to avoid firing at yt homepage etc
	console.log("onFullscreenChanged");
	
	try {
		if (isFullscreen()) {
			showControls(); //looks like these may be already hidden somehow, and we can't let them be hidden if we are to read their heights //TODO: could most likely get rid of this line with enough time invested, but for now it's safer to keep it
			tryUpdateHeights();
			hideControls(true);
		}
		else {
			showControls();
		}
	}
	catch (e) {
		console.log("DOUBLE WTF!" + e);
		alert("DOUBLE WTF!" + e);
	}
}

function tryUpdateHeights() {
	try {
		if (statTopHeight === 0) { //no idea why title bar behaves differently to controls bar
			statTopHeight = getPlayerTopElement().clientHeight;
			console.log(`botHeightStat: ${statBotHeight}, topHeightStat: ${statTopHeight}`);
		}
		
		let botHeight = getPlayerBottomElement().clientHeight;
		if (statBotHeight === 0 || (botHeight != 0 && botHeight > 10 && botHeight != statBotHeight)) {
			statBotHeight = botHeight;
			console.log(`botHeightStat: ${statBotHeight}, topHeightStat: ${statTopHeight}`);
		}
		
		
		if (statBotHeight === 0 && statTopHeight === 0) {
			alert(`botHeightStat: ${statBotHeight}, topHeightStat: ${statTopHeight}`);
			debugger;
		}
	}
	catch (e) {
		console.log("WTF!" + e);
		alert("WTF!" + e);
	}
}

function onVideoMouseMove(e) {
	i++;
	if (i > 8 && i < 11)
		console.log("addEventListener_mousemove");
	//debugger;
	if (!isFullscreen() || (statBotHeight === 0 && statTopHeight === 0)) { //not sure if this check should be here already or at mouseIsInMenusZone... I guess no additional show/hide code should be executed, but dunno if this func will grow and in what direction
		if (i > 10)
			i = 0;
		return;
	}
	if (i == 10)
		console.log(`Width:${document.documentElement.clientWidth} Height:${document.documentElement.clientHeight}\nclientX:${e.clientX} clientY:${e.clientY}`);
	
	let htmlElemBottom = getPlayerBottomElement();
	let htmlElemTop = getPlayerTopElement();
	
	let mouseIsInMenusZone = (e.clientY <= statTopHeight //mouse Y position hovers over top bar		// (statBotHeight === 0 || statTopHeight === 0) ||  //can't trigger (be in zone) if heights haven't been read
			|| (document.documentElement.clientHeight - statBotHeight - 20) <= e.clientY); //mouse Y position hovers over bottom bar [-20 as a breather for video progress bar (might consider changing it to 2.5-3% of document.documentElement.clientHeight)]
			
	if (i >= 10) {
		console.log(`[e.clientY ${e.clientY}] <= [statTopHeight ${statTopHeight}] == ${e.clientY <= htmlElemBottom.clientHeight}`);
		console.log(`[document.documentElement.clientHeight ${document.documentElement.clientHeight}] - [statBotHeight ${statBotHeight}] - [20] >= [e.clientY ${e.clientY}] == ${(document.documentElement.clientHeight - statBotHeight - 20) <= e.clientY}`);
		console.log(`mouseIsInMenusZone: ${mouseIsInMenusZone}; botHeight: ${htmlElemBottom.clientHeight}, topHeight: ${htmlElemTop.clientHeight}; botHeightStat: ${statBotHeight}, topHeightStat: ${statTopHeight}; clientY: ${e.clientY}`);
		i = 0;
	}
	
	if (!mouseIsInMenusZone) {
		if (statBotHeight === 0 || statTopHeight === 0) {
			alert(`Triggered hiding even though it should not be done! botHeightStat: ${statBotHeight}, topHeightStat: ${statTopHeight}`);
			debugger;
		}
		hideControls();
	}
	else if (mouseIsInMenusZone) {
		showControls();
	}
}

//this triggers even at going fullscreen, document doesn't work here, it's just not worth it in its current form atm
// window.addEventListener('resize', function() {
	// console.log("addEventListener_resize");
	// statTopHeight = 0;
	// statBotHeight = 0;
// });

//currently unused, but keeping for future improvements
function handleKeypress(e) {
	console.log("addEventListener_keypress");
    let hotkeyOk = settings.useHotkey && settings.hotkey
        && settings.hotkey.shiftKey == e.shiftKey
        && settings.hotkey.ctrlKey == e.ctrlKey
        && settings.hotkey.metaKey == e.metaKey
        && settings.hotkey.altKey == e.altKey
        && settings.hotkey.code == e.code;

    if (isFullscreen() && hotkeyOk) {
        if (areControlsHidden) {
            showControls();
        }
        else {
            hideControls();
        }
    }
}

function showToast(message) {
	console.log("showToast");
	console.log("First volume: " + message);
	if (!message)
		message = getPlayerElement(true).volume;
	console.log("2nd volume: " + message);
	
	var toast = document.getElementById("snackbar");
	toast.innerHTML = message;
	// Add the "show" class to DIV
	toast.className = "show";

	if (timeoutFunc)
		clearTimeout(timeoutFunc);
	// After a second, remove the show class from DIV
	timeoutFunc = setTimeout(function() { toast.className = toast.className.replace("show", ""); }, 1000);

	//wish this worked ;_;
	// var youtubeToast = document.getElementsByClassName("ytp-bezel")[0];
	// youtubeToast.setAttribute('aria-label', message + "percent"); //should be  * 100 and rounded or get value from yt player
	// youtubeToast.parentElement.style = null;
	// setTimeout(function() { youtubeToast.parentElement.style = "display: none;"; }, 1000);
}

function messageEventHandler(e) {
	if (e.data.type && (e.data.type == "FROM_INJECTED_SCRIPT")) {
		showToast(e.data.text);
	}
}

function ffs() {
	debugger;
	let a = document.getElementsByTagName("ytd-player")[0];
	a = document.querySelector('ytd-player').getPlayer();
}

function hasVideoEnded(video) { //might consider adding here some tolerance (but it'd have to be like 5s max tolerance for most videos (since you can seek forward by 5s and end video 'prematurely'), but then again gotta watch out for very short videos). There's also an option to use yt's api [player.getPlayerState() === 0], and since I already have this injecting thing set up, this wouldn't be as annoying to implement... just sendMsg to injected script, have it use api, then sendMsg back here, then read it... ugh
	if (!video)
		video = document.querySelector('video');
	// return video.getCurrentTime() === video.getDuration(); //worked in console, didn't work in script
	return video.currentTime === video.duration;
}

function isVideoPaused(video) {
	if (!video)
		video = document.querySelector('video');
	return video.paused;
}

//allow changing volume when mouse is hovering over video player and ctrl or alt keys are not pressed
function onMouseWheel(e) {
	var hasVolumeChanged = false;
	if (e.ctrlKey === false && e.altKey === false && !hasVideoEnded() && (!isVideoPaused() || isFullscreen())) { //TODO: add !(isHover === ytp-volume-slider) area? add like 10% time tolerance for hasVideoEnded?
		let player = getPlayerElement(true);
		let step = 0.05;
		let delta = Math.sign(e.wheelDelta);
		
		//ffs();
		// if (delta > 0) //so this version does not update youtube volume, but it DOES update video volume... unfortunately, this is not a solution, since yt for some reason at some random moments updates volume back to its own value
			// if (player.volume >= (1 - step))
				// player.volume = 1;
			// else
				// player.volume += step;//volume up by step%
		// else if (delta < 0)
			// if (player.volume <= (0 + step))
				// player.volume = 0;
			// else
				// player.volume -= step;//volume down by step%
		// console.log(player.volume);
			
		var volumeMessage = (delta > 0) ? "+" : "-";
		console.log(getPlayerElement(true).volume); //shows the same value as below
		window.postMessage({ type: "FROM_CONTENT_SCRIPT", text: volumeMessage }, "*");
		// port.postMessage({ type: "FROM_CONTENT_SCRIPT", text: volumeMessage }, "*");
		hasVolumeChanged = true;
		console.log(getPlayerElement(true).volume); //shows the same value as above
		
		showToast(getPlayerElement(true).volume); //as it appears, using yt's api to set volume does not mean that the volumeAfterChange toast msg displays, so I have to do it manually
		
//code for dynamic js script injecting (not sure how to properly pass args there though)
// var actualCode = '(' + function() {
// let player = document.querySelector('ytd-player').getPlayer();
// console.log(player);
// console.log(player.getVolume());
// let step = 5;
// let delta = Math.sign(e.wheelDelta);
// delta = 1;
// console.log(delta);
// var currentVolume = player.getVolume();
// //player.setVolume(50);//volume down by step%
// if (delta > 0)
	// if (currentVolume >= (100 - step))
		// player.setVolume(100);
	// else
		// player.setVolume(currentVolume + step);//volume up by step%
// else if (delta < 0)
	// if (currentVolume <= (0 + step))
		// player.setVolume(0);
	// else
		// player.setVolume(currentVolume - step);//volume down by step%
// console.log(player.getVolume());
// } + ')();';
// var script = document.createElement('script');
// script.textContent = actualCode;
// (document.head||document.documentElement).appendChild(script);
// script.remove();

		// if (delta > 0)
			// if (player.getVolume() >= (1 - step))
				// player.setVolume(1);
			// else
				// player.setVolume(player.getVolume() + step);//volume up by step%
		// else if (delta < 0)
			// if (player.getVolume() <= (0 + step))
				// player.setVolume(0);
			// else
				// player.setVolume(player.getVolume() - step);//volume down by step%
		console.log(player.volume);
		
		//possible TODO: as it appears, using yt's api to set volume does not mean that the volumeAfterChange toast msg displays, so I'd have to do it manually, but that'd require some css... eh
	}
	if (hasVolumeChanged || (isFullscreen() && e.ctrlKey === false && e.altKey === false)) {
		//e.stopPropagation(); //this doesn't stop yt from scrolling
		e.preventDefault(); //maybe in future this could be decided by settings (for non-fullscreen, at least)
	}
}

let port; //I've tried, I've really tried to set up a port connection, but chrome's bullshit of not telling or explaining how their own shit works and making people guess and keep looking up problem after problem on Stack is just not worth the time to write it properly
//youtube doesn't reload a page when you navigate around, but rather, it "replaces the history state", thus in order to start the code at the right place, this came to be. More info at https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-html-before-page-is-rendered
function bootstrapTheExtension() {
    var player = getPlayerElement();
	if (player && !hasExtensionBeenBootstrapped) {
// chrome.runtime.onConnect.addListener("wtf");
	
		window.addEventListener("message", messageEventHandler);
	
// port = chrome.runtime.connect({name: "injectedScript"});
// port.onMessage.addListener(showToast);

	// chrome.runtime.onConnect.addListener(function(port) {
  // console.assert(port.name == "knockknock");
  // port.onMessage.addListener(function(msg) { });
// });

		//https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script
		var s = document.createElement('script');
		s.src = chrome.runtime.getURL('ffs.js'); //for some fucked up reason chrome wouldn't let me inject this script if it contained words 'script' or 'inject' in its name (and it'd blame some extension, even if I had every other extension but this one deleted)
		s.onload = function() {
			this.remove();
		};
		(document.head || document.documentElement).appendChild(s);

		//in case chrome fucks up again and won't let css through manifest's css
		// var style = document.createElement('link');
		// style.rel = 'stylesheet';
		// style.type = 'text/css';
		// style.href = chrome.runtime.getURL('toast.css');
		// (document.head || document.documentElement).appendChild(style);
	
		var toast = document.createElement('div');
		toast.id = "snackbar";
		document.getElementById("player-container").appendChild(toast); //we aim at <div id="player-container" /> and getPlayer() hardly does that

		onFullscreenChanged();
		document.addEventListener("fullscreenchange", onFullscreenChanged); //onfullscreenchange
		document.addEventListener("fullscreenerror", onFullscreenChanged); //onfullscreenerror

		getPlayerElement().addEventListener("mousemove", onVideoMouseMove);
		
		//currently unused, but keeping for future improvements
		document.addEventListener("keypress", handleKeypress); //onkeypress

		getPlayerElement().addEventListener("wheel", onMouseWheel);
		
		hasExtensionBeenBootstrapped = true;
	}
}

window.addEventListener('yt-navigate-finish', bootstrapTheExtension);
if (getPlayerElement()) bootstrapTheExtension();
else document.addEventListener('DOMContentLoaded', bootstrapTheExtension);