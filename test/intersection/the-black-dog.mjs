import test from 'ava';
import { parseTheBlackDog } from '../../example/the-black-dog-parser.mjs';

test('the example for "the black dog" runs without crashing', t => {
  parseTheBlackDog();
  t.pass();
});