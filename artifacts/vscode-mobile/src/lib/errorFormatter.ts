interface ErrorHint {
  pattern: RegExp;
  hint: string | ((m: RegExpMatchArray) => string);
}

const PYTHON_HINTS: ErrorHint[] = [
  {
    pattern: /EOFError:\s*EOF when reading a line/i,
    hint: "⚑ No stdin provided — open the Input panel (Ctrl+Shift+I) and enter your input, then run again.",
  },
  {
    pattern: /EOFError/i,
    hint: "⚑ Unexpected end of input — your program tried to read more lines than were provided in the Input panel.",
  },
  {
    pattern: /ZeroDivisionError:\s*division by zero/i,
    hint: "⚑ Division by zero — check that your denominator is not 0 before dividing.",
  },
  {
    pattern: /RecursionError:\s*maximum recursion depth exceeded/i,
    hint: "⚑ Infinite recursion — your function calls itself forever. Verify your base case is reachable.",
  },
  {
    pattern: /ModuleNotFoundError:\s*No module named '([^']+)'/i,
    hint: (m: RegExpMatchArray) =>
      `⚑ Module '${m[1]}' is not available in this sandbox — only the Python standard library is supported here.`,
  },
  {
    pattern: /ImportError/i,
    hint: "⚑ Import failed — third-party packages are not supported. Use only the Python standard library.",
  },
  {
    pattern: /MemoryError/i,
    hint: "⚑ Out of memory — your program allocated too much memory. Check for large data structures or infinite loops.",
  },
  {
    pattern: /IndexError:\s*list index out of range/i,
    hint: "⚑ List index out of range — you're accessing an index that doesn't exist. Check your loop bounds and list length.",
  },
  {
    pattern: /KeyError/i,
    hint: "⚑ Key not found in dictionary — check that the key exists before accessing it (use .get() or 'in' to be safe).",
  },
  {
    pattern: /TypeError:\s*'NoneType' object/i,
    hint: "⚑ None value — you're using a variable that is None. Make sure the function or assignment returned a real value.",
  },
  {
    pattern: /AttributeError/i,
    hint: "⚑ Attribute error — you're accessing a property or method that doesn't exist on this object. Check the variable's type.",
  },
  {
    pattern: /ValueError:\s*invalid literal for int\(\)/i,
    hint: "⚑ Type conversion failed — the input isn't a valid integer. If reading from stdin, make sure the user enters a number.",
  },
  {
    pattern: /StopIteration/i,
    hint: "⚑ Iterator exhausted — next() was called but the iterator is empty. Verify your loop logic.",
  },
  {
    pattern: /UnboundLocalError/i,
    hint: "⚑ Variable used before assignment — you're reading a local variable that hasn't been assigned yet in this scope.",
  },
];

const JAVA_HINTS: ErrorHint[] = [
  {
    pattern: /java\.util\.NoSuchElementException/i,
    hint: "⚑ No input available — open the Input panel (Ctrl+Shift+I) and provide the expected stdin, then run again.",
  },
  {
    pattern: /java\.util\.InputMismatchException/i,
    hint: "⚑ Wrong input type — the value in the Input panel doesn't match what Scanner expects (e.g. text where a number is needed).",
  },
  {
    pattern: /java\.lang\.NullPointerException/i,
    hint: "⚑ Null pointer — you're accessing a method or field on a variable that is null. Initialize it before use.",
  },
  {
    pattern: /java\.lang\.ArrayIndexOutOfBoundsException/i,
    hint: "⚑ Array index out of bounds — you're accessing an index outside the array's length. Check your loop bounds.",
  },
  {
    pattern: /java\.lang\.StringIndexOutOfBoundsException/i,
    hint: "⚑ String index out of bounds — you're accessing a character position that doesn't exist in the string.",
  },
  {
    pattern: /java\.lang\.StackOverflowError/i,
    hint: "⚑ Stack overflow — infinite or too-deep recursion. Check that your base case is correct and reachable.",
  },
  {
    pattern: /java\.lang\.ClassCastException/i,
    hint: "⚑ Class cast error — you're casting an object to an incompatible type. Check your type assumptions.",
  },
  {
    pattern: /java\.lang\.NumberFormatException/i,
    hint: "⚑ Number format error — the string can't be parsed as a number. Verify the input is a valid numeric value.",
  },
  {
    pattern: /java\.lang\.OutOfMemoryError/i,
    hint: "⚑ Out of memory — your program used too much heap space. Check for large allocations or infinite loops.",
  },
  {
    pattern: /java\.lang\.ArithmeticException:\s*\/ by zero/i,
    hint: "⚑ Division by zero — check that your divisor is not 0 before dividing.",
  },
];

