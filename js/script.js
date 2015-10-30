/*=============================================
		Project Size
=============================================== */

$(function() {
	$( "#draggable" ).draggable();
	$( "#mapDiv45" ).draggable();
	$( "#show-hide-advanced-fields" ).click(function(){
		$( "#advanced-fields, #mapcontrols").toggle();
	});
});

$(document).ready(function() {           

function initialize(){
	var geocoder = new google.maps.Geocoder();
	address = document.getElementById('address').value;
	var mapOptions = {
		zoom: 40,
		disableDefaultUI: true,
		zoomControl: true,
		panControl: true,
		mapTypeControl: true,
		scaleControl: true,
		streetViewControl: true,
		overviewMapControl: true,
		mapTypeId:google.maps.MapTypeId.SATELLITE,
		tilt: 0
	};
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
		map.setCenter(results[0].geometry.location);
		x = results[0].geometry.location;
	}
}); 

var map = new google.maps.Map(document.getElementById("mapDiv"), mapOptions);
var mapOptions45 = {
	zoom: 20,
	minZoom: 18,
	disableDefaultUI: true,
	zoomControl: true,
	mapTypeId:google.maps.MapTypeId.SATELLITE,
	tilt: 45
};

geocoder.geocode( { 'address': address}, function(results, status) {
	if (status == google.maps.GeocoderStatus.OK) {
		map45.setCenter(results[0].geometry.location);
		x = results[0].geometry.location;
	}
}); 

var map45 = new google.maps.Map(document.getElementById("mapDiv45"), mapOptions45);
var mapOptionsImage = {
	zoom: 20,
	disableDefaultUI: true,
	zoomControl: false,
	draggable: false,
	mapTypeId:google.maps.MapTypeId.SATELLITE,
	tilt: 45
};

geocoder.geocode( { 'address': address}, function(results, status) {
	if (status == google.maps.GeocoderStatus.OK) {
		mapImage.setCenter(results[0].geometry.location);
		x = results[0].geometry.location;
	}
}); 

var mapImage = new google.maps.Map(document.getElementById("mapDivImage"), mapOptionsImage);
	addButtons(map);
	drawEditablePolygon(map);			    
}

function addButtons(map){
	document.getElementById('btnTerrain').addEventListener('click', function(){
		map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
	});
	document.getElementById('btnRoadmap').addEventListener('click', function(){
		map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
	});
	document.getElementById('btnSatellite').addEventListener('click', function(){
		map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
	});
	document.getElementById('btnHybrid').addEventListener('click', function(){
		map.setMapTypeId(google.maps.MapTypeId.HYBRID);
	});
	document.getElementById('btnCompass').addEventListener('click', function(){
		$('#draggable').toggle();
	});
	document.getElementById('btnInspector').addEventListener('click', function(){
		$('#mapDiv45').toggle();
	});
}


function drawEditablePolygon(map) {
	geocoder = new google.maps.Geocoder();
	address = document.getElementById('address').value;
	geocoder.geocode( { 'address': address}, function(results, status) {
	if (status == google.maps.GeocoderStatus.OK) {
		map.setCenter(results[0].geometry.location);
		lat = results[0].geometry.location.lat();
		lon = results[0].geometry.location.lng();
		lat_adjacent = Number(results[0].geometry.location.lat()) + 0.0001;
		lon_adjacent = Number(results[0].geometry.location.lng()) + 0.0001;
		console.log("LAT: " + lat + " | ADJACENT LAT: " + lat_adjacent + " LON: " + lon + " | ADJACENT LON: " + lon_adjacent);
		natureCoords = [
			new google.maps.LatLng(lat, lon_adjacent),   
			new google.maps.LatLng(lat, lon),   
			new google.maps.LatLng(lat_adjacent, lon),   
			new google.maps.LatLng(lat_adjacent, lon_adjacent) 
		];
		natureArea = new google.maps.Polygon({
			path: natureCoords,
			strokeColor: "#FFFFFF",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#00FF00",
			fillOpacity: 0.6,
			editable: true,
			draggable: true
		});
		natureArea.setMap(map);
		document.getElementById('calculate').addEventListener('click', function(){
			calculateValue();
		});
	}
});

}

google.maps.event.addDomListener(window, "load", initialize);
$('#update_address').click( function(){
	initialize();
}); 
$('#calculate').click( function(){
$('#results, #results2, #results3').show();    		
}); 
});

