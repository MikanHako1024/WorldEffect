//=============================================================================
// MK_RM_BehaviorTree.js
// 行为树
//=============================================================================
//  author : Mikan 
//  plugin : MK_RM_BehaviorTree.js 行为树
// version :  v0.1.0 2021/01/30 完成了最初的框架
// ------------------------------------------------------------------------------
// [Twitter] https://twitter.com/_MikanHako/
// -[GitHub] https://github.com/MikanHako1024/
// ---[Blog] NONE
// -----[QQ] 312859582
//=============================================================================




/*:
 * @plugindesc 行为树 <MK_RM_BehaviorTree>
 * @author Mikan 
 * @version v0.1.0 2021/01/30 完成了最初的框架
 * v0.0.0 2021/01/18 项目计划中
 */




// 尝试在事件里配置行为树 
/*
事件备注 <BT>
注释
<NPC> : 根节点
<Condition>	: 条件节点 (叶节点)
	
<Action>　 	:　动作节点 (叶节点)

<Selector> 	: 组合节点-选择
	顺序迭代执行子节点，遇到true时停止执行，返回true，全为false时，返回false
<Sequence> 	: 组合节点-序列
	顺序迭代执行子节点，遇到false时停止执行，返回false，全为true时，返回true
<Parallel> 	: 组合节点-并行
	顺序执行全部子节点
	Parallel Selector Node: 一False则返回False，全True才返回True。
	Parallel Sequence Node: 一True则返回True，全False才返回False。
	Parallel  Hybird  Node: 指定数量的子节点返回True或False后才决定结果。
<Decorator>	: 修饰节点

...
*/



// NPC行动的一个示例
/*
Sequence  // 大分类
(Condition : 工作日)

	Sequence  // 状态 6-7
		Sequence  // 6-7 Enter
			Action : 起床动作
			Action : 设置移动 房间内巡逻
		Sequence  // 6-7 Update
		(ConditionalLoop : 6:00 ~ 7:00)
			Action : 巡逻移动
		Sequence  // 6-7 Exit
			Action : 清除巡逻

	Sequence  // 状态 7-9
		Sequence  // 7-9 Enter
			Action : 设置移动 移至店铺
			Selector
			(ConditionalLoop : 移动未完成)
				Sequence  // 晴天 行走
				(ConditionalLoop : 晴天)
					Action : 行走 移动
				Sequence  // 雨天 跑步
				(ConditionalLoop : 雨天)
					Action : 跑步 移动
			Action : 开门 标志ON
			Action : 设置移动 店铺内巡逻
		Sequence  // 7-9 Update
		(ConditionalLoop : 7:00 ~ 9:00)
			Action : 巡逻移动
		Sequence  // 7-9 Exit
			Action : 清除巡逻

	Sequence  // 状态 9-18
		Sequence  // 9-18 Enter
			Action : 设置移动 移至柜台
			Sequence
			(ConditionalLoop : 移动未完成)
				Action : 移动
			Action : 营业 标志ON
		Sequence  // 9-18 Update
		(ConditionalLoop : 9:00 ~ 18:00)
			Action : 站立
		Sequence  // 9-18 Exit
			Action : 营业 标志OFF

	Sequence  // 状态 18-22
		Sequence  // 18-22 Enter
			Action : 设置移动 移至家
			Sequence
			(ConditionalLoop : 移动未完成)
				Action : 移动
			Action : 设置移动 家内巡逻
		Sequence  // 18-22 Update
		(ConditionalLoop : 18:00 ~ 22:00)
			Action : 巡逻移动
		Sequence  // 18-22 Exit
			Action : 清除巡逻

	Sequence  // 状态 22-6+1
		Sequence  // 22-+1 Enter
			Action : 设置移动 移至床
			Sequence
			(ConditionalLoop : 移动未完成)
				Action : 移动
			Action : 睡觉动作
		Sequence  // 22-+1 Update
		(ConditionalLoop : 22:00 ~ 6:00+1)
			Action : 睡觉
		Sequence  // 22-+1 Exit
			Action : None
*/




