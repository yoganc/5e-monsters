/* global Controllers */
"use strict";

Controllers.encounterManager = {
	url: "/encounter-manager",
	templateUrl: "modules/encounter-manager/encounter-manager.html",
	controller: function ($scope, $state, actionQueue, encounter, library, monsters, util) {
		window.scope = $scope;

		$scope.partial = util.partialFactory("modules/encounter-manager/partials/");

		if ( !encounter.qty && !library.encounters.length ) {
			console.log("Aborting", encounter, library);
			$state.go("encounter-builder");
			return;
		}

		$scope.encounter = encounter;
		$scope.library = library;
		$scope.monsters = monsters;

		var placeholder = [];

		Object.keys(encounter.groups).forEach(function (id) {
			placeholder.push([
				(encounter.groups[id].qty > 1) ? encounter.groups[id].qty + "x" : "",
				encounter.groups[id].monster.name,
			].join(" "));
		});

		$scope.newEncounter = {
			placeholder: placeholder.join(", "),
			name: "",
		};

		$scope.calculateExp = function (storedEncounter) {
			var exp = 0;

			Object.keys( storedEncounter.groups ).forEach(function (id) {
				exp += monsters.byId[id].cr.exp * storedEncounter.groups[id];
			});

			return exp;
		};

		$scope.load = function (storedEncounter) {
			encounter.reset(storedEncounter);

			if ( !actionQueue.next($state) ) {
				$state.go("encounter-builder");
			}
		};

		$scope.save = function () {
			var newLibraryEntry = {
					name: $scope.newEncounter.name || $scope.newEncounter.placeholder,
					groups: {},
			};

			Object.keys(encounter.groups).forEach(function (id) {
				newLibraryEntry.groups[id] = encounter.groups[id].qty;
			});
			
			encounter.reference = library.store(newLibraryEntry);
		};

		$scope.remove = function ( storedEncounter ) {
			library.remove(storedEncounter);

			if ( encounter.reference === storedEncounter ) {
				encounter.reference = null;
			}
		};
	}
};