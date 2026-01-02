import { Translations } from "./en"

const pl: Translations = {
  common: {
    logOut: "Wyloguj się",
    confirm: "Potwierdź",
    cancel: "Anuluj",
    close: "Zamknij",
    submit: "Wyślij",
  },
  loginScreen: {
    emailFieldPlaceholder: "Email",
    passwordFieldPlaceholder: "Hasło",
    login: "Zaloguj",
    dontHaveAnAccount: "Nie masz konta? ",
    signUp: "Zarejestruj się",
    theSocialMirror: "The Social Mirror",
    emailRequired: "Email jest wymagany",
    passwordRequired: "Hasło jest wymagane",
    emailInvalid: "Proszę wprowadzić prawidłowy adres email",
    passwordTooShort: "Hasło musi mieć co najmniej 8 znaków.",
    passwordTooLong: "Hasło może mieć maksymalnie 128 znaków.",
    emailTooLong: "Email może mieć maksymalnie 254 znaki.",
  },
  settingsScreen: {
    title: "Ustawienia",
    account: "Konto",
    email: "Email",
    name: "Imię",
    notSet: "Nie ustawiono",
    appearance: "Wygląd",
    darkMode: "Tryb ciemny",
    language: "Język",
    logOutConfirmTitle: "Wyloguj się",
    logOutConfirmMessage: "Czy na pewno chcesz się wylogować?",
  },
  homeScreen: {
    tapToRate: "Dotknij awatara {{name}}, aby ocenić dzień",
    howWasYourDay: "Jak minął Wam dzień z {{name}}?",
    rateYourDay: "Oceń Wasz wspólny dzień",
    addComment: "Dodaj komentarz (opcjonalnie)",
    commentPlaceholder: "Jak się dziś czułeś/aś?",
    noRating: "Brak oceny dla tego dnia",
    noRatingSubtext: "{{name}} jeszcze nie ocenił/a tego dnia",
    moods: {
      happy: "Szczęśliwy",
      loving: "Zakochany",
      average: "Przeciętny",
      bored: "Znudzony",
      sad: "Smutny",
      angry: "Zły",
    },
    feltMood: "{{name}} czuł/a się {{mood}}",
    comment: "Komentarz",
  },
  errorScreen: {
    title: "Coś poszło nie tak!",
    friendlySubtitle:
      "To jest ekran, który użytkownicy zobaczą w produkcji, gdy wystąpi błąd. Będziesz chciał dostosować tę wiadomość (znajdującą się w `app/i18n/pl.ts`) i prawdopodobnie też układ (`app/screens/ErrorScreen`). Jeśli chcesz to całkowicie usunąć, sprawdź `app/app.tsx` dla komponentu <ErrorBoundary>.",
    reset: "RESETUJ APLIKACJĘ",
  },
  emptyStateComponent: {
    generic: {
      heading: "Tak pusto... tak smutno",
      content:
        "Nie znaleziono jeszcze danych. Spróbuj kliknąć przycisk, aby odświeżyć lub przeładować aplikację.",
      button: "Spróbujmy tego ponownie",
    },
  },
}

export default pl