// 需要的功能/能力
/*
基本能力：根据当前条件，进行某一动作

条件判断：根据条件判断是否执行节点
	修饰节点 - Condition
依次执行：依次执行节点
	组合节点 - Sequence
	组合节点 - Selector
？并行执行：同时执行节点
	组合节点 - Parallel
执行命令
	动作节点 - 执行RM命令
随机：赋值随机值
	动作节点 - RandomValue
while循环：循环执行子树 直到成功/失败
	修饰节点 - Until Success/Failure
for循环：循环执行子树 共N次
	修饰节点 - Repeater
跳出：跳出子树的执行 return
	修饰节点 - Return Success/Failure
逻辑运算取反：子树结果取反
	修饰节点 - Inverter
设置结果 - 结果强制 Success/Failure
	修饰节点 - Result Success/Failure
中断：结束执行
	none, self, lowerpriorit, both
	修饰节点 - 黑板装饰器
等待：等待一段时间
	动作节点 - Wait
变量：记录值
等待下一帧
...

特殊需求：
	能处理时间跳跃
*/



// 节点介绍
/*
根节点
	不能被修饰节点修饰
动作节点
	Action
		叶子节点
		执行一个动作
组合节点
	非叶子节点
	Sequence
		顺序执行子树
		当遇到 Failure 结束执行 返回 Failure
		未遇到 Failure 返回 Success
	Selector
		顺序执行子树
		当遇到 Success 结束执行 返回 Success
		未遇到 Success 返回 Failure
修饰节点
	非叶子节点
	有且只有一个直接子节点
	(Condition)
		满足条件时执行被修饰的节点 返回 节点结果
		不满足条件时 返回 Failure
	(ResultSuccess)
		执行被修饰的节点 返回 Success
	(ResultFailure)
		执行被修饰的节点 返回 Failure
	(UntilFailure)
		循环执行被修饰节点 直到节点结果为Failure ？返回Failure
*/



// 用行为树表示NPC行动的一个示例
/*
[Root]
	(Condition) : 工作日
	Sequence
		(ResultSuccess)
		(Condition : 6:00 ~ 7:00)
		Sequence
			Action : 起床动作
			Action : 设置巡逻 房间内巡逻
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 6:00 ~ 7:00  (考虑记录这个条件表达式 与父节点公用这个条件表达式)
			Action : 执行巡逻移动
			Action : 清除巡逻

		(ResultSuccess)
		(Condition) : 7:00 ~ 9:00
		Sequence
			Action : 设置移动 移至店铺
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 移动未完成
			Sequence
				(ResultSuccess)
				Selector
					(Condition) : 晴天
					Action : 设置移动方式 行走
					(Condition) : 雨天
					Action : 设置移动方式 跑步
				Action : 执行路径移动
			Action : 开门 标志ON
			(Condition) : 移动方式 跑步
			Action : 设置移动方式 行走
			Action : 进门 (传送至店内门口)
			Action : 设置巡逻 店铺内巡逻
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 7:00 ~ 9:00
			Action : 执行巡逻移动
			Action : 清除巡逻

		(ResultSuccess)
		(Condition) : 9:00 ~ 18:00
		Sequence
			Action : 设置移动 移至柜台
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 移动未完成
			Action : 执行路径移动
			Action : 营业 标志ON
			// Action : 互动标志设置为xxx (TODO)
			Action : 设置巡逻 柜台前巡逻 (也可以是站在同一个位置不移动)
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 9:00 ~ 18:00
			Action : 执行巡逻移动
			Action : 清除巡逻
			Action : 营业 标志OFF

		(ResultSuccess)
		(Condition) : 18:00 ~ 22:00
		Sequence
			Action : 设置移动 移至家
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 移动未完成
			Action : 执行路径移动  (这一部分也可以考虑直接 : 循环移动到家)
			Action : 设置巡逻 家内巡逻
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 18:00 ~ 22:00
			Action : 执行巡逻移动
			Action : 清除巡逻

		(ResultSuccess)
		(Condition) : 18:00 ~ 22:00
		Sequence
			Action : 设置移动 移至家
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 移动未完成
			Action : 执行路径移动  (这一部分也可以考虑直接 : 循环移动到家)
			Action : 设置巡逻 家内巡逻
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 18:00 ~ 22:00
			Action : 执行巡逻移动
			Action : 清除巡逻

		(ResultSuccess)
		(Condition) : 22:00 ~ 6:00+1
		Sequence
			Action : 设置移动 移至床
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 移动未完成
			Action : 执行路径移动
			Action : 设置巡逻 睡觉巡逻 (睡觉的动作等)
			(ResultSuccess)
			(UntilFailure)
			(Condition) : 22:00 ~ 6:00+1
			Action : 执行巡逻移动
			Action : 清除巡逻
*/



