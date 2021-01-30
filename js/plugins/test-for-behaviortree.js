
(() => {
	
function test1(num) {
	num = num || 0;

	var config = {
		type: 'Root', 
		children: [{
			type: 'Action.LogText', 
			args: 'test1', 
		}, {
			type: 'Decorator.Condition', 
			args: () => num > 0, 
			children: {
				type: 'Action.LogText', 
				args: 'test2', 
			}
		}]
	};
	var node = BehaviorTree.createBehaviorTree(config);
	return node;
}

// node = test1(1);
// node.execute();
// node.getStateName();


function test2(num) {
	num = num || 0;

	var config = {
		type: 'Root', 
		children: [{
			type: 'Composite.Sequence', 
			children: [
				{ type: 'Decorator.Condition', args: () => num > 0, 
				children: 
					{ type: 'Action.LogText', args: 'test1', } }, 
				{ type: 'Action.LogText', args: 'test2' }, 
			]}, 
		]
	};
	var node = BehaviorTree.createBehaviorTree(config);
	return node;
}

function test3(num) {
	num = num || 0;

	var config = {
		type: 'Root', 
		children: [{
			type: 'Composite.Selector', 
			children: [
				{ type: 'Decorator.Condition', args: () => num > 0, 
				children: 
					{ type: 'Action.LogText', args: 'test1', } }, 
				{ type: 'Action.LogText', args: 'test2' }, 
			]}, 
		]
	};
	var node = BehaviorTree.createBehaviorTree(config);
	return node;
}

// node = test2(-1);
// node.execute();
// console.log(node.getStateName(), [[0], [0,0], [0,0,0], [0,1]].map(a=>node.getChild(a).getStateName()));

// node = test3(1);
// node.execute();
// console.log(node.getStateName(), [[0], [0,0], [0,0,0], [0,1]].map(a=>node.getChild(a).getStateName()));


function test4(num) {
	num = num || 0;

	var config = {
		type: 'Root', 
		children: [{
			type: 'Decorator.Loop.UntilFailure', 
			children: [
				{ type: 'Decorator.Condition', args: () => num-- > 0, 
				children: 
					{ type: 'Action.LogText', args: 'test1', } }, 
			]}, 
			{ type: 'Action.LogText', args: 'test2' }, 
		]
	};
	var node = BehaviorTree.createBehaviorTree(config);
	return node;
}

// node = test4(4);
// node.execute();
// console.log(node.getStateName(), [[0], [0,0], [0,0,0], [0,1]].map(a=>node.getChild(a).getStateName()));


function test5(num) {
	num = num || 0;

	var config = {
		type: 'Root', 
		children: [{
			type: 'Composite.Sequence', 
			children: [{
				type: 'Decorator.ResultSuccess', 
				children: [
					{ type: 'Decorator.Condition', args: () => num > 0, 
					children: 
						{ type: 'Action.LogText', args: 'test1', } }, 
				]}, 
				{ type: 'Action.LogText', args: 'test2' }, 
			]}
		]
	};
	var node = BehaviorTree.createBehaviorTree(config);
	return node;
}

// node = test5(-1);
// node.execute();
// console.log(node.getStateName(), [[0], [0,0], [0,0,0], [0,0,0,0], [0,1]].map(a=>node.getChild(a).getStateName()));


function test6(num) {
	num = num || 0;

	var config = {
		type: 'Root', 
		children: [{
			type: 'Decorator.Loop.UntilFailure', 
			children: [
				{ type: 'Decorator.Condition', args: () => num-- > 0, 
				children: 
					{ type: 'Action.Log', args: () => num, } }, 
			]}, 
		]
	};
	var node = BehaviorTree.createBehaviorTree(config);
	return node;
}

// node = test6(4);
// node.execute();
// console.log(node.getStateName(), [[0], [0,0], [0,0,0]].map(a=>node.getChild(a).getStateName()));


function test7(num) {
	num = num || 0;

	var config1 = [
		{ type: 'Root', children: [1, 4] }, 
		{ type: 'Decorator.Loop.UntilFailure', args: null, children: [2] }, 
		{ type: 'Decorator.Condition', args: () => num-- > 0, children: [3] }, 
		{ type: 'Action.LogText', args: 'test1' }, 
		{ type: 'Action.LogText', args: 'test2' }, 
	];

	// test4
	var config2 = {
		type: 'Root', 
		args: null, 
		children: [{
			type: 'Decorator.Loop.UntilFailure', 
			args: null, 
			children: [
				{ type: 'Decorator.Condition', args: () => num-- > 0, 
				children: 
					[{ type: 'Action.LogText', args: 'test1', children: [] }] }, 
			]}, 
			{ type: 'Action.LogText', args: 'test2', children: [] }, 
		]
	};

	config1 = BehaviorTree.listConfig2ObjectConfig(config1);

	return [config1, config2];
}

// [config1, config2] = test7(4);


function test8(num) {
	num = num || 0;

	var config = [
		{ type: 'Root', children: [1, 4] }, 
		{ type: 'Decorator.Loop.UntilFailure', args: null, children: [2] }, 
		{ type: 'Decorator.Condition', args: () => num-- > 0, children: [3] }, 
		{ type: 'Action.LogText', args: 'test1' }, 
		{ type: 'Action.LogText', args: 'test2' }, 
	];

	node = BehaviorTree.createBehaviorTreeByList(config);
	return node;
}

// node = test8(4); // 同 test4
// node.execute();
// console.log(node.getStateName(), [[0], [0,0], [0,0,0], [0,1]].map(a=>node.getChild(a).getStateName()));


function test9(num) {
	num = num || 0;

	var config = {
		type: 'Root', 
		children: { type: 'Action.Step', args: () => {
			console.log(num);
			return num-- > 0;
		}, }, 
	};
	var node = BehaviorTree.createBehaviorTree(config);
	return node;
}

// node = test9(4);
// node.execute();
// console.log(node.getStateName(), [[0]].map(a=>node.getChild(a).getStateName()));
// node.execute();
// console.log(node.getStateName(), [[0]].map(a=>node.getChild(a).getStateName()));
// node.execute();
// console.log(node.getStateName(), [[0]].map(a=>node.getChild(a).getStateName()));
// node.execute();
// console.log(node.getStateName(), [[0]].map(a=>node.getChild(a).getStateName()));
// node.execute();
// console.log(node.getStateName(), [[0]].map(a=>node.getChild(a).getStateName()));
// node.execute();
// console.log(node.getStateName(), [[0]].map(a=>node.getChild(a).getStateName()));



// 创建并执行 NPC行动示例 的行为树

function test10() {

var isWeekday = true;

var routine = [];
var setRoutine = (arr) => {
	routine.splice(0, routine.length, ...arr);
};
var haveRoutine = () => {
	return routine.length > 0;
};
var doRoutine = () => {
	return routine.shift();
};

var patrol = [];
var setPatrol = (arr) => {
	patrol.splice(0, patrol.length, ...arr);
};
var clearPatrol = () => {
	patrol.splice(0, patrol.length);
};
var doPatrol = () => {
	var res = patrol[0];
	patrol.push(patrol.shift());
	return res;
};

var time = 6 * 60;
var timeFly = (n) => {
	time += 10 * n;
};
var timeBetween = (s, e) => {
	return s * 60 <= time && time < e * 60;
};
var showTime = () => {
	var hour = Math.floor(time / 60) % 24;
	hour = hour.toString().padStart(2, 0);
	var minute = time % 60;
	minute = minute.toString().padStart(2, 0);
	return `${hour}:${minute}:00`;
};

var weather = 'sun';
var getWeather = () => {
	return weather;
}
var setSunWeather = () => {
	weather = 'sun';
}
var setRainWeather = () => {
	weather = 'rain';
}
var isSunWeather = () => {
	return weather == 'sun';
}
var isRainWeather = () => {
	return weather == 'rain';
}

moveType = 'walk';
var getMoveType = () => {
	return moveType;
}
var setWalkMoveType = () => {
	moveType = 'walk';
}
var setRunMoveType = () => {
	moveType = 'run';
}
var isWalkMoveType = () => {
	return moveType == 'walk';
}
var isRunMoveType = () => {
	return moveType == 'run';
}


var config = [
{ id:  0, children: [1], 	type: "Root" 						}, 
{ id:  1, children: [2], 	type: "Decorator.Condition", 		args: () => isWeekday }, 
{ id:  2, 					type: "Composite.Sequence", 		children: [3, 13, 39, 55, 69] }, 
// 0	[Root]
// 1		(Condition) : 工作日
// 2		Sequence

{ id:  3, children: [4], 	type: "Decorator.ResultSuccess" 	}, 
{ id:  4, children: [5], 	type: "Decorator.Condition", 		args: () => timeBetween(6, 7) }, 
{ id:  5, 					type: "Composite.Sequence", 		children: [6, 7, 8, 12] }, 
{ id:  6, children: [], 	type: "Action.Execute", 			args: () => (
			console.log("起床")) }, 
{ id:  7, children: [], 	type: "Action.Execute", 			args: () => (
			setPatrol(['房间1', '房间2', '房间3']), console.log("设置巡逻 房间内巡逻", patrol)) }, 
{ id:  8, children: [9], 	type: "Decorator.ResultSuccess" 	}, 
{ id:  9, children: [10], 	type: "Decorator.Loop.UntilFailure" }, 
{ id: 10, children: [11], 	type: "Decorator.Condition", 		args: () => timeBetween(6, 7) }, 
{ id: 11, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("巡逻移动", doPatrol())) }, 
{ id: 12, children: [], 	type: "Action.Execute", 			args: () => (
			clearPatrol(), console.log("清除巡逻")) }, 
//  3			(ResultSuccess)
//  4			(Condition : 6:00 ~ 7:00)
//  5			Sequence
//  6				Action : 起床动作
//  7				Action : 设置巡逻 房间内巡逻
//  8				(ResultSuccess)
//  9				(UntilFailure)
// 10				(Condition) : 6:00 ~ 7:00  (考虑记录这个条件表达式 与父节点公用这个条件表达式)
// 11				Action : 执行巡逻移动
// 12				Action : 清除巡逻

{ id: 13, children: [14], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 14, children: [15], 	type: "Decorator.Condition", 		args: () => timeBetween(7, 9) }, 
{ id: 15, 					type: "Composite.Sequence" , 		children: [16, 17, 28, 29, 32, 33, 34, 38] }, 
{ id: 16, children: [], 	type: "Action.Execute", 			args: () => (
			setRoutine(['街道1', '街道2', '街道3']), console.log("设置移动 移至店铺", routine)) }, 
{ id: 17, children: [18], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 18, children: [19], 	type: "Decorator.Loop.UntilFailure" }, 
{ id: 19, children: [20], 	type: "Decorator.Condition", 		args: () => haveRoutine() }, 
{ id: 20, 					type: "Composite.Sequence", 		children: [21, 27] }, 
{ id: 21, children: [22], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 22, 					type: "Composite.Selector", 		children: [23, 25] }, 
{ id: 23, children: [24], 	type: "Decorator.Condition", 		args: () => isRainWeather() && isWalkMoveType() }, 
{ id: 24, children: [], 	type: "Action.Execute", 			args: () => (
			setRunMoveType(), console.log("移动方式", getMoveType())) }, 
{ id: 25, children: [26], 	type: "Decorator.Condition", 		args: () => isSunWeather() && isRunMoveType() }, 
{ id: 26, children: [], 	type: "Action.Execute", 			args: () => (
			setWalkMoveType(), console.log("移动方式", getMoveType())) }, 
{ id: 27, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("路径移动", doRoutine())) }, 
// 13			(ResultSuccess)
// 14			(Condition) : 7:00 ~ 9:00
// 15			Sequence
// 16				Action : 设置移动 移至店铺
// 17				(ResultSuccess)
// 18				(UntilFailure)
// 19				(Condition) : 移动未完成
// 20				Sequence
// 21					(ResultSuccess)
// 22					Selector
// 23						(Condition) : 晴天
// 24						Action : 设置移动方式 行走
// 25						(Condition) : 雨天
// 26						Action : 设置移动方式 跑步
// 27					Action : 执行路径移动

{ id: 28, children: [], 	type: "Action.Execute", 			args: () => (
			console.log("开门 标志ON")) }, 
{ id: 29, children: [30], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 30, children: [31], 	type: "Decorator.Condition", 		args: () => isRunMoveType() }, 
{ id: 31, children: [], 	type: "Action.Execute", 			args: () => (
			setWalkMoveType(), console.log("移动方式", getMoveType())) }, 
{ id: 32, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("进门")) }, 
{ id: 33, children: [], 	type: "Action.Execute", 			args: () => (
			setPatrol(['店铺1', '店铺2', '店铺3']), console.log("设置巡逻 店铺内巡逻", patrol)) },
{ id: 34, children: [35], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 35, children: [36], 	type: "Decorator.Loop.UntilFailure" }, 
{ id: 36, children: [37], 	type: "Decorator.Condition", 		args: () => timeBetween(7, 9) }, 
{ id: 37, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("巡逻移动", doPatrol())) }, 
{ id: 38, children: [], 	type: "Action.Execute", 			args: () => (
			clearPatrol(), console.log("清除巡逻")) }, 
