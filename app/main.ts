const args = process.argv;
const pattern = args[3];

const inputLine: string = await Bun.stdin.text();

type Token = {
  type: 'literal' | 'special'
  value: string;
  pos: number;
}

const tokenizer = (pattern: string): Token[]  => {
  return Array.from(pattern).reduce((tok,char, i, arr) => {
    if (char === "\\" && i < arr.length + 1) {
      tok.push({
        type: 'special',
        value: char + arr[i + 1],
        pos: tok.length
      })
      arr[i + 1] = '';
    } else if (char !== '') {
      tok.push({
        type: "literal",
        value: char,
        pos: tok.length
      })
    } 
    return tok;
  }, [] as Token[])
}

function matchPattern(inputLine: string, pattern: string): any {
  const tokens = tokenizer(pattern)
  const tokLength = tokens.length

  return Array.from({ length: inputLine.length + tokLength + 1 }).some((_, start) => {
    return tokens.every(( token, i ) => {
      const char = inputLine[start + i];
      if (!char) return false;
      if (token.type == 'special') {
        switch (token.value) {
          case '\\d': 
            return char >= '0' && char <= '9';
          case '\\w': 
            return char >= 'a' && char <= 'z' 
              || char == '_' 
              || char >= '0' && char <= '9' 
              || char >= 'A' && char <= 'Z';
          default: return false
        }
      } else {
        return token.value === char;
      }
    })
  })
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
