export const selectFirstName = state =>state.user.firstName;
export const selectLastName = state =>state.user.lastName;
export const selectType = state =>state.user.type;
export const selectEmail = state =>state.user.email;

export const selectUser = state => selectType(state) && 
        selectEmail(state) && 
        selectFirstName(state) &&
        selectLastName(state ) ? state.user : null;