function calculateValue() {
	surface_area =  Number(google.maps.geometry.spherical.computeArea(natureArea.getPath()));
	size_premimum = Number(surface_area * 0.15);
	size_standard = Number(surface_area * 0.10);
	document.getElementById('results').innerHTML = "<br><br>RESULTS:<br><br>";
	document.getElementById('results').innerHTML += "Surface Area = " + surface_area.toFixed(0) + " sq meter <br/>";
	document.getElementById('results').innerHTML += "System size by using premium solar panels (SunPower) = " + size_premimum.toFixed(2) + " kW <br/>";
	document.getElementById('results').innerHTML += "System size by using standard solar panels = " + size_standard.toFixed(2) + " kW <br/>";
	var tilt = parseInt(document.getElementById('tilt').value);
	var azimuth = parseInt(document.getElementById('azimuth').value); 
	var requestUrl="https://developer.nrel.gov/api/pvwatts/v5.json?api_key=zoY9HFdYunwk1YAZ16nVrcmwzqotGDdnJONRA9oQ&lat=" + lat + "&lon=" + lon + "&timeframe=monthly&system_capacity=" + size_premimum + "&module_type=1&losses=14&array_type=1&tilt=" + tilt + "&azimuth=" + azimuth + "&callback=?";
	$.getJSON(requestUrl, { }, function (data){ 
	console.log(data.outputs);
	var energyGenerated = data.outputs.ac_annual;
	var ppa = document.getElementById('ppa').value;
	var lease = energyGenerated * 0.15 * ppa;
	document.getElementById('results3').innerHTML = "<br /> Estimated Electricity Production = " + energyGenerated.toFixed(2) + " kWh per year <br/>";
	document.getElementById('results3').innerHTML += "<h3>Year 1 PPA Revenue $" + lease.toFixed(2) + ".</h3>";
});

requestUtilityCompanies ="https://developer.nrel.gov/api/census_rate/v3.json?api_key=zoY9HFdYunwk1YAZ16nVrcmwzqotGDdnJONRA9oQ&region=block&id=101&lat=" + lat + "&lon=" + lon; 

$.getJSON(requestUtilityCompanies, { }, function (data){
	document.getElementById('results2').innerHTML = "<br />Local Electric Utility Company: <br/>";

var i=0;
utility='';
while(data.outputs.utility_info[i]){
	console.log(data.outputs.utility_info[i].utility_name);
	document.getElementById('results2').innerHTML += data.outputs.utility_info[i].utility_name + "<br />";
	utility += data.outputs.utility_info[i].utility_name ;
	i++;
}

});

}



/*=============================================
		Utility
=============================================== */
function show_utility_companies() {  
	var city = document.getElementById('city').value;
	city = city.trim();
	city = city.split(' ').join('+'); 
	var address = city + "+" + document.getElementById('state').value; 
	var requestUtilityCompanies ="https://developer.nrel.gov/api/census_rate/v3.json?api_key=zoY9HFdYunwk1YAZ16nVrcmwzqotGDdnJONRA9oQ&region=block&id=101&address=" + address; 
	$.getJSON(requestUtilityCompanies, { 
	},
	function (data){
		document.getElementById('utility_companies').innerHTML = "<h3>Local Eletric Utility Companies:</h3>";
		var i=0;
		while(data.outputs.utility_info[i]){
			console.log(data.outputs.utility_info[i].utility_name);
			document.getElementById('utility_companies').innerHTML += data.outputs.utility_info[i].utility_name + "<br />";
			i++;
		}
	});

	}
	function show_average_electrcity_tariffs() {  
	var city = document.getElementById('city').value;
	city = city.trim();
	city = city.split(' ').join('+'); 
	var address = city + "+" + document.getElementById('state').value; 
	var requestAvgElectTariffs ="https://developer.nrel.gov/api/utility_rates/v3.json?api_key=zoY9HFdYunwk1YAZ16nVrcmwzqotGDdnJONRA9oQ&address=" + address; 

	$.getJSON(requestAvgElectTariffs, {
	},
	function (data){
		document.getElementById('average_electricity_tariffs').innerHTML = "<h3>Local Average Electricity Rates:</h3>";
		document.getElementById('average_electricity_tariffs').innerHTML += "<div><strong> Commercial:</strong> $" + data.outputs.commercial + "<br />" +  "<strong>Industrial:</strong> $" + data.outputs.industrial + " <br/>" +  "<strong>Residential:</strong> $" + data.outputs.residential + "</div>";
	});
}
  
/*=============================================
		Solar Irradiance
=============================================== */
function pvwatts_irradiance() {                       
	var city = document.getElementById('city').value;
	city = city.trim();
	city = city.split(' ').join('+'); 
	var address = city + "+" + document.getElementById('state').value; 
	var size = document.getElementById('size').value;
	var array_type = parseInt(document.getElementById('array_type').value);
	var module_type = parseInt(document.getElementById('module_type').value);
	var tilt = parseInt(document.getElementById('tilt').value);
	var azimuth = parseInt(document.getElementById('azimuth').value);  
	var requestUrl="https://developer.nrel.gov/api/pvwatts/v5.json?api_key=zoY9HFdYunwk1YAZ16nVrcmwzqotGDdnJONRA9oQ&address=" + address + "&timeframe=monthly&system_capacity=" + size + "&module_type=" + module_type + "&losses=14&array_type=" + array_type + "&tilt=" + tilt + "&azimuth=" + azimuth + "&callback=?";
	$.getJSON(requestUrl, {},
	function (data){
		document.getElementById('pv_watts_annual_production').innerHTML = "Annual Production: " + data.outputs.ac_annual.toFixed(2) + " kWh/year <br>";
		var radiation = new Array ();
		radiation = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
		for (i=0; i<12; i++){ 
			document.getElementById('radiation_' + radiation[i] + '').innerHTML =  data.outputs.ac_monthly[i].toFixed(0);
			document.getElementById('production_' + radiation[i] + '').innerHTML =  data.outputs.ac_monthly[i].toFixed(0);
		}
	});
}


