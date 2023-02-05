import test from 'ava';
import { parseChordProgression } from '../../example/chord-progression-parser.mjs';

test('the chord progression parser runs without crashing', t => {
  parseChordProgression();
  t.pass();
});