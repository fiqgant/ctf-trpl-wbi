# Level 06 - Lab Door Microcontroller

- Category: Reverse engineering (WASM)
- Difficulty: Medium

## What participants receive
- Download: `downloads/level06/level06.wasm`
- Optional helper: `downloads/level06/notes.txt`

## Objective
Reverse the WASM validator logic, recover the accepted passphrase, and derive the level flag.

## Player-facing challenge
A training microcontroller validator was compiled into WebAssembly. The door opens only for one exact passphrase.

## Safety
Pure offline reverse engineering of a provided binary. No live target, no shelling out, no network actions.
