import { createSlice } from '@reduxjs/toolkit'
import twentyFiveFifty from "../blindsStructures/TwentyFiveFifty";

const initialState = {
    startTime: "",
    isSoundEnabled: true,

    blindStructure: twentyFiveFifty,
    currentBlindLevel: 1,
    
    currency: "GBP",
    buyInPrice: 10,
    expenses: 0,
    numOfPlayers: 6,
    placesPaid: 3,
    prizes: [100,75, 50],
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        restartGame: (state) => {
            //state.currentBlindLevel = initialstate.currentBlindLevel
        },
        changeBlindLevel: (state, update) => {
            state.currentBlindLevel = update.payload
        },
        addBlindLevel: (state, update) => {
            state.blindStructure.push(update.payload)
        },
        updateBlindLevel: (state, update) => {
            state.blindStructure = update.payload
        },
        deleteBlindLevel: (state, update) => {
            state.blindStructure.splice(update.payload-1, 1)
        },
        updateNumOfPlayers: (state, update) => {
            state.numOfPlayers = update.payload
        },
        updateBuyinPrice: (state, update) => {
            state.buyInPrice = update.payload
        },
        updateExpenses: (state, update) => {
            state.expenses = update.payload
        },

    },
})

// Action creators are generated for each case reducer function
export const { changeBlindLevel, restartGame, addBlindLevel, updateBlindLevel, deleteBlindLevel, updateNumOfPlayers, updateBuyinPrice, updateExpenses } = gameSlice.actions

export default gameSlice.reducer