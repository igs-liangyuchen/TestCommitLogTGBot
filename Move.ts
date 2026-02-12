import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Move')
export class Move extends Component {
    private _keys: Set<number> = new Set();

    // CCFloat是For Inspector，告知編輯器顯示為「小數調整控制」
    @property(CCFloat)
    public moveSpeed:number = 0.2; // TypeScript 語言，決定變數型別（整數 / 浮點都可）
    // 若不寫number只給初始值，他會針對初始值推斷型別，但若不給初始值，該變數型別為any(var)

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        // 這邊可以直接使用KeyCode.KEY_A, KeyCode.KEY_D, KeyCode.KEY_W, KeyCode.KEY_S
        // 但在這裡將累計的Keycode的資訊buffer起來，在Update的時候再進行處理
        this._keys.add(event.keyCode);
        

    }

    onKeyUp(event: EventKeyboard) {
        this._keys.delete(event.keyCode);
    }

    
    update(deltaTime: number) {
        // A key = 65, D key = 68, W key = 87, S key = 83
        if (this._keys.has(KeyCode.KEY_A)) {  // A
            this.node.setPosition(this.node.position.x - (1* this.moveSpeed), this.node.position.y, this.node.position.z);
        }
        if (this._keys.has(KeyCode.KEY_D)) {  // D
            this.node.setPosition(this.node.position.x + (1* this.moveSpeed), this.node.position.y, this.node.position.z);
        }
        if (this._keys.has(KeyCode.KEY_W)) {  // W
            this.node.setPosition(this.node.position.x, this.node.position.y + (1* this.moveSpeed), this.node.position.z);
        }
        if (this._keys.has(KeyCode.KEY_S)) {  // S
            this.node.setPosition(this.node.position.x, this.node.position.y - (1* this.moveSpeed), this.node.position.z);
        }
    }
}