/*=============================================
		System Production
=============================================== */
function pvwatts() {                       
	var city = document.getElementById('city').value;
	city = city.trim();
	city = city.split(' ').join('+'); 
	var address = city + "+" + document.getElementById('state').value; 
	var size = document.getElementById('size').value;
	var array_type = parseInt(document.getElementById('array_type').value);
	var module_type = parseInt(document.getElementById('module_type').value);
	var tilt = parseInt(document.getElementById('tilt').value);
	var azimuth = parseInt(document.getElementById('azimuth').value);  
	var requestUrl="https://developer.nrel.gov/api/pvwatts/v5.json?api_key=zoY9HFdYunwk1YAZ16nVrcmwzqotGDdnJONRA9oQ&address=" + address + "&timeframe=monthly&system_capacity=" + size + "&module_type=" + module_type + "&losses=14&array_type=" + array_type + "&tilt=" + tilt + "&azimuth=" + azimuth + "&callback=?";  
	$.getJSON(requestUrl, {},
	function (data){
		document.getElementById('pv_watts_annual_production').innerHTML = "<br><br><b>Annual System Production:</b> " + data.outputs.ac_annual.toFixed(2) + " kWh/year AC<br>";
		document.getElementById('pv_watts_annual_production').innerHTML += "<b>Annual Solar Radiation Available:</b> " + data.outputs.solrad_annual.toFixed(3)  * 365 + " kWh/year <br>";
		var radiation = new Array ();
		radiation = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
		for (i=0; i<12; i++){ 
			document.getElementById('radiation_' + radiation[i] + '').innerHTML =  data.outputs.solrad_monthly[i].toFixed(3)*1000;
			document.getElementById('production_' + radiation[i] + '').innerHTML =  data.outputs.ac_monthly[i].toFixed(0);
		}
	});
}


/*=============================================
		Financial Incentives
=============================================== */
function show_incentives() {  
	var city = document.getElementById('city').value;
	city = city.trim();
	city = city.split(' ').join('+'); 
	var address = city + "+" + document.getElementById('state').value; 
	var requestDsire = "https://developer.nrel.gov/api/energy-incentives/v1.json?api_key=zoY9HFdYunwk1YAZ16nVrcmwzqotGDdnJONRA9oQ&address=" + address + "&incentive_types=solar_incentives&callback=?"; 
	$.getJSON(requestDsire, {},
	function (data){
		document.getElementById('list_of_incentives').innerHTML = "<h2>List of Incentives:</h2><br>";
		var i=0;
		while(data.outputs.solar_incentives[i]){
			document.getElementById('list_of_incentives').innerHTML += "<div><strong> Program Name:</strong> " + data.outputs.solar_incentives[i].program_name + "<br />" + "<strong> Description:</strong> " + data.outputs.solar_incentives[i].notes + " <hr/> </div>";
			i++;
		}
		document.getElementById('list_of_incentives').innerHTML += "Read more <a href='" + "http://programs.dsireusa.org/system/program?zipcode=94649&technology=7" + "' target='_blank'> in the DSIRE website </a>";
	});
}


/*=============================================
		Installation Cost
=============================================== */
function avg_costperwatt(){
	document.getElementById("openpv_summary_results").innerHTML ="<h4>Please wait ... retrieving data</h4>";
	size = document.getElementById("openpv_system_size").value;
	minsize = size * 0.8;
	maxsize = size * 1.2;
	county = document.getElementById("openpv_county").value;
	var requestSystemCost ="https://developer.nrel.gov/api/solar/open_pv/installs/summaries?api_key=zoY9HFdYunwk1YAZ16nVrcmwzqotGDdnJONRA9oQ&county=" + county + "&minsize=" + minsize + "&maxsize=" + maxsize; 
	$.getJSON(requestSystemCost, {},
	function (data){
		var number_of_system_costs = data.result.length;
		document.getElementById("openpv_summary_results").innerHTML ="<h4>Average Cost per Watt: " + data.result.avg_cost_pw + " $/W</h4>";
		document.getElementById("openpv_summary_results").innerHTML +="<h4>Best Average Cost per Watt: " + data.result.best_avg_cost_pw + " $/W</h4>";
	});
}
