import { createSlice } from '@reduxjs/toolkit'
import TwentyFiveFifty from "../game/TwentyFiveFifty";

const initialState = {
    blindLevel: 1,
    blindStructure: TwentyFiveFifty,
    count: 0,
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
        }
    },
})

// Action creators are generated for each case reducer function
export const { changeBlindLevel, restartGame, addBlindLevel } = counterSlice.actions

export default counterSlice.reducer