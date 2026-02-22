const expected: i32[] = [
  61, 112, 103, 68, 73, 126, 188, 165, 130, 161, 142,
  241, 168, 171, 78, 85, 68, 63, 46, 41, 237, 246, 26, 208, 137, 144, 135
];

function transform(ch: i32, index: i32): i32 {
  let v = (ch + (index * 9 + 11)) & 0xff;
  v = ((v << 1) | (v >> 7)) & 0xff;
  return v ^ ((0xa5 + index * 3) & 0xff);
}

export function validate(input: string): i32 {
  if (input.length != expected.length) {
    return 0;
  }

  let checksum = 0;
  for (let i = 0; i < input.length; i++) {
    const t = transform(input.charCodeAt(i), i);
    if (t != expected[i]) {
      return 0;
    }
    checksum = (checksum + ((t ^ i) & 0xff)) & 0xffff;
  }

  return checksum == 3440 ? 1 : 0;
}
