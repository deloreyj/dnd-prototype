import { z } from 'zod';

const diceSchema = z.object({
	sides: z.number(),
});

export class Dice {
    sides: number;

	constructor(sides: number) {
        this.sides = sides;
	}

    rollDice() {
        return Math.floor(Math.random() * this.sides) + 1;
    }

    static rolld4() {
        return new Dice(4).rollDice();
    }

    static rolld6() {
        return new Dice(6).rollDice();
    }

    static rolld8() {
        return new Dice(8).rollDice();
    }

    static rolld10() {
        return new Dice(10).rollDice();
    }

    static rolld12() {
        return new Dice(12).rollDice();
    }

    static rolld20() {
        return new Dice(20).rollDice();
    }

    static rolld100() {
        return new Dice(100).rollDice();
    }

    static rollXdY(numDice: number, numSides: number) {
        let result = 0;
        for (let i = 0; i < numDice; i++) {
            result += new Dice(numSides).rollDice();
        }
    }

    /*TODO - nice to have?
    evalDiceRollExpression(diceRollExpression: string) {
        //example: 3d6+7
    }*/
}