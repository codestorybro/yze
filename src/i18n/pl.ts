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
    selectTraitsInstruction: "Za co chcesz docenić dzisiaj {{name}}?",
    commentTitle: "Dodaj opcjonalny komentarz",
    commentPlaceholder: "Wpisz tutaj swój komentarz...",
    anonymousToggleLabel: "Wyślij anonimowo",
    commentCharCounter: "{{count}} / {{max}} znaków",
    noResults: "Brak wyników",
    suggestion: "Sprawdź czy tekst jest poprawny, lub spróbuj szukać po innych frazach",
    searchForUser: "Szukaj użytkownika",
    appreciatedToday: "Doceniono dzisiaj",
    cancel: "Anuluj",
    back: "Wstecz",
    next: "Dalej",
    appreciate: "Doceń",
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
    sortingSelector: {
      mostAppreciative: "Top doceniających",
      flow: "Top doceniani jako Flow",
      buddy: "Top doceniani jako Buddy",
      rise: "Top doceniani jako Rise",
      guru: "Top doceniani jako Guru",
    },
    itsYou: "To Ty!",
  },
  userScreen: {
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
          subtitle: "Mięśnie, które ruszają wszystko",
          paragraphs: [
            "Zaraża innych entuzjazmem i motywuje do działania. Potrafi wprowadzić ruch tam, gdzie inni utknęli.",
            "Siła: energia, która inspiruje innych do działania.",
            "Shadow side: może działać impulsywnie lub wypalać się, gdy skupia się tylko na emocjach i tempie.",
          ],
          traitsLabel: "Cechy",
          traits: "entuzjastyczny, ekspresyjny",
        },
        buddy: {
          title: "Buddy",
          subtitle: "Serce zespołu",
          paragraphs: [
            "Tworzy atmosferę, w której ludzie czują się dobrze. Wie, kto potrzebuje wsparcia, a kto po prostu rozmowy.",
            "Siła: budowanie więzi i pozytywnej atmosfery wokół siebie.",
            "Shadow side: może unikać konfrontacji i zbyt mocno dostosowywać się do innych kosztem siebie.",
          ],
          traitsLabel: "Cechy",
          traits: "wspierający, empatyczny",
        },
        rise: {
          title: "Rise",
          subtitle: "Oczy, które widzą dalej",
          paragraphs: [
            "Ma pomysły, inspiruje innych, widzi kierunek zanim pojawi się mapa. Uwielbia tworzyć, ulepszać i pchać rzeczy do przodu.",
            "Siła: zdolność dostrzegania kierunku i inspirowania zmian.",
            "Shadow side: może gubić się w pomysłach i tracić kontakt z codziennością lub detalami.",
          ],
          traitsLabel: "Cechy",
          traits: "ambitny, decyzyjny",
        },
        guru: {
          title: "Guru",
          subtitle: "Umysł, który zapewnia równowagę",
          paragraphs: [
            "Analizuje, rozumie i pomaga innym złapać balans. Nie potrzebuje być w centrum - woli, gdy rzeczy po prostu działają.",
            "Siła: spokój i mądrość, które pomagają innym odnaleźć balans.",
            "Shadow side: może stać się zbyt zdystansowany lub nadmiernie krytyczny wobec emocji i chaosu innych.",
          ],
          traitsLabel: "Cechy",
          traits: "analityczny, dokładny",
        },
      },
    },
  },
  attributes: {
    details: {
      heading: "Szczegóły: {{label}}",
      totalScoreLabel: "Wynik",
      error: "Nie udało się pobrać szczegółów. Spróbuj ponownie.",
      traitScoreSuffix: "pkt",
    },
    comments: {
      heading: "Komentarze",
      anonymousAuthor: "Anonimowy",
      error: "Nie udało się pobrać komentarzy. Spróbuj ponownie.",
      noComments: "Brak komentarzy w tym okresie.",
    },
  },
}

export default pl