// 28				Action : 开门 标志ON
// 29				(ResultSuccess)
// 30				(Condition) : 移动方式 跑步
// 31				Action : 设置移动方式 行走
// 32				Action : 进门 (传送至店内门口)
// 33				Action : 设置巡逻 店铺内巡逻
// 34				(ResultSuccess)
// 35				(UntilFailure)
// 36				(Condition) : 7:00 ~ 9:00
// 37				Action : 执行巡逻移动
// 38				Action : 清除巡逻

{ id: 39, children: [40], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 40, children: [41], 	type: "Decorator.Condition", 		args: () => timeBetween(9, 18) }, 
{ id: 41, 					type: "Composite.Sequence", 		children: [42, 43, 47, 48, 49, 53, 54] }, 
{ id: 42, children: [], 	type: "Action.Execute", 			args: () => (
			setRoutine(['店内1', '店内2', '柜台']), console.log("设置移动 移至店铺", routine)) }, 
{ id: 43, children: [44], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 44, children: [45], 	type: "Decorator.Loop.UntilFailure" }, 
{ id: 45, children: [46], 	type: "Decorator.Condition", 		args: () => haveRoutine() }, 
{ id: 46, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("路径移动", doRoutine())) }, 
{ id: 47, children: [], 	type: "Action.Execute", 			args: () => (
			console.log("营业 标志ON")) }, 
{ id: 48, children: [], 	type: "Action.Execute", 			args: () => (
			setPatrol(['柜台1', '柜台2', '柜台3']), console.log("设置巡逻 柜台前巡逻", patrol)) },
{ id: 49, children: [50], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 50, children: [51], 	type: "Decorator.Loop.UntilFailure" }, 
{ id: 51, children: [52], 	type: "Decorator.Condition", 		args: () => timeBetween(9, 18) }, 
{ id: 52, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("巡逻移动", doPatrol())) }, 
{ id: 53, children: [], 	type: "Action.Execute", 			args: () => (
			clearPatrol(), console.log("清除巡逻")) }, 
{ id: 54, children: [], 	type: "Action.Execute", 			args: () => (
			console.log("营业 标志OFF")) }, 
