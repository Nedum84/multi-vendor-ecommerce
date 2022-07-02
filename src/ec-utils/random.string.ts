import randomstring from "randomstring";

// alphanumeric - [0-9 a-z A-Z]
// alphabetic - [a-z A-Z]
// numeric - [0-9]
// hex - [0-9 a-f]
// binary - [01]
// octal - [0-7]
// custom - any given characters

export const generateChars = (
  length = 12,
  charset = "alphanumeric",
  capitalization?: "uppercase" | "lowercase",
  readable = true
) => {
  return randomstring.generate({ length, readable, charset, capitalization });
};
