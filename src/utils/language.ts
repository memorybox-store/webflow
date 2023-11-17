import { OTHER_LANGUAGES } from "../constants/languages";

const format = (language: string, url: string) => {
  return `${language}-${url}`;
}

export const multiLanguageUrl = (url: string, asPath: boolean = false) => {

  const otherLanguages = OTHER_LANGUAGES.map(
    (language: string) => asPath
      ? `/${format(language, url)}`
      : format(language, url)
  );

  return [
    asPath ? `/${url}` : url,
    ...otherLanguages
  ];
}