// 简单实现
(() => {
	"use strict";

	const BtNodeState = {
		ready: 0, 
		running: 1, 
		success: 2, 
		failure: 3, 
	};

	const BtNodeStateName = {
		ready: 'ready', 
		running: 'running', 
		success: 'success', 
		failure: 'failure', 
		0 : 'ready', 
		1 : 'running', 
		2 : 'success', 
		3 : 'failure', 
	};

	class BtNode_Base {
		state = BtNodeState.ready;

		constructor() {
		}

		cloneNode() {
		}
		saveNode() {
		}
		static loadNode(node) {
		}

		getState() {
			return this.state;
		}
		setState(state) {
			this.state = state;
		}

		getStateName() {
			return BtNodeStateName[this.state];
		}

		// 作为树形结构，补足该方法
		addChild() {
		}
		getChild() {
		}

		setStateReady() {
			this.setState(BtNodeState.ready);
		}
		setStateRunning() {
			this.setState(BtNodeState.running);
		}
		setStateSuccess() {
			this.setState(BtNodeState.success);
		}
		setStateFailure() {
			this.setState(BtNodeState.failure);
		}

		reset() {
			this.setStateReady();
		}

		/*
		 * 执行节点
		 * 根据当前状态进行不同的处理
		 * @method execute
		 * @return {Number} 节点状态 BtNodeResult 
		 */
		execute() {
			switch (this.state) {
				case BtNodeState.ready:
					this.executeOnReady();
					break;
				case BtNodeState.running:
					this.executeOnRunning();
					break;
				case BtNodeState.success:
					this.executeOnSuccess();
					break;
				case BtNodeState.failure:
					this.executeOnFailure();
					break;
				default:
			}
			return this.state;
		}

		// 派生类 需要重写 executeOnXXX 完成对应操作 和 状态变化
		executeOnReady() {
		}
		executeOnRunning() {
		}
		executeOnSuccess() {
		}
		executeOnFailure() {
		}
	}


	class BtNode_Root extends BtNode_Base {
		children = [];
		addChild(node) {
			if (node instanceof BtNode_Base) {
				this.children.push(node);
			}
			else {
				console.warn('node is not a BehaviorTreeNode', node, this);
			}
		}
		getChild(arr) {
			if (Array.isArray(arr)) {
				if (arr.length > 1) {
					return this.children[arr[0]].getChild(arr.slice(1));
				}
				else {
					return this.children[arr[0]];
				}
			}
			else {
				return this.children[arr];
			}
		}

		reset() {
			this.children.forEach((each) => each.reset());
			super.reset();
		}
		
		executeOnReady() {
			this.setStateRunning();
			this.executeOnRunning();
		}
		executeOnRunning() {
			for (var i = 0; i < this.children.length; i++) {
				// 如果执行未完成，则执行
				if ([BtNodeState.ready, BtNodeState.running]
						.includes(this.children[i].getState())) {
					this.children[i].execute();
				}
				// 检查执行结果
				switch (this.children[i].getState()) {
					case BtNodeState.ready:
						return ;
					case BtNodeState.running:
						return ;
					case BtNodeState.success:
						continue;
					case BtNodeState.failure:
						continue;
				}
			}
			// 循环结束
			this.setStateSuccess();
			this.executeOnSuccess();
		}
		//executeOnSuccess() {
		//}
		//executeOnFailure() {
		//}
	}


	class BtNode_ActionBase extends BtNode_Base {
		constructor(handle) {
			super();
			this.setAction(handle);
		}

		actionHandle = null;
		setAction(handle) {
			if (handle instanceof Function) {
				this.actionHandle = handle;
			}
			else {
				this.actionHandle = null;
				if (!(typeof handle === 'undefined' || handle == null)) {
					console.warn('handle is not a Function', handle, this);
				}
			}
		}
		execAction() {
			if (this.actionHandle) {
				this.actionHandle(this);
			}
			else {
				this.setStateSuccess();
			}
		}
		
		//addChild() {
		//}

		executeOnReady() {
			this.setStateRunning();
			this.executeOnRunning();
		}
		executeOnRunning() {
			// 如果执行未完成，则执行
			if ([BtNodeState.ready, BtNodeState.running]
					.includes(this.state)) {
				this.execAction();
			}
			// 检查执行结果
			// 注意需要在设置的handle里，完成状态的变化
			switch (this.state) {
				case BtNodeState.ready:
					break;
				case BtNodeState.running:
					break;
				case BtNodeState.success:
					this.executeOnSuccess();
					break;
				case BtNodeState.failure:
					this.executeOnFailure();
					break;
			}
		}
		//executeOnSuccess() {
		//}
		//executeOnFailure() {
		//}
	}

	class BtNode_LogTextAction extends BtNode_ActionBase {
		constructor(text) {
			super(null);
			this.setLogText(text);
		}
		
		logText = '';
		setLogText(text) {
			this.logText = text || '';
			super.setAction((node) => {
				console.log(this.logText);
				node.setStateSuccess();
			});
		}
	}

	class BtNode_LogAction extends BtNode_ActionBase {
		constructor(handle) {
			super(null);
			this.setLogHandle(handle);
		}
		
		logHandle = null;
		setLogHandle(handle) {
			this.logHandle = handle || null;
			super.setAction((node) => {
				if (this.logHandle) {
					if (typeof this.logHandle === 'function') {
						console.log(this.logHandle(node));
					}
					else {
						console.log(this.logHandle);
					}
				}
				this.setStateSuccess();
			});
		}
	}

	// 根据执行结果确定是否等待下一步
	class BtNode_StepAction extends BtNode_ActionBase {
		constructor(handle) {
			super(null);
			this.setStepHandle(handle);
		}
		
		stepHandle = null;
		setStepHandle(handle) {
			this.stepHandle = handle || null;
			super.setAction((node) => {
				if (this.stepHandle) {
					// true : 节点未执行结束，还需要等待继续执行 ; false : 节点执行结束
					// false 表示执行结束，为了防止忘记返回值
					if (!!this.stepHandle(node)) {
					}
					else {
						this.setStateSuccess();
					}
				}
				else {
					this.setStateSuccess();
				}
			});
		}
	}

	// 执行结束便等待下一步
	class BtNode_OneStepAction extends BtNode_ActionBase {
		constructor(handle) {
			super(null);
			this.setStepHandle(handle);
		}
		
		waitStep = 0;
		reset() {
			super.reset();
			this.waitStep = 0;
		}

		stepHandle = null;
		setStepHandle(handle) {
			this.stepHandle = handle || null;
			super.setAction((node) => {
				if (this.waitStep <= 0) {
					// 未执行
					if (this.stepHandle) {
						this.stepHandle(node);
					}
					this.waitStep++;
				}
				else {
					// 已执行，现在是第二次执行
					this.setStateSuccess();
					// ？强制成功
				}
			});
		}
	}

	class BtNode_ExecuteAction extends BtNode_ActionBase {
		constructor(handle) {
			super(null);
			this.setExecuteHandle(handle);
		}
		
		executeHandle = null;
		setExecuteHandle(handle) {
			this.executeHandle = handle || null;
			super.setAction((node) => {
				if (this.executeHandle) {
					this.executeHandle(node);
				}
				this.setStateSuccess();
				// ？强制成功
			});
		}
	}


	class BtNode_Composite extends BtNode_Base {
		constructor(nodes) {
			super();
			!!nodes && nodes.forEach((node) => this.addChild(node));
		}

		children = [];
		addChild(node) {
			if (node instanceof BtNode_Base) {
				this.children.push(node);
			}
			else {
				console.warn('node is not a BehaviorTreeNode', node, this);
			}
		}
		getChild(arr) {
			if (Array.isArray(arr)) {
				if (arr.length > 1) {
					return this.children[arr[0]].getChild(arr.slice(1));
				}
				else {
					return this.children[arr[0]];
				}
			}
			else {
				return this.children[arr];
			}
		}

		reset() {
			this.children.forEach((each) => each.reset());
			super.reset();
		}

		executeOnReady() {
			this.setStateRunning();
			this.executeOnRunning();
		}
		//executeOnRunning() {
		//}
		//executeOnSuccess() {
		//}
		//executeOnFailure() {
		//}
	}

	class BtNode_Sequence extends BtNode_Composite {
		executeOnRunning() {
			for (var i = 0; i < this.children.length; i++) {
				// 如果执行未完成，则执行
				if ([BtNodeState.ready, BtNodeState.running]
						.includes(this.children[i].getState())) {
					this.children[i].execute();
				}
				// 检查执行结果
				switch (this.children[i].getState()) {
					case BtNodeState.ready:
						return ;
					case BtNodeState.running:
						return ;
					case BtNodeState.success:
						continue;
					case BtNodeState.failure:
						this.setStateFailure();
						this.executeOnFailure();
						return ;
				}
			}
			// 循环结束
			this.setStateSuccess();
			this.executeOnSuccess();
		}
	}

	class BtNode_Selector extends BtNode_Composite {
		executeOnRunning() {
			for (var i = 0; i < this.children.length; i++) {
				// 如果执行未完成，则执行
				if ([BtNodeState.ready, BtNodeState.running]
						.includes(this.children[i].getState())) {
					this.children[i].execute();
				}
				// 检查执行结果
				switch (this.children[i].state) {
					case BtNodeState.ready:
						return ;
					case BtNodeState.running:
						return ;
					case BtNodeState.success:
						this.setStateSuccess();
						this.executeOnSuccess();
						return ;
					case BtNodeState.failure:
						continue;
				}
			}
			// 循环结束
			this.setStateFailure();
			this.executeOnFailure();
		}
	}


	class BtNode_Decorator extends BtNode_Base {
		constructor(node) {
			super();
			this.setChildNode(node);
		}

		childNode = null;
		setChildNode(node) {
			if (node instanceof BtNode_Base) {
				this.childNode = node || null;
			}
			else {
				if (!(typeof node === 'undefined' || node == null)) {
					console.warn('node is not a BehaviorTreeNode', node, this);
				}
			}
		}

		// 兼容 addChild 方法
		addChild(node) {
			this.setChildNode(node);
		}
		// 兼容 getChild 方法
		getChild(arr) {
			if (Array.isArray(arr)) {
				if (arr.length > 1) {
					return this.childNode.getChild(arr.slice(1));
				}
				else {
					return this.childNode;
				}
			}
			else {
				return this.childNode;
			}
		}

		reset() {
			this.childNode.reset();
			super.reset();
		}

		executeOnReady() {
			this.setStateRunning();
			this.executeOnRunning();
		}
		executeOnRunning() {
			if (this.childNode) {
				// 如果执行未完成，则执行
				if ([BtNodeState.ready, BtNodeState.running]
						.includes(this.childNode.getState())) {
					this.childNode.execute();
				}
				// 检查执行结果
				switch (this.childNode.getState()) {
					case BtNodeState.ready:
						this.executeChildOnReady();
						break;
					case BtNodeState.running:
						this.executeChildOnRunning();
						break;
					case BtNodeState.success:
						this.executeChildOnSuccess();
						break;
					case BtNodeState.failure:
						this.executeChildOnFailure();
						break;
				}
			}
			else {
				this.executeChildOnNotHave();
			}
		}
		//executeOnSuccess() {
		//}
		//executeOnFailure() {
		//}

		executeChildOnReady() {
		}
		executeChildOnRunning() {
		}
		executeChildOnSuccess() {
		}
		executeChildOnFailure() {
		}

		executeChildOnNotHave() {
		}
	}

	class BtNode_ConditionDecorator extends BtNode_Decorator {
		constructor(node, handle) {
			if (node instanceof BtNode_Base) {
				super(node);
				this.setCondition(handle);
			}
			else {
				super();
				this.setCondition(node); // handle
			}
		}

		conditionHandle = null;
		setCondition(handle) {
			if (handle instanceof Function) {
				this.conditionHandle = handle;
			}
			else {
				this.conditionHandle = () => handle;
			}
		}
		execCondition() {
			if (this.conditionHandle) {
				return this.conditionHandle(this);
			}
			return false;
		}

		executeOnReady() {
			if (this.execCondition()) {
				super.executeOnReady();
			}
			else {
				this.setStateFailure();
				this.executeOnFailure();
			}
		}

		//executeChildOnReady() {
		//}
		//executeChildOnRunning() {
		//}
		executeChildOnSuccess() {
			this.setStateSuccess();
			this.executeOnSuccess();
		}
		executeChildOnFailure() {
			// ？子节点执行失败时 是否应该返回失败
			this.setStateFailure();
			this.executeOnFailure();
		}

		//executeChildOnNotHave() {
		//}
	}


	class BtNode_LoopDecoratorBase extends BtNode_Decorator {

		resetChildNode() {
			!!this.childNode && this.childNode.reset();
		}

		needLoop = false;
		executeLoopContinue() {
			this.needLoop = true;
			this.resetChildNode();
		}
		executeLoopBreak() {
			this.needLoop = false;
		}

		executeOnReady() {
			this.executeLoopContinue();
			super.executeOnReady();
		}
		executeOnRunning() {
			this.needLoop = true; // 保证执行一次
			while (this.needLoop) {
				this.needLoop = false;
				// 只有执行 executeLoopContinue 时才能继续循环 防止一些死循环
				super.executeOnRunning();
			}
		}

		//executeChildOnReady() {
		//}
		//executeChildOnRunning() {
		//}
		//executeChildOnSuccess() {
		//}
		//executeChildOnFailure() {
		//}

		executeChildOnNotHave() {
			this.executeOnEndLoop();
		}

		executeOnEndLoop() {
		}
	}

	class BtNode_UntilSuccess extends BtNode_LoopDecoratorBase {
		//executeChildOnReady() {
		//}
		//executeChildOnRunning() {
		//}
		//executeChildOnSuccess() {
		//}
		executeChildOnSuccess() {
			this.executeLoopBreak();
			this.executeOnEndLoop();
		}
		executeChildOnFailure() {
			this.executeLoopContinue();
		}

		//executeChildOnNotHave() {
		//}

		executeOnEndLoop() {
			this.setStateSuccess();
			this.executeOnSuccess();
		}
		// ？UntilSuccess 跳出循环时 是否应该返回成功
	}

	class BtNode_UntilFailure extends BtNode_LoopDecoratorBase {
		//executeChildOnReady() {
		//}
		//executeChildOnRunning() {
		//}
		executeChildOnSuccess() {
			this.executeLoopContinue();
		}
		executeChildOnFailure() {
			this.executeLoopBreak();
			this.executeOnEndLoop();
		}

		//executeChildOnNotHave() {
		//}

		executeOnEndLoop() {
			this.setStateFailure();
			this.executeOnFailure();
		}
		// UntilFailure 跳出循环时 是否应该返回失败
	}
	
	class BtNode_ConditionLoop extends BtNode_LoopDecoratorBase {
	}
	// TODO


	class BtNode_ResultSuccess extends BtNode_Decorator {
		//executeChildOnReady() {
		//}
		//executeChildOnRunning() {
		//}
		executeChildOnSuccess() {
			this.setStateSuccess();
			this.executeOnSuccess();
		}
		executeChildOnFailure() {
			this.setStateSuccess();
			this.executeOnSuccess();
		}

		//executeChildOnNotHave() {
		//}
	}

	class BtNode_ResultFailure extends BtNode_Decorator {
		//executeChildOnReady() {
		//}
		//executeChildOnRunning() {
		//}
		executeChildOnSuccess() {
			this.setStateFailure();
			this.executeOnFailure();
		}
		executeChildOnFailure() {
			this.setStateFailure();
			this.executeOnFailure();
		}

		//executeChildOnNotHave() {
		//}
	}


	const BehaviorTreeNodeLib = {
		Root: BtNode_Root, 
		Action: {
			LogText: BtNode_LogTextAction, 
			Log: BtNode_LogAction, 
			Step: BtNode_StepAction, 
			OneStep: BtNode_OneStepAction,  
			Execute: BtNode_ExecuteAction, 
		}, 
		Composite: {
			Sequence: BtNode_Sequence, 
			Selector: BtNode_Selector, 
		}, 
		Decorator: {
			Condition: BtNode_ConditionDecorator, 
			Loop: {
				UntilSuccess: BtNode_UntilSuccess, 
				UntilFailure: BtNode_UntilFailure, 
			}, 
			ResultSuccess: BtNode_ResultSuccess, 
			ResultFailure: BtNode_ResultFailure, 
		}
	};

	const getBehaviorTreeNodeClass = (arr) => {
		var res = BehaviorTreeNodeLib;
		for (var i = 0; i < arr.length; i++) { 
			res = res[arr[i]] || {};
		}
		return res || null;
	};

	// config 结构 { type: 'xx.yy', args: [aa, bb], children: [subConfig1, subConfig2] }
	const createBehaviorTree = (config) => {
		const NodeClass = getBehaviorTreeNodeClass((config.type || '').split('.'));
		if (!NodeClass) return null;
		const args = Array.isArray(config.args)
						 ? config.args
						 : !!config.args ? [config.args] : [];
		const node = new NodeClass(...args);
		const children = Array.isArray(config.children)
						 ? config.children
						 : !!config.children ? [config.children] : [];
		children.forEach((subConfig) => 
			node.addChild(createBehaviorTree(subConfig)));
		return node;
	};

	// listConfig 结构 [ { type: 'xx.yy', args: [aa, bb], children: [2, 3] }, {} ]
	// 可以加入 id 作为标识，不影响生成 { id: 0, type: 'xx.yy', args: [aa, bb], children: [2, 3] }
	const listConfig2ObjectConfig = (listConfig) => {
		// 注意防止循环嵌套

		var locks = new Array(listConfig.length).fill(false);
		var usedFlags = new Array(listConfig.length).fill(false);
		var stack = [];
		function stackPush(id) {
			locks[id] = true;
			return stack.push(id);
		}
		function stackTop() {
			return stack[stack.length-1];
		}
		function stackPop() {
			locks[stackTop()] = false;
			return stack.pop();
		}

		function func(pid) {
			stackPush(pid);
			usedFlags[pid] = true;

			if (!listConfig[pid]) {
				console.warn(`not have node ${pid}`, listConfig);
			}
			else if (!listConfig[pid].type) {
				console.warn(`node ${pid} not have type`, listConfig);
			}
			else if (typeof listConfig[pid].id !== 'undefined') {
				if (listConfig[pid].id != pid) {
					console.warn(`the id ${listConfig[pid].id} of node ${pid} is not same`, listConfig);
				}
			}

			var config = {
				type: listConfig[pid].type, 
				args: listConfig[pid].args, 
				children: [], 
			};

			if (!!listConfig[pid] && !!listConfig[pid].children) {
				listConfig[pid].children.forEach(cid => {
					if (!locks[cid]) {
						var child = func(cid);
						!!child && config.children.push(child);
					}
					else {
						console.warn(`child ${cid} of parent ${pid} is locks`, locks);
					}
				});
			}

			stackPop();
			return config;
		}

		// TODO : 不允许重复使用节点，出现时进行警告

		var config = func(0);

		var notUsedFlags = usedFlags.map((used, i) => !used ? i : null).filter(each => !!each);
		if (notUsedFlags.length > 0) {
			console.warn(`total ${notUsedFlags.length} node(s) not use`, notUsedFlags);
		}

		return config;
	};

	const createBehaviorTreeByList = (listConfig) => {
		return createBehaviorTree(listConfig2ObjectConfig(listConfig));
	};

	window.BehaviorTree = {
		BtNodeState, 
		BtNodeStateName, 
		createBehaviorTree, 
		createBehaviorTreeByList, 
		listConfig2ObjectConfig, 
	}
})();




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