// 39			(ResultSuccess)
// 40			(Condition) : 9:00 ~ 18:00
// 41			Sequence
// 42				Action : 设置移动 移至柜台
// 43				(ResultSuccess)
// 44				(UntilFailure)
// 45				(Condition) : 移动未完成
// 46				Action : 执行路径移动
// 47				Action : 营业 标志ON
//   				// Action : 互动标志设置为xxx (TODO)
// 48				Action : 设置巡逻 柜台前巡逻 (也可以是站在同一个位置不移动)
// 49				(ResultSuccess)
// 50				(UntilFailure)
// 51				(Condition) : 9:00 ~ 18:00
// 52				Action : 执行巡逻移动
// 53				Action : 清除巡逻
// 54				Action : 营业 标志OFF

{ id: 55, children: [56], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 56, children: [57], 	type: "Decorator.Condition", 		args: () => timeBetween(18, 22) }, 
{ id: 57, 					type: "Composite.Sequence" , 		children: [58, 59, 63, 64, 68] }, 
{ id: 58, children: [], 	type: "Action.Execute", 			args: () => (
			setRoutine(['街道3', '街道2', '街道1']), console.log("设置移动 移至家", routine)) }, 
{ id: 59, children: [60], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 60, children: [61], 	type: "Decorator.Loop.UntilFailure" }, 
{ id: 61, children: [62], 	type: "Decorator.Condition", 		args: () => haveRoutine() }, 
{ id: 62, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("路径移动", doRoutine())) }, 
{ id: 63, children: [], 	type: "Action.Execute", 			args: () => (
			setPatrol(['房间1', '房间2', '房间3']), console.log("设置巡逻 房间内巡逻", patrol)) }, 
{ id: 64, children: [65], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 65, children: [66], 	type: "Decorator.Loop.UntilFailure" }, 
{ id: 66, children: [67], 	type: "Decorator.Condition", 		args: () => timeBetween(18, 22) }, 
{ id: 67, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("巡逻移动", doPatrol())) }, 
{ id: 68, children: [], 	type: "Action.Execute", 			args: () => (
			clearPatrol(), console.log("清除巡逻")) }, 
