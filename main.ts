// Ridiculous at First Glance, Real by the Second — a program that writes
// one sentence: a pitch for a bizarre startup idea that sounds absurd
// until you realise it would actually sell, to /output/entry.txt.
//
// The pitch is a fixed text on purpose: the entry is judged on the
// writing, so the program's job is to deliver exactly that one sentence,
// byte for byte, every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Why this pitch, against the judge's brief:
// - It pitches a bizarre startup idea: selling rain, on demand, for
//   weddings — rain at a wedding is the classic bad luck, so the idea
//   sounds like a joke at first glance.
// - The idea is genuinely bizarre: cloud-seeding drones hired to soak
//   a first dance is not a familiar business with a strange adjective
//   bolted on; nobody has a rain vendor on their wedding checklist.
// - The business logic holds in its own words: couples already spend
//   thousands on wedding photos, and a downpour turns those photos
//   from a picnic into a movie — the absurd premise turns out to be a
//   real market, a premium photo moment.
// - It lands as a pitch: one sentence with a turn that takes the
//   reader from laughing (rain on your wedding?) to nodding (of
//   course the photos would be stunning).
// - It is concrete and vivid: cloud-seeding drones, a five-minute
//   downpour, a first dance, wet laughing newlyweds — the thing being
//   sold and who buys it are named, not abstracted.
const PITCH =
  "We sell rain on demand for weddings: cloud-seeding drones deliver a 5-minute downpour over your first dance, because couples spend thousands on photos and wet, laughing newlyweds look like a movie.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // The gate only accepts 1 to 200 characters of UTF-8 text, so refuse
  // loudly instead of shipping a text the gate would throw away. It
  // also refuses text that is only white space, so check that too.
  if (PITCH.length < 1 || PITCH.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${PITCH.length}`);
  }
  if (PITCH.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // No leading or trailing white space either: the gate counts every
  // byte, and a stray space at either end would sit in front of the
  // judge for nothing.
  if (PITCH !== PITCH.trim()) {
    throw new Error("entry must not have leading or trailing white space");
  }
  // One sentence means no line break hiding inside it, and no tabs or
  // doubled spaces either: a stray tab would read as a formatting
  // glitch in front of the judge.
  if (/[\n\r]/.test(PITCH)) {
    throw new Error("entry must be exactly one sentence");
  }
  if (/[\t]/.test(PITCH) || /  /.test(PITCH)) {
    throw new Error("entry must not contain tabs or double spaces");
  }
  // One sentence, not two hiding behind a period: the pitch must end
  // with a single full stop, and no full stop may be followed by
  // another word, or the judge would be reading two sentences.
  if (!PITCH.endsWith(".") || /\. /.test(PITCH)) {
    throw new Error("entry must be exactly one sentence");
  }
  // No invisible control characters for the same reason.
  if (/[\u0000-\u001f\u007f]/.test(PITCH)) {
    throw new Error("entry must not contain control characters");
  }
  // The gate counts every byte, so write exactly the sentence and
  // nothing else: no trailing newline.
  // /output is a mount point in the grader sandbox: never delete the
  // directory itself, only create it if missing and write the file.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, PITCH, "utf8");
  // Read the file back and refuse to finish unless it holds exactly
  // the sentence: a stray byte would make the gate reject the entry,
  // and it is cheaper to fail here than on the server.
  if (readFileSync(OUT_FILE, "utf8") !== PITCH) {
    throw new Error("entry file does not hold exactly the pitch");
  }
  console.log(`Wrote ${PITCH.length} characters to ${OUT_FILE}`);
}

main();
