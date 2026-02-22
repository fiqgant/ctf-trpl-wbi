const expected: i32[] = [113, 113, 66, 90, 84, 58, 120, 14, 14, 8, 253, 255, 192, 213, 144, 190, 165, 148, 157];

export function validate(input: string): i32 {
  if (input.length != expected.length) {
    return 0;
  }

  for (let i = 0; i < input.length; i++) {
    const transformed = input.charCodeAt(i) ^ ((i * 13 + 7) & 0xff);
    if (transformed != expected[i]) {
      return 0;
    }
  }

  return 1;
}