// 55			(ResultSuccess)
// 56			(Condition) : 18:00 ~ 22:00
// 57			Sequence
// 58				Action : 设置移动 移至家
// 59				(ResultSuccess)
// 60				(UntilFailure)
// 61				(Condition) : 移动未完成
// 62				Action : 执行路径移动  (这一部分也可以考虑直接 : 循环移动到家)
// 63				Action : 设置巡逻 家内巡逻
// 64				(ResultSuccess)
// 65				(UntilFailure)
// 66				(Condition) : 18:00 ~ 22:00
// 67				Action : 执行巡逻移动
// 68				Action : 清除巡逻

{ id: 69, children: [70], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 70, children: [71], 	type: "Decorator.Condition", 		args: () => timeBetween(22, 24+6) }, 
{ id: 71, 					type: "Composite.Sequence", 		children: [72, 73, 77, 78] }, 
{ id: 72, children: [], 	type: "Action.Execute", 			args: () => (
			setRoutine(['家1', '家2', '床']), console.log("设置移动 移至床", routine)) }, 
{ id: 73, children: [74], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 74, children: [75], 	type: "Decorator.Loop.UntilFailure" }, 
{ id: 75, children: [76], 	type: "Decorator.Condition", 		args: () => haveRoutine() }, 
{ id: 76, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("路径移动", doRoutine())) }, 