const CPP_HINTS: ErrorHint[] = [
  {
    pattern: /SIGSEGV|[Ss]egmentation fault/,
    hint: "⚑ Segmentation fault — your program accessed invalid memory. Common causes: null/dangling pointer, out-of-bounds array access.",
  },
  {
    pattern: /SIGABRT/,
    hint: "⚑ Program aborted — usually caused by a failed assert(), double-free, or heap corruption.",
  },
  {
    pattern: /SIGFPE/,
    hint: "⚑ Floating point exception — likely a division by zero or invalid floating-point operation.",
  },
  {
    pattern: /SIGBUS/,
    hint: "⚑ Bus error — misaligned memory access. Check pointer arithmetic.",
  },
];

const JS_HINTS: ErrorHint[] = [
  {
    pattern: /RangeError:\s*Maximum call stack size exceeded/i,
    hint: "⚑ Stack overflow — infinite or too-deep recursion. Make sure your recursive function has a reachable base case.",
  },
  {
    pattern: /TypeError:\s*Cannot read propert(?:y|ies) of (null|undefined)/i,
    hint: "⚑ Null/undefined error — you're accessing a property on a value that doesn't exist yet. Check for null before accessing.",
  },
  {
    pattern: /ReferenceError:\s*(\w+) is not defined/i,
    hint: (m: RegExpMatchArray) =>
      `⚑ '${m[1]}' is not defined — check spelling, scope, and that it's declared before use.`,
  },
  {
    pattern: /SyntaxError/i,
    hint: "⚑ Syntax error — a typo or missing bracket/semicolon is preventing parsing. Check the line indicated above.",
  },
];

const GO_HINTS: ErrorHint[] = [
  {
    pattern: /runtime error: index out of range/i,
    hint: "⚑ Slice/array index out of range — you're accessing an index beyond the slice length. Check your loop bounds.",
  },
  {
    pattern: /runtime error: invalid memory address or nil pointer dereference/i,
    hint: "⚑ Nil pointer dereference — you're using a pointer that hasn't been initialized. Check for nil before dereferencing.",
  },
  {
    pattern: /goroutine \d+ \[running\]/i,
    hint: "⚑ Panic — the program crashed at runtime. Read the stack trace above to find the failing line.",
  },
];

const RUST_HINTS: ErrorHint[] = [
  {
    pattern: /thread 'main' panicked at 'index out of bounds/i,
    hint: "⚑ Index out of bounds — you're accessing a slice/vector position that doesn't exist. Check the length before indexing.",
  },
  {
    pattern: /thread 'main' panicked at 'attempt to divide by zero/i,
    hint: "⚑ Division by zero — check that your divisor is not 0.",
  },
  {
    pattern: /thread 'main' panicked at 'called `Option::unwrap\(\)` on a `None`/i,
    hint: "⚑ Unwrap on None — use if let, match, or unwrap_or to handle the None case safely.",
  },
  {
    pattern: /thread 'main' panicked at 'called `Result::unwrap\(\)` on an `Err`/i,
    hint: "⚑ Unwrap on Err — use match or the ? operator to handle the error case instead.",
  },
  {
    pattern: /thread 'main' panicked/i,
    hint: "⚑ Runtime panic — read the message above for details. Use match/if let to handle edge cases safely.",
  },
];

function matchHint(line: string, hints: ErrorHint[]): string | null {
  for (const entry of hints) {
    const m = line.match(entry.pattern);
    if (m) {
      return typeof entry.hint === "function" ? entry.hint(m) : entry.hint;
    }
  }
  return null;
}

export function getErrorHint(line: string, language: string): string | null {
  const lang = language.toLowerCase();

  if (lang === "python") return matchHint(line, PYTHON_HINTS);
  if (lang === "java")   return matchHint(line, JAVA_HINTS);
  if (lang === "cpp" || lang === "c") return matchHint(line, CPP_HINTS);
  if (lang === "javascript" || lang === "typescript") return matchHint(line, JS_HINTS);
  if (lang === "go")   return matchHint(line, GO_HINTS);
  if (lang === "rust") return matchHint(line, RUST_HINTS);

  return null;
}

export function getStatusHint(statusId: number): string | null {
  switch (statusId) {
    case 5:  return "⚑ Time limit exceeded — your program ran too long. Look for infinite loops or O(n²)+ algorithms on large inputs.";
    case 7:  return "⚑ Memory limit exceeded — your program used too much memory. Check for large arrays or memory leaks.";
    case 8:  return "⚑ Output limit exceeded — your program printed too much output. You may have an infinite print loop.";
    case 11: return "⚑ Segmentation fault — null pointer or out-of-bounds memory access.";
    case 12: return "⚑ Execution error — the program was forcefully terminated. Check for infinite loops or excessive resource use.";
    default: return null;
  }
}
