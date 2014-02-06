// Prototype for Tab object to store data from ultimate guitar

/**
Constructor for Tab object
*/		
function Tab(song, artist, url) {
	this.song = song;
	this.artist = artist;
	this.url = url;
	this.versions = {
		flash: null,
		text: null,
		chords: null
	};
}

Tab.prototype.toString = function() {
	return this.song + ' by ' + this.artist;
};

// Get the tab from the link (found in pre elements)
Tab.prototype.load = function(preference) {
	var self = this;
	$.get(self.url, function(data) {
		self._getVersions($(data));
		$('#tab-info').html("<h1>" + self.toString() + "</h1>");
		self._loadTab(preference);	
	});
};

// helper method to scrape html for links to other versions
// Fill out the Tab's versions with links
Tab.prototype._getVersions = function(data) {
	// clear out previous href to flash player tab
	$('#flash').removeAttr('href');
	// determine what the version of the search result is
	if(data.find('#flashVersionWarningBlock').length > 0) {
		this.versions.flash = this.url;
		$('#flash').attr('href', this.url);
	}
	else if(data.find('.text-tab-wrapper').length > 0) {
		this.versions.text = this.url;
	}
	else if(data.find('.chords-wrapper').length > 0) {
		this.versions.chords = this.url;
	}
	
	// get the other links to versions
	var self = this;
	data.find('.type-selector a').each(function() {
		var url = 'http://www.songsterr.com' + $(this).attr('href');
		var classes = $(this).find('i').attr('class');
		if(classes.indexOf('player') > -1)
			self.versions.flash = url;
		else if(classes.indexOf('text-guitar-tab') > -1)
			self.versions.text = url;
		else if(classes.indexOf('chords') > -1)
			self.versions.chords = url;
	});
};

// actually load the text/chords into the html
// the version parameter is the preference of chords/text tabs
Tab.prototype._loadTab = function(preference) {
	// try to choose the only available version
	if(this.versions.text && (!this.versions.chords || preference === "text")) {
		this._loadTextVersion();
	}
	else if(this.versions.chords && (!this.versions.text || preference === "chords")) {
		this._loadChordsVersion();
	}
	else if(this.versions.flash) {
		var html = "<h3> Only the flash-player tab is available. </h3>";
		html += "<a href='" + this.versions.flash + "'> View it in your web browser </a>";
		$('#results').html(html);
	}
	else {
		var html = "<h3> No results found </h3>";
		$('#results').html(html);
	}
	
	doneLoading();
};

Tab.prototype._loadTextVersion = function() {
	var self = this;
	$.get(self.versions.text, function(data) {
		var data = $(data);
		// remove unnecessary elements
		data.find('.headingWrapper').remove();
		data.find('script').remove();
		
		$('#results').html(data.find('.InspectSong'));
		doneLoading();
	});
};

Tab.prototype._loadChordsVersion = function() {
	var self = this;
	$.get(self.versions.chords, function(data) {
		var data = $(data);
		// remove unnecessary elements
		data.find('.headingWrapper').remove();
		data.find('script').remove();
		
		$('#results').html(data.find('.InspectSong'));
		
		// put the chord diagrams in fixed position so they're always on the screen
		var chords = $('.InspectSong .chords-content');
		$('.InspectSong .chords-wrapper .chord-diagrams').css({
			'position': 'fixed',
			'right': '25px',
			'top': '50px',
			'width': function() { return $(this).width() + 15; },
			'max-height': function() { return $(window).height() - 50; },
			'overflow-y': 'auto'
		});
		
		doneLoading();
	});
};
