import { createSlice } from '@reduxjs/toolkit'
import TwentyFiveFifty from "../game/TwentyFiveFifty";

const initialState = {
    blindLevel: 1,
    blindStructure: TwentyFiveFifty,
    count: 0,
    prizePool: 266
}

export const counterSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        restartGame: (state) => {
            state.blindLevel = initialState.blindLevel
        },
        changeBlindLevel: (state, update) => {
            state.blindLevel = update.payload
        },
        addBlindLevel: (state, update) => {
            state.blindStructure.push(update.payload)
        },
        updateBlindLevel: (state, update) => {
            state.blindStructure = update.payload
        },
        deleteBlindLevel: (state, update) => {
            state.blindStructure.splice(update.payload-1, 1)
        }
    },
})

// Action creators are generated for each case reducer function
export const { changeBlindLevel, restartGame, addBlindLevel, updateBlindLevel, deleteBlindLevel } = counterSlice.actions

export default counterSlice.reducer