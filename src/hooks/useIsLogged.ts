import Cookies from "universal-cookie";

export const useIsLogged = () => {
    const cookies = new Cookies();
    const isLogged = cookies.get('is-logged') !== undefined;
    console.log('isLogged:', isLogged);  // Dodaj logowanie
    return isLogged;
};