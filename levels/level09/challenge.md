# Level 09 - Satellite Firmware Gate

- Category: Reverse engineering (WASM), Crypto concepts
- Difficulty: Very Hard

## What participants receive
- Download: `downloads/level09/level09.wasm`
- Optional helper: `downloads/level09/notes.txt`

## Objective
Recover the exact accepted passphrase from the WASM checker and derive the flag.

## Player-facing challenge
A fictional satellite simulator validates an operator phrase inside a WebAssembly blob.
The phrase is longer and validation uses layered byte transforms.

## Safety
Offline reverse challenge with fictional data and no executable side effects.
