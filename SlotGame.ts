import { _decorator, Component, Node, Button, Label, instantiate } from 'cc';
import { Reel } from './Reel';

const { ccclass, property } = _decorator;

// slot game server logic

@ccclass('SlotGame')
export class SlotGame extends Component {
    @property([Reel])
    reels: Reel[] = [];

    @property(Button)
    spinButton: Button = null!;

    @property(Button)
    autoSpinButton: Button = null!;


    @property(Label)
    balanceLabel: Label = null!;

    @property(Label)
    betLabel: Label = null!;

    @property(Label)
    winLabel: Label = null!;

    private balance: number = 1000;
    private betAmount: number = 10;
    private isSpinning: boolean = false;

    // Paylines: [reelIndex, symbolPosition][]
    private paylines: number[][][] = [
        [[0, 1], [1, 1], [2, 1]], // Middle horizontal
        [[0, 0], [1, 0], [2, 0]], // Top horizontal
        [[0, 2], [1, 2], [2, 2]], // Bottom horizontal
        [[0, 0], [1, 1], [2, 2]], // Diagonal \ (斜線)
        [[0, 2], [1, 1], [2, 0]]  // Diagonal / (反斜線)
    ];

    // set this as a singleton
    private static _instance: SlotGame | null = null;

    public static get instance(): SlotGame {
        if (!this._instance) {
            throw new Error("SlotGame instance not set");
        }
        return this._instance;
    }

    start() {
        SlotGame._instance = this;
        this.spinButton.node.on(Button.EventType.CLICK, this.onSpinClick, this);
        this.autoSpinButton.node.on(Button.EventType.CLICK, this.onAutoSpinClick, this);
        this.updateUI();
    }

    private onSpinClick() {
        if (this.isSpinning || this.balance < this.betAmount) {
            return;
        }

        this.balance -= this.betAmount;
        this.isSpinning = true;
        this.spinButton.interactable = false;
        this.winLabel.string = '';

        // Start spinning all reels
        const spinPromises = this.reels.map((reel, index) => {
            return reel.spin(index * 0.2); // Stagger the spin start
        });

        // Wait for all reels to stop
        Promise.all(spinPromises).then(() => {
            this.isSpinning = false;
            this.spinButton.interactable = true;
            this.checkWin();
        });

        this.updateUI();
    }

    private onAutoSpinClick() {
        if (this.isSpinning || this.balance < this.betAmount) {
            return;
        }

        this.balance -= this.betAmount;
        this.isSpinning = true;
        this.spinButton.interactable = false;
        this.autoSpinButton.interactable = false;
        this.winLabel.string = '';

        // Start spinning all reels
        const spinPromises = this.reels.map((reel, index) => {
            return reel.spin(index * 0.2); // Stagger the spin start
        });

        // Wait for all reels to stop
        Promise.all(spinPromises).then(() => {
            this.isSpinning = false;
            this.checkWin(true);
            this.spinButton.interactable = true;
            this.autoSpinButton.interactable = true;
        });

        this.updateUI();
    }

    private checkWin(isAutoSpin: boolean = false) {
        // Check for wins on all paylines
        const winAmount = this.calculateWin();
        if (winAmount > 0) {
            this.balance += winAmount;
            this.winLabel.string = `WIN: ${winAmount}`;
        }
        else 
        {
            if (isAutoSpin) {
                this.onAutoSpinClick();
                return;
            }
        }

        this.updateUI();
    }

    private calculateWin(): number {
        // Simple win calculation: 3 of a kind pays bet * multiplier
        const multipliers = [0, 2, 3, 5, 10, 20, 50, 100, 200]; // Index 0 is unused
        let totalWin = 0;

        for (const payline of this.paylines) {
            // get payline index
            const paylineIndex = this.paylines.indexOf(payline);

            const symbols = payline.map(([reelIndex, pos]) => this.reels[reelIndex].getSymbolAt(pos));
            if (symbols[0] === symbols[1] && symbols[1] === symbols[2] && symbols[0] !== 0) {
                console.log(`Payline ${paylineIndex} won: ${this.betAmount * multipliers[symbols[0]]}`);
                totalWin += this.betAmount * multipliers[symbols[0]];
            }
        }

        return totalWin;
    }

    private updateUI() {
        if (this.balanceLabel) {
            this.balanceLabel.string = `Balance: ${this.balance}`;
        }
        if (this.betLabel) {
            this.betLabel.string = `Bet: ${this.betAmount}`;
        }
    }

    // Optional: Methods to increase/decrease bet
    increaseBet() {
        if (this.betAmount < this.balance) {
            this.betAmount += 10;
            this.updateUI();
        }
    }

    decreaseBet() {
        if (this.betAmount > 10) {
            this.betAmount -= 10;
            this.updateUI();
        }
    }
}
