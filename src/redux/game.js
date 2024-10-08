import { createSlice } from '@reduxjs/toolkit'
import twentyFiveFifty from "../blindsStructures/TwentyFiveFifty";

const initialState = localStorage.getItem("game") ? JSON.parse(localStorage.getItem("game")) : {
    title: "",
    subtitle: "",
    startTime: "00:00",
    isSoundEnabled: true,
    blindStructure: twentyFiveFifty,
    currentBlindLevel: 1,
    currency: "GBP",
    currencySymbol: "£",
    buyInPrice: 10,
    expenses: 0,
    numOfPlayers: 6,
    placesPaid: 3,
    prizes: [100, 75, 50],
}

const getCurrencySymbol = (currency) => {
    switch (currency) {
        case "GBP":
            return "£"
        case "USD":
            return "$"
        case "EUR":
            return "€"
        default:
            return "£"
    }
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        updateStartTime : (state, update) => {
            state.startTime = update.payload
        },
        changeBlindLevel: (state, update) => {
            state.currentBlindLevel = update.payload
        },
        addBlindLevel: (state, update) => {
            state.blindStructure.push(update.payload)
        },
        updateBlindStructure: (state, update) => {
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
        updatePrizes: (state, update) => {
            state.prizes = update.payload
        },
        updateCurrency: (state, update) => {
            state.currency = update.payload
            state.currencySymbol = getCurrencySymbol(update.payload)
        },
        updateTitle: (state, update) => {
            state.title = update.payload
        },
        updateSubtitle: (state, update) => {
            state.subtitle = update.payload
        },
    },
})

// Action creators are generated for each case reducer function
export const { updateStartTime, changeBlindLevel, addBlindLevel, updateBlindStructure, updateBlindLevel, deleteBlindLevel, updateNumOfPlayers, updateBuyinPrice, updateExpenses, updatePrizes, updateCurrency, updateTitle, updateSubtitle } = gameSlice.actions

export default gameSlice.reducer