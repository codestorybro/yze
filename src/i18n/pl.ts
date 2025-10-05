import { Translations } from "./en"

const pl: Translations = {
  common: {
    logOut: "Wyloguj się",
    confirm: "Potwierdź",
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
  searchScreen: {
    whoToAppreciate: "Kogo chcesz dzisiaj docenić?",
    noResults: "Brak wyników",
    suggestion: "Sprawdź czy tekst jest poprawny, lub spróbuj szukać po innych frazach",
    searchForUser: "Szukaj użytkownika",
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
  settingsScreen: {
    darkMode: "Tryb ciemny",
    userSettings: "Ustawienia użytkownika",
    manageGroup: "Zarządzaj grupą",
  },
  homeScreen: {
    periodSelector: {
      weekly: "Widok tygodniowy",
      monthly: "Widok miesięczny",
      yearly: "Widok roczny",
      overall: "Cały okres",
      range: {
        overall: "Cały okres",
        weekCurrent: "Obecny tydzień",
        monthCurrent: "Obecny miesiąc",
        yearCurrent: "Obecny rok",
        navigatePrevious: "Przejdź do poprzedniego okresu",
        navigateNext: "Przejdź do następnego okresu",
      },
    },
  },
  attributes: {
    detailsPlaceholder: "Szczegółowe informacje o atrybucie {{attributeName}} znajdują się tutaj.",
  },
}

export default pl
