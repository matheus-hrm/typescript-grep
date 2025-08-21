const args = process.argv;
const pattern = args[3];

const inputLine: string = await Bun.stdin.text();

type Token = {
  type: "literal" | "special" | "charset" | "negCharSet" | "stringMatch";
  value: string;
  pos: number;
};

const tokenizer = (pattern: string): any => {
  let i = 0;
  return Array.from({ length: pattern.length }).reduce((tokens: Token[]) => {
    if (i >= pattern.length) return tokens;

    const char = pattern[i];

    if (char === "\\" && i + 1 < pattern.length) {
      tokens.push({
        type: "special",
        value: char + pattern[i + 1],
        pos: tokens.length,
      });
      i += 2;
    } else if (char === "[") {
      const end = pattern.indexOf("]", i);
      if (end === -1) throw new Error("Unclosed character set");

      const set = pattern.slice(i + 1, end);
      tokens.push({
        type: set.startsWith("^") ? "negCharSet" : "charset",
        value: set.startsWith("^") ? set.slice(1) : set,
        pos: tokens.length,
      });
      i = end + 1;
    } else if (char === "^") {
      const stringToMatch = pattern.slice(i + 1);
      tokens.push({
        type: "stringMatch",
        value: stringToMatch,
        pos: tokens.length,
      });
      i += stringToMatch.length + 1; // +1 for the '^'
    } else if (char !== "") {
      tokens.push({
        type: "literal",
        value: char,
        pos: tokens.length,
      });
      i += 1;
    }
    return tokens;
  }, [] as Token[]);
};

function matchPattern(inputLine: string, pattern: string): any {
  const tokens = tokenizer(pattern);
  const tokLength = tokens.length;

  return Array.from({ length: inputLine.length + tokLength + 1 }).some(
    (_, start) => {
      return tokens.every((token: Token, i: number) => {
        const char = inputLine[start + i];
        if (!char) return false;
        if (token.type == "special") {
          switch (token.value) {
            case "\\d":
              return char >= "0" && char <= "9";
            case "\\w":
              return (
                (char >= "a" && char <= "z") ||
                char == "_" ||
                (char >= "0" && char <= "9") ||
                (char >= "A" && char <= "Z")
              );
            default:
              return false;
          }
        } else if (token.type === "charset") {
          return token.value.includes(char);
        } else if (token.type === "negCharSet") {
          return !token.value.includes(char);
        } else if (token.type === "stringMatch") {
          const stringToMatch = token.value;
          const end = start + i + stringToMatch.length;
          return inputLine.slice(start + i, end) === stringToMatch;
        } else {
          return token.value === char;
        }
      });
    },
  );
}

//   switch (pattern.length) {
//     case 1:
//       return inputLine.includes(pattern);
//     case 2:
//       if (pattern.startsWith("\\")) {
//         switch (pattern) {
//           case "\\d":
//             return inputLine.split("").some((c) => c >= "0" && c <= "9");
//           case "\\w":
//             return inputLine.split("").some((c) => c >= "a" && c <= 'z' || c == "_" || c >= "0" && c <= "9" || c >= "A" && c <= "Z");
//           default:
//             throw new Error(`Unhandled pattern: ${pattern}`);
//         }
//       } else if (pattern.startsWith("[") && pattern.endsWith("]")) {
//         if (pattern.startsWith("[^")) {
//           const charSet = pattern.slice(2, -1);
//           return inputLine.split("").some((c) => !charSet.includes(c));
//         } else {
//           const charSet = pattern.slice(1, -1);
//           return inputLine.split("").every((c) => charSet.includes(c));
//         }
//       }
//       break
//     default:
//       throw new Error(`Unrecognized pattern: ${pattern}`);
//   }
// }

if (args[2] !== "-E") {
  console.log("Expected first argument to be '-E'");
  process.exit(1);
}

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.error("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
if (matchPattern(inputLine, pattern)) {
  console.log("Pattern matched successfully!");
  process.exit(0);
} else {
  process.exit(1);
}
