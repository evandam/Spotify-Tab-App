// global vars
var 	_models,
		_ui,
		_throbber,
		currentTrack,
		currentTab;


// launch app when jQuery and Spotify are loaded
$(document).ready(function () {
	var requirements = [
		'$api/models', 
		'$views/ui#UI', 
		'$views/throbber#Throbber'
	];
	require(requirements, function (models, ui, throbber) {
		_models = models;
		_ui = ui.init({	
			views: [
				{id: 'tabs', element: $('#view-tabs')[0]},
				{id: 'settings', element: $('#view-settings')[0]},
				{id: 'favorites', element: $('#view-favorites')[0]}
			],
			tabs: [
				{viewId: 'tabs', name: 'Guitar Tabs'},
				{viewId: 'settings', name: 'Settings'},
				{viewId: 'favorites', name: 'Favorite Tabs'}
			]
		});
		_throbber = throbber.forElement($('#view-tabs')[0]);
		
		init();
	});
	
	$(window).resize(function() {
		// refresh sizes?
	});
	
	$("#search_form").submit(function() {
		var artist = $('#input_artist').val();
		var track = $('#input_track').val();
		search_songsterr(track, artist);
		// update localStorage to remember the new preferences for search
		if(currentTrack.artists[0].name !== artist)
			localStorage.setItem(currentTrack.artists[0].name, artist);
		if(currentTrack.name != track)
			localStorage.setItem(currentTrack.artists[0].name+'_'+
				currentTrack.name, track)
		return false;
	});
	
	$('#preferred_version input[type=radio]').click(function() {
		localStorage.setItem('preferred_version', $(this).val());
	});
});

// called once the app is ready
function init() {
	// start off the throbber
	startLoading();
	
	// update when the track changes
	_models.player.addEventListener('change:track', track_changed);

	// first track must be loaded manually, can listen for other events
	_models.player.load('track').done(function (player) {
		currentTrack = player.track;
		updateTrack();
	});
	
	// when any input is changed, reload the track
	$('.view-settings input').change(function() {
		updateTrack();
	});
	
	// event listeners for buttons to load other versions
	$('#textTab').click(function() {
		if(currentTab.versions.text)
			currentTab.load('text');
		else
			alert('no text tabs for this song');
	});
	$('#chords').click(function() {
		if(currentTab.versions.chords)
			currentTab.load('chords');
		else
			alert('no chords for this song');
	});
	
	// set the radio button for preferences
	var pref = localStorage.getItem('preferred_version');
	if(pref)
		$('#preferred_version input[value='+pref+']').prop('checked', true);
		
}

// update the html display for the track, fill and submit the form
function updateTrack() {
	clearHTML();
	var name = currentTrack.name;
	var artist = currentTrack.artists[0].name;	// only first artist listed
	// check localStorage for preferred search names
	var storage_artist = localStorage.getItem(artist);
	var storage_track = localStorage.getItem(artist+'_'+name);
	if(storage_artist)
		artist = storage_artist
	if(storage_track)
		name = storage_track
	$('#song_name').val(name);
	$('#band_name').val(artist);
	$('#input_track').val(name);
	$('#input_artist').val(artist);
	search_songsterr(name, artist);
}

// event handler for when the current track changes
function track_changed(evt) {
	currentTrack = evt.target.track;
	updateTrack();

	// add a 3 second delay to get ready to play the song to set up (really just for me...)
//	_models.player.pause();
//	setTimeout(_models.player.play, 2000);
}

// use songsterr's public API to get tabs
function search_songsterr(song, artist) {
	startLoading();
	
	var url = 'http://www.songsterr.com/a/wa/bestMatchForQueryString?';
	url += 's=' + escape(song) + '&a=' + escape(artist);
	
	currentTab = new Tab(song, artist, url);
	// use the preference defined in settings tab
	var pref = localStorage.getItem('preferred_version');
	if(!pref)
		pref = $('#preferred_version input[type=radio]').first().val();
	currentTab.load(pref);

} 

// clear out all html elements for the next song
// msg is an optional error message that will be displayed
function clearHTML(msg) {
	$('#tresults tbody').empty();
	$('#tabLink').text('');
	$('#tab').text(msg);
	doneLoading();
}

function startLoading() {
	_throbber.hideContent();
	_throbber.show();
}

function doneLoading() {
	_throbber.hide();
	_throbber.showContent();
}
