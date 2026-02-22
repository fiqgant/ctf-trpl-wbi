# Level 07 - Reused Packet Pad

- Category: Crypto, File analysis
- Difficulty: Hard

## What participants receive
- Download: `downloads/level07/packets.json`

## Objective
Recover the secret message from reused XOR keystream packets, then derive the level flag.

## Player-facing challenge
Two telemetry packets were encrypted with the same one-time pad stream by mistake. One plaintext is known.

## Safety
Offline cryptanalysis on static data only. No brute-force requirement.
