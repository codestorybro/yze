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
    linkButton: "Czym są archetypy osobowości?",
    archetypesSheet: {
      heading: "Czym są archetypy osobowości?",
      intro: [
        "Każdy z nas działa inaczej - jedni napędzają innych energią, inni dają spokój, kierunek albo mądrość.",
        "Archetypy Yze pomagają Ci zrozumieć Twój naturalny styl działania w zespole i w życiu.",
      ],
      listHeading: "Poznając swój archetyp:",
      bullets: [
        "odkrywasz, co Cię napędza,",
        "uczysz się lepiej współpracować z innymi,",
        "i łatwiej budujesz równowagę między działaniem, relacjami i refleksją.",
      ],
      closing: [
        "Zrozumienie swojego archetypu pozwala Ci działać bardziej świadomie, spójnie i w zgodzie ze sobą.",
      ],
      archetypes: {
        flow: {
          title: "Flow",
          subtitle: "energia, która rusza wszystko",
          paragraphs: [
            "Zaraża innych entuzjazmem i motywuje do działania. Potrafi wprowadzić ruch tam, gdzie inni utknęli.",
            "Należy uważać, żeby nie wypalić się, gdy inni nie nadążają.",
          ],
          traitsLabel: "Cechy dominujące",
          traits: "entuzjastyczny, ekspresyjny",
        },
        buddy: {
          title: "Buddy",
          subtitle: "serce zespołu",
          paragraphs: [
            "Tworzy atmosferę, w której ludzie czują się dobrze. Wie, kto potrzebuje wsparcia, a kto po prostu rozmowy.",
            "Supermocą Buddy'ego jest budowanie więzi i poczucia wspólnoty. Należy pamiętać, że czasem warto też zadbać o siebie.",
          ],
          traitsLabel: "Cechy dominujące",
          traits: "wspierający, empatyczny",
        },
        visionary: {
          title: "Visionary",
          subtitle: "umysł, który widzi dalej",
          paragraphs: [
            "Ma pomysły, inspiruje innych, widzi kierunek zanim pojawi się mapa. Uwielbia tworzyć, ulepszać i pchać rzeczy do przodu.",
            "Należy uważać, żeby nie ugrzęznąć w wizjach bez działania.",
          ],
          traitsLabel: "Cechy dominujące",
          traits: "ambitny, decyzyjny",
        },
        guru: {
          title: "Guru",
          subtitle: "spokój i mądrość w chaosie",
          paragraphs: [
            "Analizuje, rozumie i pomaga innym złapać balans. Nie potrzebuje być w centrum - woli, gdy rzeczy po prostu działają.",
            "Siłą Guru jest perspektywa i spokój, który przywraca porządek.",
          ],
          traitsLabel: "Cechy dominujące",
          traits: "analityczny, dokładny",
        },
      },
    },
  },
  attributes: {
    detailsPlaceholder: "Szczegółowe informacje o atrybucie {{attributeName}} znajdują się tutaj.",
  },
}

export default pl
