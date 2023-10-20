import Tab1Component from "./Tab1Blinds";
import tab2Component from "./Tab2Payouts";
import tab3Component from "./Tab3GameSetup";

export const getTab1 = () => {
    return                             {
        label: 'Blinds',
        key: '1',
        children: Tab1Component(),
    }
}

export const getTab2 = () => {
    return                             {
        label: 'Payouts',
        key: '2',
        children: tab2Component(),
    }
}

export const getTab3 = () => {
    return                             {
        label: 'Game Setup',
        key: '3',
        children: tab3Component(),
    }
}
