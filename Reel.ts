import { _decorator, Component, Node, Sprite, SpriteFrame, UITransform, tween, Tween, Vec3, ScrollView } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Reel')
export class Reel extends Component {
    @property([Sprite])
    symbols: Sprite[] = [];

    @property([SpriteFrame])
    symbolSprites: SpriteFrame[] = [];

    @property
    spinDuration: number = 2;

    @property
    spinSpeed: number = 500;

    @property
    symbolSpacing: number = 50;

    @property(ScrollView)
    scrollView: ScrollView = null!;

    private currentSymbols: number[] = [0, 1, 2]; // Current symbol indices for top, middle, bottom
    private isSpinning: boolean = false;

    start() {
        this.initializeSymbols();
    }

    private initializeSymbols() {
        // Set initial random symbols
        for (let i = 0; i < this.symbols.length && i < this.symbolSprites.length; i++) {
            this.currentSymbols[i] = Math.floor(Math.random() * this.symbolSprites.length);
            if (this.symbols[i]) {
                this.symbols[i].spriteFrame = this.symbolSprites[this.currentSymbols[i]];
            }
        }
    }

    async spin(delay: number = 0): Promise<void> {
        return new Promise((resolve) => {
            if (this.isSpinning) {
                resolve();
                return;
            }

            this.isSpinning = true;

            // 添加開始旋轉的縮放效果
            tween(this.node)
                .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .call(() => {
                    // Wait for delay
                    setTimeout(() => {
                        this.startSpinAnimation().then(() => {
                            this.isSpinning = false;
                            resolve();
                        });
                    }, delay * 1000);
                })
                .start();
        });
    }

    private async startSpinAnimation(): Promise<void> {
        return new Promise((resolve) => {
            let spinCount = 0;
            const maxSpins = 20 + Math.random() * 10; // Random number of spins
            const symbolHeight = 150; // 符號高度
            const visibleArea = symbolHeight * 1.5; // 可見區域高度

            // 初始化符號位置
            this.initializeSymbolPositions();

            const spinStep = () => {
                spinCount++;
                this.updateSymbolsSliding();
                //console.log(this);

                // 當快到maxSpins時，逐漸減慢速度
                if (spinCount < maxSpins) {
                    const spinProgress = spinCount / maxSpins;
                    const spinSpeed = Math.max(30, 150 * (1 - spinProgress)); // 減慢速度
                    setTimeout(spinStep, spinSpeed);
                } else {
                    // 停止滑動動畫並添加彈跳效果
                    this.stopSlidingAnimation().then(() => {
                        console.log("Reel final score print");
                        this.finalizeSpin();
                        // 印出最終成果
                        //console.log("Reel stopped at symbols:", this.getTopSymbol(), this.getMiddleSymbol(), this.getBottomSymbol());
                        resolve();
                    });
                }
            };

            spinStep();
        });
    }

    private initializeSymbolPositions() {
        const symbolHeight = 150;
        for (let i = 0; i < this.symbols.length; i++) {
            if (this.symbols[i]) {
                this.symbols[i].node.setPosition(0, symbolHeight - (i * symbolHeight), 0);
            }
        }
    }

    private updateSymbolsSliding() {
        const symbolHeight = 150;
        const slideSpeed = 20; // 每次滑動的距離
        let isChanged = false;

        for (let i = 0; i < this.symbols.length; i++) {
            if (this.symbols[i]) {
                const currentPos = this.symbols[i].node.position;
                const newY = currentPos.y - slideSpeed;

                // 如果符號滑到底部，移到上方並更換圖片
                if (newY < -symbolHeight * 1.5) {
                    // 移到最上方
                    this.symbols[i].node.setPosition(0, symbolHeight * 1.5, 0);
                    // 更新Symbol的順序，將底部的Symbol移到最上方
                    isChanged = true;

                    // 更換為新符號
                    const newSymbolIndex = Math.floor(Math.random() * this.symbolSprites.length);
                    this.symbols[i].spriteFrame = this.symbolSprites[newSymbolIndex];

                    // 更新符號索引
                    this.currentSymbols[i] = newSymbolIndex;
                } else {
                    this.symbols[i].node.setPosition(0, newY, 0);
                }
            }
        }
        if (isChanged) {
            // 重新排序symbols陣列，將滑到底的Symbol移到最前面
            this.symbols.sort((a, b) => b.node.position.y - a.node.position.y);
        }
    }

    private async stopSlidingAnimation(): Promise<void> {
        return new Promise((resolve) => {
            // 停止所有符號的滑動，讓它們停在正確位置
            const symbolHeight = 150;
            const targetPositions = [
                new Vec3(0, symbolHeight, 0),    // 頂部符號
                new Vec3(0, 0, 0),               // 中間符號
                new Vec3(0, -symbolHeight, 0)    // 底部符號
            ];

            const tweens = this.symbols.map((symbol, index) => {
                if (symbol) {
                    return tween(symbol.node)
                        .to(0.3, { position: targetPositions[index] }, { easing: 'quadOut' })
                        .start();
                }
                return null;
            });

            // 等待所有動畫完成
            setTimeout(() => {
                // 添加彈跳效果到整個reel
                tween(this.node)
                    .to(0.1, { scale: new Vec3(1.05, 1.05, 1) })
                    .to(0.1, { scale: new Vec3(1, 1, 1) })
                    .call(() => {
                        console.log("Reel spin complete");
                        resolve();
                    })
                    .start();
            }, 300);
        });
    }

    order()
    {
        console.log("order called");
    }

    callorder()
    {
        this.order.call(this);
    }

    private updateSymbolsDuringSpin() {
        // 這個方法現在由updateSymbolsSliding替換
    }

    private finalizeSpin() {
        // 確保最終位置和符號正確
        const symbolHeight = 150;


        for (let i = 0; i < this.symbols.length && i < this.symbolSprites.length; i++) {
            if (this.symbols[i]) {
                //根據當前的譜面獲得最終成果並記錄
                let number = this.symbolSprites.indexOf(this.symbols[i].spriteFrame) + 1;
                this.currentSymbols[i] = number;
            }
        }

        //印出最終成果
        console.log("Final symbols:", this.currentSymbols);
    }

    getMiddleSymbol(): number {
        return this.currentSymbols[1] || 0; // Middle symbol
    }

    getTopSymbol(): number {
        return this.currentSymbols[0] || 0; // Top symbol
    }

    getBottomSymbol(): number {
        return this.currentSymbols[2] || 0; // Bottom symbol
    }

    getSymbolAt(position: number): number {
        return this.currentSymbols[position] || 0;
    }
}
