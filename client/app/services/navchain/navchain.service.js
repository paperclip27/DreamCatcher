'use strict';

angular.module('dreamCatcherApp')
  .factory('navchain', ['$rootScope', 'dreamFactory', 'goalFactory', 'Auth', '$q', function ($rootScope, dreamFactory, goalFactory, Auth, $q) {
	// Service logic
	// ...
		
	//HOW DO I INITIALIZE THE DATA FROM THE SERVER?
	//HOW DO I BIND TO THE selectedItem IN MY SIDENAV DIRECTIVE?
		//Breadcrumbs also needs to bind to the whole chain.

	var factory = {};

	factory.chain = {
		top:{
			type: null,
			data: null,
			parent: null,
			urlChain: []
			//NOTE: The urlChain is just an ordered list of names to display in the breadcrumbs.
			//This gives me something to bind to, and allows me to use ng-repeat to create the chain.
		}
	};
	
	factory.init = function() {
		var defer = $q.defer();
		dreamFactory.getDreams().then(function(dreams){
			var newTop = {
				type: 'user',
				data: {name: 'Dreams', subgoals: dreams},
				parent: null,
				urlChain: ['Home']
			}
			factory.chain.top = newTop;
			console.log('Navchain fully loaded:');
			defer.resolve();
		});
		return defer.promise;
	};
	
	factory.reload = function(){
		//For use after dream and goal creation, so that bound components show the new data.
		//Re-get the data object from the server
		if(factory.chain.top.type == 'user'){
			dreamFactory.getDreams().then(function(dreams){
				var newData = {name: 'Dreams', subgoals: dreams}
				factory.chain.top.data = newData;
			});
		}
		else if(factory.chain.top.type == 'dream'){
			var currentId = factory.chain.top.data._id;
			dreamFactory.getDream(currentId, true).then(function(dream){
				factory.chain.top.data = dream;
			});
		}
		else if(factory.chain.top.typ == 'goal'){
			var currentId = factory.chain.top.data._id;
			goalFactory.getGoal(currentId).then(function(goal){
				factory.chain.top.data = goal;
			});
		}
		else{
			console.log('Something went wrong, navchain not yet initialized');
		}
	}

	factory.forward = function (id) {
		if(factory.chain.top.type === 'user'){
			var root = factory.chain.top.data;
			for(var dreamIndex in root.subgoals){
				if(root.subgoals[dreamIndex]._id == id){
					dreamFactory.getDream(id, true).then(function(dream){
						var newUrlChain = factory.chain.top.urlChain.slice(0);
						newUrlChain.push(dream.name);
						var newTop = {
							type:'dream',
							data: dream,
							parent: factory.chain.top,
							urlChain: newUrlChain
						}
						factory.chain.top = newTop;
						//PAGE ROUTING
						$rootScope.changeRoute('/dreams/' + id);
					});
					break;
				}
			}
		}
		else if(factory.chain.top.type === 'dream' || factory.chain.top.type === 'goal'){
			var data = factory.chain.top.data;
			for(var subIndex in data.subgoals){
				if(data.subgoals[subIndex]._id == id){
					goalFactory.getGoal(id).then(function(goal){
						var newUrlChain = factory.chain.top.urlChain.slice(0);
						newUrlChain.push(goal.name);
						var newTop = {
							type:'goal',
							data: goal,
							parent: factory.chain.top,
							urlChain: newUrlChain
						}
						factory.chain.top = newTop;
						//PAGE ROUTING
						$rootScope.changeRoute('/goals/' + id);
					});
					break;
				}
			}
		}
		else{
		}
		//Use this method to go deeper in the chain
		//Ensure that the id is actually one of the children
		//of the last item in the chain
		//Get the item with the specified ID from the server
		//Append the item to the end of the chain
		//Set selected Item and Type to the last element in the chain
		
		//WOULD MOVING FROM HOME INTO A DREAM REQUIRE PAGE ROUTING?
	};
	
	factory.back = function(){
		if(factory.chain.top.parent != null){
			factory.chain.top = factory.chain.top.parent;
			//PAGE ROUTING
			var newUrl = '/' + factory.chain.top.type + 's/' + factory.chain.top.data._id;
			$rootScope.changeRoute(newUrl);
		}
		else{
			console.log('Already at the top of the chain');
		}
		//Use this method to go back a level in the chain
		//Remove last element from the chain
		//Set selected Item and Type to the last element in the chain
	};
	
	factory.jump = function(numSteps){
		for(var i = 0; i < numSteps; i++){
			if(factory.chain.top.parent != null){
				factory.chain.top = factory.chain.top.parent;
			}
			//PAGE ROUTING
			var newUrl = '/' + factory.chain.top.type + 's/' + factory.chain.top.data._id;
			//console.log(newUrl);
			$rootScope.changeRoute(newUrl);
		}
		//Use this method to go back multiple steps
		//0 steps: stay put
		//1 or more steps: go back that many steps
		//if numSteps > chain.length, go to level of user home page
		
		//Simply remove the specified number of items from the chain.
		//Reset selected Item and Type to the end of the chain.
	};
	
	return factory;
}]);