{ id: 77, children: [78], 	type: "Decorator.ResultSuccess" 	}, 
{ id: 78, children: [79], 	type: "Decorator.Loop.UntilFailure" }, 
{ id: 79, children: [80], 	type: "Decorator.Condition", 		args: () => timeBetween(22, 24+6) }, 
{ id: 80, children: [], 	type: "Action.OneStep", 			args: () => (
			console.log("睡觉中")) }, 
// 69			(ResultSuccess)
// 70			(Condition) : 22:00 ~ 6:00+1
// 71			Sequence
// 72				Action : 设置移动 移至床
// 73				(ResultSuccess)
// 74				(UntilFailure)
// 75				(Condition) : 移动未完成
// 76				Action : 执行路径移动
// 77				(ResultSuccess)
// 78				(UntilFailure)
// 79				(Condition) : 22:00 ~ 6:00+1
// 80				Action : 睡觉中

];


var node = BehaviorTree.createBehaviorTreeByList(config);
var executeNode = (n) => {
	node.execute();
	timeFly(n);
	console.log(showTime());
};
return {
	node, 
	timeFly, 
	timeBetween, 
	setSunWeather, 
	setRainWeather, 
	executeNode, 
};

}

/*
var {
	node, 
	timeFly, 
	timeBetween, 
	setSunWeather, 
	setRainWeather, 
	executeNode, 
} = test10();
*/
/*
executeNode(1);
executeNode(1);

executeNode(6);

setInterval(() => {
	executeNode(1);
}, 1000);
*/
/*
setTimeout(() => {
	var {
		node, 
		timeFly, 
		setSunWeather, 
		setRainWeather, 
		executeNode, 
	} = test10();

	var intervalId = setInterval(() => {
		//if (timeBetween(10, 18)) {
		//	executeNode(6);
		//}
		//else {
		//	executeNode(1);
		//}
		executeNode(3);
	}, 1000);
	console.log(intervalId);

	setTimeout(() => {
		clearInterval(intervalId);
	//}, 24*6*1000);
	}, 24*2*1000);
}, 10000);
*/


window.Test = window.Test || {};
window.Test.BehaviorTree = {
	test1, 
	test2, 
	test3, 
	test4, 
	test5, 
	test6, 
	test7, 
	test8, 
	test9, 
	test10, 
};

})();


